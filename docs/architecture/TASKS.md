# DANH SÁCH NHIỆM VỤ THỰC THI TOÀN DIỆN (ACTIONABLE TASK CHECKLIST)
# DỰ ÁN: HOMIX v2.0 - NỀN TẢNG QUẢN LÝ DỰ ÁN THÔNG MINH TÍCH HỢP AI

> **Tài liệu tham chiếu:** [`docs/KE_HOACH_HOAN_THIEN_HOMIX_V2.md`](docs/KE_HOACH_HOAN_THIEN_HOMIX_V2.md)  
> **Hướng dẫn cập nhật tiến độ:** Khi bắt đầu làm một task, đổi `[ ]` thành `[/]`. Khi hoàn thành và đã kiểm tra đạt nghiệm thu, đổi thành `[x]`.  
> **Tổng số Task:** 16 Tasks lớn (bao gồm 64 Sub-tasks chi tiết) trải dài qua 4 Sprints.

---

## 📊 BẢNG THEO DÕI TIẾN ĐỘ TỔNG THỂ

| Sprint | Trọng tâm | Trạng thái | Số Task Hoàn Thành / Tổng số | Tiến độ |
| :--- | :--- | :---: | :---: | :---: |
| **Sprint 1** | Bảo Mật & Đồng Bộ CSDL 21 Bảng (Critical) | `Hoàn thành` | 5 / 5 | 100% |
| **Sprint 2** | Chuẩn Hóa Nghiệp Vụ & Hàng Đợi AI (High) | `Hoàn thành` | 4 / 4 | 100% |
| **Sprint 3** | Tái Cấu Trúc Frontend & Sửa 322 ESLint (Medium) | `Hoàn thành` | 4 / 4 | 100% |
| **Sprint 4** | Kiểm Thử Tự Động, CI/CD & Hồ Sơ Khóa Luận (Final) | `Hoàn thành` | 3 / 3 | 100% |
| **TỔNG CỘNG**| **Toàn bộ hệ thống Homix v2.0** | `Hoàn thành` | **16 / 16** | **100%** |

---

## 🛡️ SPRINT 1: BẢO MẬT & ĐỒNG BỘ CSDL 21 BẢNG (CRITICAL)

### [x] Task 1.1: Khắc phục Lỗ hổng Thanh toán & Xác thực Chữ ký số Webhook
- **Mức độ ưu tiên:** CRITICAL
- **Tệp cần sửa:**
  - `server/src/main/java/com/example/smartmanager/config/SecurityConfig.java` (Dòng 48)
  - `server/src/main/java/com/example/smartmanager/payments/PaymentController.java` (Dòng 23-59, 100-150)
  - `server/src/main/java/com/example/smartmanager/payments/PaymentService.java` (Dòng 194-245)
- **Các bước thực hiện:**
  - [x] **1.1.1**: Thu hẹp phạm vi `permitAll()` trong `SecurityConfig.java`. Chỉ mở công khai cho callback/IPN:
    ```java
    .requestMatchers(
        "/api/auth/**",
        "/api/contact/**",
        "/api/payments/vnpay/callback",
        "/api/payments/momo/ipn",
        "/error"
    ).permitAll()
    ```
  - [x] **1.1.2**: Trong `PaymentController.java`, bảo vệ các API quản lý đơn hàng bằng JWT:
    - Bắt buộc `@AuthenticationPrincipal UserPrincipal userPrincipal` cho `POST /api/payments/create-order`.
    - Xóa bỏ hoặc vô hiệu hóa endpoint công khai `POST /api/payments/confirm-payment` (chỉ cho phép gọi nội bộ hoặc bởi Admin).
  - [x] **1.1.3**: Trong `PaymentService.java`, hiện thực hàm đối soát chữ ký số VNPay `verifyVnPayHash(Map<String, String> params, String secureHash)` sử dụng `HmacSHA512` và bí mật `vnpHashSecret`.
  - [x] **1.1.4**: Trong `PaymentController.vnpayCallback`: Kiểm tra chữ ký số trước khi cập nhật đơn hàng; nếu chữ ký không khớp, trả về `HTTP 400 Bad Request` và ghi log cảnh báo tấn công.
  - [x] **1.1.5**: Đối với MoMo và PayPal: Thêm logic kiểm tra chữ ký MoMo hoặc gọi sang PayPal REST API capture trước khi set `COMPLETED`.
