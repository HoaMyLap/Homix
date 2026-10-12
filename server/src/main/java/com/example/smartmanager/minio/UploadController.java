package com.example.smartmanager.minio;

import com.example.smartmanager.auth.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final MinioService minioService;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để tải ảnh lên."));
        }
        try {
            String imageUrl = minioService.uploadImage(file);
            return ResponseEntity.ok(Map.of(
                "url", imageUrl,
                "uploaderId", userPrincipal.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/file")
    public ResponseEntity<?> uploadFile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để tải tài liệu lên."));
        }
        try {
            String fileUrl = minioService.uploadFile(file);
            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "name", file.getOriginalFilename() != null ? file.getOriginalFilename() : "document",
                "size", file.getSize(),
                "type", file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                "uploaderId", userPrincipal.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/presigned")
    public ResponseEntity<?> getPresignedUrl(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("objectName") String objectName) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để tải tài liệu."));
        }
        String signedUrl = minioService.generatePresignedDownloadUrl(objectName, 15);
        return ResponseEntity.ok(Map.of("url", signedUrl));
    }
}
