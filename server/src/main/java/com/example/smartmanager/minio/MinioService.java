package com.example.smartmanager.minio;

import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name:smartmanager}")
    private String bucketName;

    @Value("${minio.public-endpoint:http://localhost:9000}")
    private String publicEndpoint;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".jsp", ".php", ".html", ".htm", ".svg"
    );

    @PostConstruct
    public void initBucket() {
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Đã tạo mới MinIO bucket: {}", bucketName);
            }

            // Chỉ cho phép đọc trực tiếp thư mục ảnh đại diện (images/*), thư mục tài liệu (documents/*) ở chế độ Private
            String policyJson = """
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Principal": {"AWS": ["*"]},
                      "Action": ["s3:GetObject"],
                      "Resource": ["arn:aws:s3:::%s/images/*"]
                    }
                  ]
                }
                """.formatted(bucketName);

            minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(bucketName)
                            .config(policyJson)
                            .build()
            );
            log.info("Đã thiết lập Private Document policy cho MinIO bucket: {}", bucketName);
        } catch (Exception e) {
            log.error("Lỗi khi khởi tạo MinIO bucket: {}", e.getMessage(), e);
        }
    }

    /**
     * Tải ảnh lên MinIO (kiểm tra định dạng ảnh an toàn)
     */
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File ảnh tải lên không được để trống");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPEG, PNG, WEBP, GIF.");
        }
        return upload(file, "images/", false);
    }

    /**
     * Tải tài liệu/file lên MinIO ở chế độ Private và trả về Presigned URL
     */
    public String uploadFile(MultipartFile file) {
        return upload(file, "documents/", true);
    }

    /**
     * Sinh liên kết tải tài liệu có chữ ký bảo mật (Presigned URL) với thời hạn hiệu lực
     */
    public String generatePresignedDownloadUrl(String objectName, int expiryMinutes) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(expiryMinutes, TimeUnit.MINUTES)
                            .build()
            );
        } catch (Exception e) {
            log.error("Lỗi tạo Presigned URL cho {}: {}", objectName, e.getMessage());
            return publicEndpoint + "/" + bucketName + "/" + objectName;
        }
    }

    private String upload(MultipartFile file, String folder, boolean usePresigned) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File tải lên không được để trống");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        // Chống Path Traversal và ký tự đặc biệt nguy hiểm
        String sanitized = originalFilename
                .replace("..", "")
                .replace("/", "_")
                .replace("\\", "_")
                .replaceAll("[^a-zA-Z0-9._\\-\\p{L}]", "_");

        String lowerName = sanitized.toLowerCase();
        for (String ext : BLOCKED_EXTENSIONS) {
            if (lowerName.endsWith(ext)) {
                throw new IllegalArgumentException("Loại tệp tin " + ext + " bị từ chối vì lý do an toàn bảo mật.");
            }
        }

        try {
            String objectName = folder + UUID.randomUUID() + "_" + sanitized;

            try (InputStream is = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .stream(is, file.getSize(), -1)
                                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                                .build()
                );
            }

            if (usePresigned) {
                return generatePresignedDownloadUrl(objectName, 15);
            }

            String fileUrl = publicEndpoint + "/" + bucketName + "/" + objectName;
            log.info("Tải file lên MinIO thành công! URL: {}", fileUrl);
            return fileUrl;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi tải file lên MinIO: {}", e.getMessage(), e);
            throw new RuntimeException("Tải file lên MinIO thất bại: " + e.getMessage());
        }
    }
}