- **Lệnh kiểm tra & Nghiệm thu:**
  ```bash
  # Test 1: Gọi confirm-payment mà không có JWT -> Phải trả về 401 hoặc 403
  curl -X POST http://localhost:8000/api/payments/confirm-payment -H "Content-Type: application/json" -d "{\"orderId\":\"test-id\"}"

  # Test 2: Giả lập VNPay callback với mã fake không có chữ ký hợp lệ -> Phải trả về FAILED/400
  curl "http://localhost:8000/api/payments/vnpay/callback?vnp_TxnRef=HOMIX_123&vnp_ResponseCode=00&vnp_SecureHash=fakehash"
  ```
- **Tiêu chí hoàn thành:** Không còn cách nào kích hoạt VIP miễn phí mà không có thanh toán thực tế và chữ ký số hợp lệ.

---

### [x] Task 1.2: Bảo vệ Lưu trữ MinIO & Cấp Presigned URL Tải tệp
- **Mức độ ưu tiên:** CRITICAL
- **Tệp cần sửa:**
  - `server/src/main/java/com/example/smartmanager/config/SecurityConfig.java` (Dòng 48)
  - `server/src/main/java/com/example/smartmanager/minio/UploadController.java` (Toàn bộ file)
  - `server/src/main/java/com/example/smartmanager/minio/MinioService.java` (Dòng 40-65, 81-110)
- **Các bước thực hiện:**
  - [x] **1.2.1**: Trong `SecurityConfig.java`: Loại bỏ `/api/upload/**` khỏi `permitAll()`, yêu cầu xác thực JWT.
  - [x] **1.2.2**: Trong `MinioService.initBucket()`: Xóa bỏ chính sách `setBucketPolicy` cấp quyền public `s3:GetObject` cho `*`. Chuyển bucket về trạng thái **Private**.
  - [x] **1.2.3**: Viết hàm `generatePresignedDownloadUrl(String objectName, int expiryMinutes)` trong `MinioService` sử dụng `minioClient.getPresignedObjectUrl`.
  - [x] **1.2.4**: Thêm cơ chế kiểm tra định dạng MIME (whitelist: `image/png`, `image/jpeg`, `image/webp`, `application/pdf`, `text/plain`, Microsoft Office) và làm sạch tên file (chống path traversal `../`).
  - [x] **1.2.5**: Cập nhật `UploadController.java`: Gắn `@AuthenticationPrincipal` để ghi nhận ID người tải lên.
- **Lệnh kiểm tra & Nghiệm thu:**
  ```bash
  # Upload không có token -> Bắt buộc bị từ chối 401
  curl -X POST http://localhost:8000/api/upload/image -F "file=@logo.png"

  # Truy cập trực tiếp link file MinIO cũ qua trình duyệt -> Nhận lỗi Access Denied (403)
  curl -I http://localhost:9020/smartmanager/documents/test.pdf
  ```
- **Tiêu chí hoàn thành:** Upload tệp bắt buộc đăng nhập; file được lưu trữ riêng tư, chỉ tải được qua Presigned URL có thời hạn 15 phút.

---

### [x] Task 1.3: Bảo mật Kết nối WebSocket STOMP qua ChannelInterceptor
- **Mức độ ưu tiên:** CRITICAL
- **Tệp cần tạo / sửa:**
  - `server/src/main/java/com/example/smartmanager/config/WebSocketConfig.java`
  - Tạo mới: `server/src/main/java/com/example/smartmanager/config/AuthChannelInterceptor.java`
- **Các bước thực hiện:**
  - [x] **1.3.1**: Tạo class `AuthChannelInterceptor` kế thừa `ChannelInterceptor`.
  - [x] **1.3.2**: Trong phương thức `preSend`: Bắt lệnh `StompCommand.CONNECT`. Đọc header native `Authorization`, kiểm tra tiền tố `Bearer `, gọi `jwtTokenProvider.validateToken(token)`.
  - [x] **1.3.3**: Nếu token hợp lệ: Lấy email, nạp `UserDetails`, tạo `UsernamePasswordAuthenticationToken` và gán vào `accessor.setUser(auth)`. Nếu token không hợp lệ hoặc thiếu: Ném ngoại lệ ngắt kết nối bắt tay ngay lập tức.
  - [x] **1.3.4**: Bắt lệnh `StompCommand.SUBSCRIBE`: Kiểm tra quyền truy cập đích (Destination topic). Không cho phép client subscribe topic của dự án nếu không thuộc danh sách thành viên.
  - [x] **1.3.5**: Trong `WebSocketConfig.java`: Đăng ký interceptor vào `configureClientInboundChannel(registration -> registration.interceptors(authChannelInterceptor))`.
- **Lệnh kiểm tra & Nghiệm thu:**
  - Kết nối STOMP client không truyền token JWT -> Bị ngắt kết nối STOMP ERROR ngay lập tức.
  - Kết nối kèm JWT hợp lệ -> Kết nối thành công, nhận được tin nhắn bình thường.
- **Tiêu chí hoàn thành:** Không còn rủi ro nghe lén dữ liệu qua WebSocket.

---

### [x] Task 1.4: Điều chỉnh Ma trận Phân quyền & Khắc phục IDOR
- **Mức độ ưu tiên:** CRITICAL / HIGH
- **Tệp cần sửa:**
  - `server/src/main/java/com/example/smartmanager/projects/ProjectController.java` (Dòng 62, 68, 77, 83)
  - `server/src/main/java/com/example/smartmanager/workspaces/WorkspaceController.java` (Dòng 90-155)
  - `server/src/main/java/com/example/smartmanager/notifications/NotificationController.java` (Dòng 27-36)
  - `server/src/main/java/com/example/smartmanager/notifications/NotificationService.java`
- **Các bước thực hiện:**
  - [x] **1.4.1**: Trong `ProjectController.java`:
    - Sửa `@PreAuthorize` của `POST /{projectId}/files` và `POST /{projectId}/folders` từ `'VIEWER'` thành `'MEMBER'`.
    - Sửa `@PreAuthorize` của `DELETE /{projectId}/files/{fileId}` và `DELETE /{projectId}/folders/{folderId}` từ `'VIEWER'` thành `'ADMIN'`.
  - [x] **1.4.2**: Trong `WorkspaceController.java`:
    - Sửa `@PathVariable("id")` trong SpEL expression: Thay `#workspaceId` thành `#id`.
    - Sửa quyền tạo/xóa tệp và thư mục workspace từ `'VIEWER'` sang `'MEMBER'` và `'ADMIN'`.
  - [x] **1.4.3**: Trong `NotificationController.java`: Sửa API `PATCH /{id}/read` nhận thêm `@AuthenticationPrincipal UserPrincipal userPrincipal`.
  - [x] **1.4.4**: Trong `NotificationService.markAsRead(id, userId)`: Bổ sung kiểm tra `notification.getRecipientId().equals(UUID.fromString(userId))`, ném `AccessDeniedException` nếu ID không trùng khớp.
- **Tiêu chí hoàn thành:** Người dùng chỉ có quyền xem (VIEWER) không thể xóa tệp; không ai có thể xem hoặc đánh dấu đã đọc thông báo của người khác.

---

### [x] Task 1.5: Đồng bộ Toàn diện CSDL 21 Bảng (`init-db/schema.sql`)
- **Mức độ ưu tiên:** HIGH
- **Tệp cần sửa:**
  - `init-db/schema.sql`
- **Các bước thực hiện:**
  - [x] **1.5.1**: Thêm DDL cho các bảng còn thiếu:
    - `workspace_roles`, `workspace_role_permissions`, `workspace_member_permissions`
    - `project_members`, `project_deletion_requests`
    - `task_files`, `workspace_folders`, `workspace_files`
    - `notifications`, `invitations`, `chat_messages`, `payment_orders`
    - `comment_likes` (ElementCollection table)
  - [x] **1.5.2**: Bổ sung các cột thiếu vào các bảng hiện hữu:
    - Bảng `users`: thêm `subscription_plan VARCHAR(50) DEFAULT 'FREE'`, `subscription_expires_at TIMESTAMPTZ`.
    - Bảng `tasks`: thêm `reminded BOOLEAN NOT NULL DEFAULT FALSE`, `version BIGINT NOT NULL DEFAULT 0`.
  - [x] **1.5.3**: Thiết lập đầy đủ ràng buộc khóa ngoại (Foreign Keys) với hành vi `ON DELETE CASCADE` và `ON DELETE SET NULL`.
  - [x] **1.5.4**: Tạo trigger cập nhật tự động `updated_at` cho tất cả các bảng có cột này.
- **Lệnh kiểm tra & Nghiệm thu:**
  ```powershell
  # Chạy test reset database sạch sẽ trên docker
  docker-compose down -v
  docker-compose up -d postgres
  # Chờ 5s rồi kiểm tra số lượng bảng đã tạo
  docker exec -it smart_postgres psql -U admin -d smart_task_db -c "\dt"
  ```
- **Tiêu chí hoàn thành:** Kết quả hiển thị đúng đủ **21 bảng dữ liệu**, không có lỗi khóa ngoại nào xảy ra.

---

## ⚡ SPRINT 2: CHUẨN HÓA NGHIỆP VỤ & HÀNG ĐỢI AI (HIGH)

### [x] Task 2.1: Triển khai Redis Queue Bất đồng bộ cho AI Auto-Subtasks
- **Mức độ ưu tiên:** HIGH
- **Tệp cần tạo / sửa:**
  - `server/src/main/java/com/example/smartmanager/tasks/TaskController.java` (Dòng 126-137)
  - `server/src/main/java/com/example/smartmanager/tasks/TaskService.java` (Dòng 368-373)
  - Tạo mới: `server/src/main/java/com/example/smartmanager/ai/AiJob.java`
  - Tạo mới: `server/src/main/java/com/example/smartmanager/ai/AiWorker.java`
- **Các bước thực hiện:**
  - [x] **2.1.1**: Định nghĩa record/class `AiJob(String taskId, String title, String description, String projectId, String userId)`.
  - [x] **2.1.2**: Sửa `POST /api/tasks/{id}/ai-subtasks` trong `TaskController.java`:
    - Đẩy `AiJob` vào Redis List với key `ai-subtasks-queue` bằng `redisTemplate.opsForList().leftPush(...)`.
    - Phản hồi ngay lập tức `ResponseEntity.accepted().body(Map.of("message", "Công việc phân rã đã được đưa vào hàng đợi AI"))` (HTTP 202).
  - [x] **2.1.3**: Xây dựng `AiWorker.java`:
    - Khởi chạy luồng nền bằng `ExecutorService` khi ứng dụng khởi động.
    - Lặp lắng nghe job bằng `redisTemplate.opsForList().rightPop("ai-subtasks-queue", 5, TimeUnit.SECONDS)`.
    - Gọi `OpenRouterServiceClient.generateContent` với prompt kiến trúc sư phần mềm.
    - Phân tích chuỗi JSON trả về thành danh sách subtask, chèn vào bảng `tasks` trong `@Transactional`.
    - Phát thông điệp STOMP `"AI_SUBTASKS_COMPLETED"` tới `/topic/projects/{projectId}`.
  - [x] **2.1.4**: Cấu hình cơ chế thử lại (Retry) tối đa 3 lần với khoảng cách nghỉ tăng dần nếu gọi AI API bị timeout.
- **Tiêu chí hoàn thành:** Nhấn nút rã việc AI trên giao diện nhận phản hồi < 100ms; subtasks tự động xuất hiện trên Kanban sau khi worker xử lý xong.

---

### [x] Task 2.2: Sửa Bộ lọc Rate Limiter cho các API AI Subtasks
- **Mức độ ưu tiên:** HIGH
- **Tệp cần sửa:**
  - `server/src/main/java/com/example/smartmanager/config/RateLimitingFilter.java` (Dòng 31-48)
- **Các bước thực hiện:**
  - [x] **2.2.1**: Mở rộng điều kiện kiểm tra URI trong `doFilterInternal`:
    ```java
    boolean isAiEndpoint = path.startsWith("/api/ai/") 
        || path.matches("^/api/tasks/[^/]+/ai-subtasks$")
        || path.matches("^/api/tasks/[^/]+/suggest-subtasks$");
    ```
  - [x] **2.2.2**: Áp dụng đếm giới hạn tần suất 15 yêu cầu / phút / IP trên Redis cho tất cả các endpoint thỏa mãn điều kiện trên.
- **Tiêu chí hoàn thành:** Spam gọi rã việc liên tục quá 15 lần trong 1 phút sẽ nhận mã lỗi `HTTP 429 Too Many Requests`.

---

### [x] Task 2.3: Chuẩn hóa Thuật toán Fractional Positioning & Optimistic Lock
- **Mức độ ưu tiên:** HIGH
- **Tệp cần sửa:**
  - `server/src/main/java/com/example/smartmanager/tasks/TaskEntity.java`
  - `server/src/main/java/com/example/smartmanager/tasks/TaskService.java` (Dòng 130-153)
  - `server/src/main/java/com/example/smartmanager/tasks/schedulers/PositionReindexScheduler.java` (Dòng 28-68)
- **Các bước thực hiện:**
  - [x] **2.3.1**: Thêm trường `@Version private Long version = 0L;` vào `TaskEntity.java` để ngăn chặn xung đột ghi đè đồng thời.
  - [x] **2.3.2**: Trong `TaskService.moveTask`:
    - Khi kéo lên đầu danh sách (`prevPosition == null`): Sửa thành `newPosition = (nextPosition != null ? nextPosition - 1.0 : 1000.0)`.
    - Khi kéo xuống cuối (`nextPosition == null`): `newPosition = (prevPosition != null ? prevPosition + 1.0 : 1000.0)`.
    - Khi chèn vào giữa: `newPosition = (prevPosition + nextPosition) / 2.0`.
  - [x] **2.3.3**: Trong `PositionReindexScheduler.java`: Sau khi hoàn tất cập nhật lại tọa độ ($1000.0, 2000.0, \dots$), phát broadcast WebSocket `"REINDEX_POSITIONS"` tới topic `/topic/projects/{projectId}`.
- **Tiêu chí hoàn thành:** Kéo thẻ lên đầu cột nhiều lần không bị suy biến về 0; client nhận được thông báo reindex để cập nhật state.

---

### [x] Task 2.4: Khắc phục các Lỗi Nghiệp vụ & REST Anti-pattern Tồn đọng
- **Mức độ ưu tiên:** HIGH
- **Tệp cần sửa:**
  - `server/src/main/java/com/example/smartmanager/workspaces/WorkspaceService.java` (Dòng 173-211)
  - `server/src/main/java/com/example/smartmanager/comments/CommentService.java` (Dòng 243-264)
  - `server/src/main/java/com/example/smartmanager/tasks/schedulers/TaskDeadlineReminderScheduler.java` (Dòng 49-55)
  - `server/src/main/java/com/example/smartmanager/projects/ProjectController.java` (Dòng 46-51)
  - `server/src/main/java/com/example/smartmanager/projects/ProjectService.java` (Dòng 201-220)
- **Các bước thực hiện:**
  - [x] **2.4.1**: Trong `WorkspaceService.removeMember`: Bổ sung kiểm tra bảo vệ Owner:
    ```java
    WorkspaceEntity ws = workspaceRepository.findById(UUID.fromString(workspaceId)).orElseThrow();
    if (ws.getOwnerId().toString().equals(userId)) {
        throw new IllegalArgumentException("Không thể xóa Chủ sở hữu (Owner) khỏi Workspace");
    }
    ```
  - [x] **2.4.2**: Trong `CommentService.deleteComment`: Cho phép xóa nếu `comment.getUserId().toString().equals(userId)` HOẶC người gọi có vai trò `ADMIN` trong dự án.
  - [x] **2.4.3**: Trong `TaskDeadlineReminderScheduler`: Sửa điều kiện quét công việc:
    ```java
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime tomorrow = now.plusDays(1);
    List<TaskEntity> nearDeadlineTasks = taskRepository
        .findByStatusNotAndDueDateIsNotNullAndDueDateBetweenAndRemindedFalse("DONE", now, tomorrow);
    ```
    Đồng thời tạo thêm chuông thông báo `notificationService.createNotificationWithNav(...)` trên ứng dụng cho người được giao việc.
  - [x] **2.4.4**: Trong `ProjectController.java`: Vô hiệu hóa hoặc xóa endpoint `DELETE /api/projects/{projectId}` trực tiếp. Yêu cầu Project Admin phải tạo `deletion-request` và chờ Workspace Admin duyệt.
  - [x] **2.4.5**: Trong `ProjectService.getProjectMembers`: Bỏ thao tác ghi dữ liệu `projectMemberRepository.save(...)` trong hàm GET để đảm bảo REST GET là Idempotent và chỉ đọc.
- **Tiêu chí hoàn thành:** Toàn bộ các bug logic nghiệp vụ được giải quyết dứt điểm.

---

## 🎨 SPRINT 3: TÁI CẤU TRÚC FRONTEND & SỬA 322 LỖI ESLINT (MEDIUM)

### [x] Task 3.1: Bóc tách Trang Kanban Nguyên khối `project/[projectId]/page.tsx`
- **Mức độ ưu tiên:** MEDIUM
- **Tệp cần bóc tách:**
  - `client/src/app/project/[projectId]/page.tsx` (4,354 dòng)
  - Tạo mới thư mục: `client/src/components/kanban/`
- **Các bước thực hiện:**
  - [x] **3.1.1**: Tạo `KanbanHeader.tsx`: Chứa thanh tìm kiếm, bộ lọc thành viên, nút tạo Task, nút báo cáo AI PMO và nút xuất Excel.
  - [x] **3.1.2**: Tạo `KanbanBoard.tsx`: Quản lý 3 cột Kanban (`TODO`, `IN_PROGRESS`, `DONE`) và sự kiện kéo thả HTML5.
  - [x] **3.1.3**: Tạo `KanbanColumn.tsx`: Hiển thị tiêu đề cột, badge số lượng, quản lý drop zone.
  - [x] **3.1.4**: Tạo `KanbanCard.tsx`: Thẻ task thu gọn với nhãn độ ưu tiên, avatar người nhận việc, due date và thanh tiến độ subtask.
  - [x] **3.1.5**: Tạo `TaskDetailModal.tsx`: Hộp thoại xem/sửa chi tiết task, checklist subtasks, tải tệp đính kèm.
  - [x] **3.1.6**: Tạo `TaskDiscussion.tsx`: Luồng thảo luận theo cây (nested comments), thả tim và hiển thị presence người đang xem.
  - [x] **3.1.7**: Tạo `AiReportModal.tsx`: Hộp thoại hiển thị báo cáo giám đốc PMO 5 phần và các biểu đồ tiến độ.
  - [x] **3.1.8**: Tạo `AiSearchModal.tsx`: Hộp thoại tìm kiếm thông minh bằng ngôn ngữ tự nhiên.
  - [x] **3.1.9**: Tinh gọn `client/src/app/project/[projectId]/page.tsx` và bóc tách các thành phần dùng chung vào `client/src/components/kanban/`.
- **Tiêu chí hoàn thành:** Giao diện hoạt động mượt mà, mã nguồn sạch sẽ, dễ đọc và dễ bảo trì.

---

### [x] Task 3.2: Gộp Kết nối WebSocket STOMP (Multiplexing) & Quản lý Hook
- **Mức độ ưu tiên:** MEDIUM
- **Tệp cần tạo / sửa:**
  - `client/src/lib/socket.ts`
  - Tạo mới: `client/src/hooks/useProjectSocket.ts`
- **Các bước thực hiện:**
  - [x] **3.2.1**: Cải tiến `client/src/lib/socket.ts`: Thiết lập Singleton STOMP Client duy nhất. Gửi kèm header:
    ```typescript
    connectHeaders: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
    ```
  - [x] **3.2.2**: Viết custom hook `useProjectSocket(projectId, userId)`:
    - Đăng ký đồng thời các kênh trên cùng một kết nối: `/topic/projects/{projectId}`, `/topic/chat/project/{projectId}`, `/topic/notifications/{userId}`.
    - Xử lý dọn dẹp (unsubscribe) chính xác khi component unmount.
- **Tiêu chí hoàn thành:** Kiểm tra tab Network trong DevTools chỉ còn xuất hiện **1 kết nối WebSocket duy nhất** khi mở trang dự án.

---

### [x] Task 3.3: Khắc phục Triệt để 322 Cảnh báo & Lỗi ESLint
- **Mức độ ưu tiên:** MEDIUM
- **Tệp cần sửa:**
  - `client/src/lib/api.ts`
  - `client/src/lib/socket.ts`
  - `client/src/lib/i18n.tsx`
  - Các trang trong `client/src/app/`
- **Các bước thực hiện:**
  - [x] **3.3.1**: Định nghĩa các Interface TypeScript rõ ràng trong `client/src/types/`, thay thế toàn bộ kiểu `any` trong `api.ts` và `socket.ts`.
  - [x] **3.3.2**: Trong `client/src/lib/i18n.tsx` (dòng 774): Sửa lỗi `react-hooks/set-state-in-effect`. Khởi tạo ngôn ngữ ban đầu trực tiếp từ lazy initializer của `useState`:
    ```typescript
    const [language, setLanguageState] = useState<Language>(() => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('homix_lang') as Language;
        if (saved === 'vi' || saved === 'en') return saved;
      }
      return 'vi';
    });
    ```
  - [x] **3.3.3**: Rà soát và xóa sạch các biến import thừa, biến không sử dụng (unused vars).
- **Lệnh kiểm tra & Nghiệm thu:**
  ```powershell
  cd client
  npx.cmd eslint src
  ```
- **Tiêu chí hoàn thành:** Lệnh ESLint chạy thành công với kết quả **0 errors, 0 warnings** (Exit code 0).

---

### [x] Task 3.4: Chuẩn hóa Biến Môi trường Toàn diện
- **Mức độ ưu tiên:** MEDIUM / LOW
- **Tệp cần sửa:**
  - `client/src/lib/api.ts` (Dòng 1)
  - `client/src/lib/socket.ts` (Dòng 5, 42, 73, 106)
  - `client/.env.local`
- **Các bước thực hiện:**
  - [x] **3.4.1**: Thay thế các chuỗi tĩnh `'http://localhost:8000/api'` và `'http://localhost:8000/ws'` bằng:
    ```typescript
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000/ws';
    ```
  - [x] **3.4.2**: Đảm bảo tệp `.env.local` và `docker-compose.yml` truyền biến môi trường chính xác.
- **Tiêu chí hoàn thành:** Frontend có thể kết nối bình thường đến bất kỳ host/cổng nào được cấu hình qua biến môi trường.

---

## 🧪 SPRINT 4: KIỂM THỬ TỰ ĐỘNG, CI/CD & HỒ SƠ KHÓA LUẬN (FINAL)

### [x] Task 4.1: Bổ sung Bộ Kiểm Thử Đơn vị & Tích hợp (JUnit 5 + Mockito)
- **Mức độ ưu tiên:** HIGH
- **Tệp cần tạo / sửa trong:** `server/src/test/java/com/example/smartmanager/`
- **Các bước thực hiện:**
  - [x] **4.1.1**: Tạo `SecurityServiceTest.java`: Kiểm thử ma trận 16 quyền hạn RBAC/ABAC (phân quyền cá nhân override, custom role, default role, admin bypass).
  - [x] **4.1.2**: Mở rộng `TaskServiceTests.java`: Kiểm thử thuật toán Fractional Positioning (chèn đầu $P_{first} - 1.0$, chèn cuối, chèn giữa, kiểm tra optimistic locking `@Version`).
  - [x] **4.1.3**: Tạo `PaymentSecurityTest.java`: Kiểm thử hàm xác minh chữ ký số VNPay HMAC-SHA512 (chữ ký đúng -> pass, chữ ký sai -> reject).
  - [x] **4.1.4**: Tạo `AiWorkerTest.java`: Kiểm thử cơ chế pop job từ Redis list và gọi fallback OpenRouter khi Gemini bị lỗi quota.
- **Lệnh kiểm tra & Nghiệm thu:**
  ```powershell
  cd server
  ./gradlew.bat test --info
  ```
- **Tiêu chí hoàn thành:** 100% test cases trong bộ test chạy pass (xanh lá cây), độ bao phủ nghiệp vụ đạt trên 75%.

---

### [x] Task 4.2: Tự động hóa CI/CD GitHub Actions với Container Thật
- **Mức độ ưu tiên:** MEDIUM
- **Tệp cần sửa:**
  - `.github/workflows/ci-cd.yml`
- **Các bước thực hiện:**
  - [x] **4.2.1**: Cấu hình các dịch vụ container trong workflow: `postgres:15-alpine` và `redis:7-alpine`.
  - [x] **4.2.2**: Thêm bước thực thi `init-db/schema.sql` vào database container để xác thực cấu trúc CSDL tự động.
  - [x] **4.2.3**: Bổ sung bước kiểm tra chất lượng mã nguồn Frontend: `npm run lint` trước khi chạy `npm run build`.
- **Tiêu chí hoàn thành:** Mỗi commit hoặc pull request đều được kiểm thử và đóng gói tự động thành công trên GitHub Actions.

---

### [x] Task 4.3: Đồng bộ Toàn diện Hồ sơ Báo cáo Khóa luận
- **Mức độ ưu tiên:** HIGH (Dành cho việc bảo vệ khóa luận)
- **Tệp cần cập nhật:**
  - `TaiLieu_BaoCao/Suon_Bao_Cao.md`
  - `TaiLieu_BaoCao/PROJECT_THESIS_KNOWLEDGE_BASE.md`
- **Các bước thực hiện:**
  - [x] **4.3.1**: Cập nhật sơ đồ CSDL trong báo cáo từ 9 bảng lên **21 bảng chuẩn hóa**, bổ sung bảng mô tả chi tiết từng thực thể.
  - [x] **4.3.2**: Cập nhật sơ đồ trình tự (Sequence Diagram) cho tính năng AI Auto-Subtasks (bổ sung Redis Queue LPUSH/BRPOP và WebSocket Push).
  - [x] **4.3.3**: Cập nhật mục phân tích an ninh bảo mật và thuật toán Fractional Positioning để làm nổi bật tính học thuật trước Hội đồng chấm thi.
- **Tiêu chí hoàn thành:** Mọi tài liệu báo cáo khớp 100% với mã nguồn thực tế của hệ thống.

---

*Tệp task này được thiết kế để theo dõi trực tiếp quá trình lập trình. Hãy đánh dấu `[x]` ngay khi hoàn thành từng mục.*
