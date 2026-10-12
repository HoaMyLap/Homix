# BỘ CƠ SỞ TRI THỨC TOÀN DIỆN PHỤC VỤ KHÓA LUẬN TỐT NGHIỆP
# ĐỀ TÀI: NỀN TẢNG QUẢN LÝ DỰ ÁN VÀ CÔNG VIỆC THÔNG MINH HOMIX v2.0 (INTELLIGENT TASK & WORKSPACE PLATFORM)

---

## LỜI MỞ ĐẦU & TỔNG QUAN DỰ ÁN

Tài liệu này được biên soạn dưới vai trò **Software Architect & Academic Thesis Assistant**, được trích xuất và tổng hợp thông qua phương pháp **Kỹ nghệ đảo ngược (Reverse Engineering) toàn bộ mã nguồn thực tế** của hệ thống **Homix v2.0** (`e:/Embe/KL/`). 

Bộ cơ sở tri thức này phục vụ làm nguồn dữ liệu kỹ thuật chuẩn xác, toàn diện và có tính học thuật cao nhất để sinh viên/nhóm nghiên cứu trực tiếp sử dụng làm căn cứ viết các chương của **Khóa luận tốt nghiệp (Graduation Thesis)**: từ Phân tích yêu cầu, Thiết kế kiến trúc, Thiết kế cơ sở dữ liệu, Hiện thực hóa hệ thống đến Kiểm thử và Đánh giá.

---

## PHẦN 1: BẢNG ÁNH XẠ MÃ NGUỒN VÀO CÁC CHƯƠNG KHÓA LUẬN (SOURCE CODE TO THESIS MAPPING)

| Chương trong Khóa luận | Nội dung học thuật cần trình bày | Các gói mã nguồn & Tệp đối chiếu trực tiếp |
| :--- | :--- | :--- |
| **Chương 1: Tổng quan & Cơ sở lý thuyết** | • Bài toán quản lý công việc và cộng tác nhóm.<br>• Phân tích mô hình Kanban, Realtime STOMP.<br>• Mô hình ngôn ngữ lớn (LLM) và kỹ nghệ câu lệnh (Prompt Engineering).<br>• Kiến trúc micro-services vs monolithic hướng module. | • `huong_dan_tung_buoc.md`<br>• `package.json`<br>• `build.gradle`<br>• `docker-compose.yml` |
| **Chương 2: Phân tích & Đặc tả Yêu cầu** | • Biểu đồ Use Case tổng thể, Use Case phân quyền (Admin, Member, Viewer).<br>• Phân rã tính năng 70% Phần mềm cốt lõi + 30% AI Thông minh.<br>• Đặc tả chức năng quản trị, thanh toán, kéo thả Kanban, chat thời gian thực. | • `client/src/app/**`<br>• `server/.../auth/SecurityService.java`<br>• `server/.../admin/AdminController.java`<br>• `server/.../payments/PaymentService.java` |
| **Chương 3: Thiết kế Kiến trúc & Cơ sở dữ liệu** | • Kiến trúc phân tầng (N-Tier Architecture) & Design Patterns.<br>• Sơ đồ ERD (Entity Relationship Diagram) chuẩn hóa 3NF.<br>• Thiết kế **21 bảng CSDL thực thể + 1 bảng tập hợp (`comment_likes`)**, chỉ mục phức hợp (Composite Indexes cho Kanban).<br>• Mô hình bảo mật đa lớp (JWT + Redis Blacklist + Rate Limiting + STOMP `AuthChannelInterceptor` + RBAC/ABAC). | • `init-db/schema.sql`<br>• `server/.../*Entity.java`<br>• `server/.../config/SecurityConfig.java`<br>• `server/.../config/AuthChannelInterceptor.java`<br>• `server/.../config/RateLimitingFilter.java`<br>• `server/.../config/WebSocketConfig.java` |
| **Chương 4: Hiện thực hóa Hệ thống (Implementation)** | • **Tầng Backend:** Spring Boot 3.4.1, Java 21, JPA Hibernate, Redis Cache/Queue (`AiWorker` & `EmailWorker`), MinIO S3 SDK (Presigned URLs).<br>• **Tầng Frontend:** Next.js 16 App Router, React 19, Tailwind CSS v4, Token Design System, Modular Kanban (`components/kanban/*`), Singleton STOMP Client (`useProjectSocket.ts`).<br>• **Mô-đun AI:** Gemini 2.0 Flash + OpenRouter Dual Fallback, Hàng đợi bất đồng bộ `ai-subtasks-queue` (`LPUSH`/`BRPOP` + HTTP 202), Prompt PMO 5 phần, Tìm kiếm ngữ nghĩa.<br>• **Thuật toán chuyên sâu:** Fractional Positioning + `@Version` Optimistic Locking, Presence Detection (Redis Set). | • `server/.../tasks/TaskService.java`<br>• `server/.../ai/AiService.java`<br>• `server/.../ai/AiWorker.java`<br>• `server/.../ai/OpenRouterServiceClient.java`<br>• `server/.../comments/CommentService.java`<br>• `client/src/lib/api.ts`<br>• `client/src/hooks/useProjectSocket.ts`<br>• `client/src/components/kanban/*` |
| **Chương 5: Đóng gói, Triển khai & CI/CD** | • Container hóa đa dịch vụ (Docker Compose 5 services: App, Web, PostgreSQL, Redis, MinIO).<br>• Quy trình tự động hóa kiểm thử, xác thực 21 bảng `schema.sql`, chạy `npm run lint` và build bằng GitHub Actions (`ci-cd.yml`).<br>• Môi trường phát triển và cấu hình bảo mật. | • `docker-compose.yml`<br>• `server/Dockerfile.dev`<br>• `client/Dockerfile.dev`<br>• `.github/workflows/ci-cd.yml`<br>• `server/.../application.yml` |
| **Chương 6: Kiểm thử & Đánh giá Kết quả** | • Bộ kiểm thử đơn vị & tích hợp (**11 lớp kiểm thử** JUnit 5 + Mockito).<br>• Kiểm thử ma trận 16 quyền hạn RBAC/ABAC (`SecurityServiceTest`).<br>• Kiểm thử thuật toán toán học Fractional Positioning & `@Version` (`TaskServiceTests`).<br>• Kiểm thử hàng đợi AI bất đồng bộ (`AiWorkerTest`) và chữ ký số HMAC-SHA512 (`PaymentSecurityTest`). | • `server/src/test/.../SecurityServiceTest.java`<br>• `server/src/test/.../TaskServiceTests.java`<br>• `server/src/test/.../PaymentSecurityTest.java`<br>• `server/src/test/.../AiWorkerTest.java`<br>• `server/src/test/.../OpenRouterServiceClientTests.java`<br>• `server/src/test/.../AuthServiceTest.java` |

---

## PHẦN 2: THIẾT KẾ KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

### 2.1. Sơ đồ Kiến trúc Phân tầng Tổng thể (Layered Architecture)

```
[ CLIENT TIER - Web Browser ]
    │
    ├── Next.js 16 (App Router) + React 19 + TypeScript 5
    ├── Modular Kanban Components (`KanbanHeader`, `KanbanBoard`, `KanbanColumn`, `KanbanCard`, ...)
    ├── Tailwind CSS v4 (Token Design System, Light/Dark Modes, FOUC Prevention)
    ├── SheetJS (XLSX Import/Export) + Web Audio API (Chime Synthesis)
    └── Singleton STOMP Manager (`socket.ts` + `useProjectSocket.ts` Multiplexing)
          │
          │ HTTP REST (Port 8000) / WebSocket STOMP (ws://...:8000/ws + JWT Bearer)
          ▼
[ APPLICATION TIER - Spring Boot 3.4.1 (Java 21 LTS) ]
    │
    ├── Security Filter Chain & WebSocket Interceptor:
    │     ├── RateLimitingFilter (Redis-backed: max 15 AI req/min/IP on /api/ai/** & */ai-subtasks)
    │     ├── JwtAuthenticationFilter (Token Signature & Redis Blacklist Check)
    │     ├── AuthChannelInterceptor (STOMP CONNECT JWT Auth & SUBSCRIBE Topic RBAC)
    │     └── SecurityService (SpEL Fine-grained RBAC/ABAC Engine - 16 Permissions)
    │
    ├── REST Controllers & WebSocket Message Handlers:
    │     ├── AuthController, AdminController, UserController
    │     ├── WorkspaceController, WorkspaceRoleController, ProjectController
    │     ├── TaskController, CommentController, NotificationController
    │     ├── AiController, ChatController, ContactController, UploadController
    │     └── PaymentController (VNPay HMAC-SHA512 Verify, PayPal, MoMo, VietQR)
    │
    ├── Business Service Layer:
    │     ├── TaskService (Fractional Positioning Kanban Engine + @Version Optimistic Locking)
    │     ├── AiService & OpenRouterServiceClient (Dual-Fallback LLM Gateway)
    │     ├── CommentService (Presence Optimization & Threading)
    │     ├── NotificationService & EmailService (Multi-channel Alerts)
    │     ├── MinioService (Private Document Bucket + 15-min Presigned Download URLs)
    │     ├── AdminService (Enterprise Analytics & VIP Granting)
    │     └── PaymentService (Order Lifecycle & VIP Subscriptions)
    │
    ├── Asynchronous & Background Processing:
    │     ├── @Async ThreadPools (Email & Event Dispatching)
    │     ├── AiWorker (Redis Queue Consumer `ai-subtasks-queue` LPUSH/BRPOP + 3x Retry + WS Push)
    │     ├── EmailWorker (Redis Queue Consumer `email-invitations-queue`)
    │     ├── PositionReindexScheduler (Floating-point Underflow Protection + WS REINDEX_POSITIONS)
    │     └── TaskDeadlineReminderScheduler (Idempotent 24h Deadline Alerts - 1 min)
    │
    └── Data Access Layer:
          └── Spring Data JPA (Hibernate 6) + HikariCP Connection Pool
          │
          ▼
[ DATA & INFRASTRUCTURE TIER ]
    ├── PostgreSQL 15 (21 Entity Tables + 1 Collection Table, 3NF, UUID PKs, Composite Indexes)
    ├── Redis 7 (Caching, Token Revocation, Rate Limiting, User Presence, Dual Message Queues)
    └── MinIO S3 Object Storage (Public `images/*` Avatars, Private `documents/*` with Presigned URLs)
```

---

## PHẦN 3: CƠ SỞ DỮ LIỆU & MÔ HÌNH THỰC THỂ (DATABASE SCHEMA & DATA MODELS)

### 3.1. Phân tích chi tiết 21 Bảng Thực thể + 1 Bảng Tập hợp (`init-db/schema.sql`)

1. **`users`**: Thực thể tài khoản người dùng hệ thống (`id`, `email` UNIQUE, `password_hash`, `fullname`, `avatar_url`, `system_role`, `subscription_plan`, `subscription_expires_at`, `created_at`, `updated_at`).
2. **`workspaces`**: Không gian làm việc cấp cao nhất (`id`, `name`, `description`, `owner_id` FK `users.id` ON DELETE CASCADE, `created_at`, `updated_at`).
3. **`workspace_roles`**: Vai trò tùy chỉnh trong từng Workspace (`id`, `workspace_id` FK CASCADE, `code`, `name`, `description`, `is_system`, `created_at`).
4. **`workspace_role_permissions`**: Bảng gán mã quyền hạn cho vai trò tùy chỉnh (`PRIMARY KEY (role_id, permission_code)`).
5. **`workspace_members`**: Bảng quan hệ N-N và phân quyền cấp Workspace (`PRIMARY KEY (workspace_id, user_id)`, `role`, `role_id` FK SET NULL, `created_at`).
6. **`workspace_member_permissions`**: Bảng phân quyền ghi đè trực tiếp theo từng cá nhân (`PRIMARY KEY (workspace_id, user_id, permission_code)`, `is_allowed`).
7. **`projects`**: Dự án trực thuộc Workspace (`id`, `name`, `description`, `workspace_id` FK CASCADE, `status`, `created_at`, `updated_at`).
8. **`project_members`**: Bảng thành viên cấp Dự án (`PRIMARY KEY (project_id, user_id)`, `role`, `created_at`).
9. **`project_deletion_requests`**: Quy trình phê duyệt xóa dự án 2 bước (`id`, `project_id` FK CASCADE, `requester_id` FK CASCADE, `reason`, `status`, `created_at`).
10. **`tasks`**: Trung tâm tác vụ Kanban và cấu trúc cây Subtasks (`id`, `title`, `description`, `status`, `priority`, `position` DOUBLE PRECISION, `due_date`, `assignee_id`, `creator_id`, `project_id` FK CASCADE, `parent_task_id` FK CASCADE, `reminded` BOOLEAN, `version` BIGINT DEFAULT 0, `created_at`, `updated_at`).
11. **`task_logs`**: Nhật ký kiểm toán phục vụ AI và tra cứu lịch sử (`id`, `task_id` FK CASCADE, `user_id` FK SET NULL, `action_type`, `old_value`, `new_value`, `created_at`).
12. **`task_files`**: Tệp đính kèm trực tiếp trên từng Task (`id`, `task_id` FK CASCADE, `name`, `url`, `size`, `type`, `uploaded_by`, `created_at`).
13. **`comments` & `comment_likes`**: Hệ thống thảo luận lồng nhau (`comments` có `parent_comment_id`, `reply_to_user_id`; `comment_likes` lưu tập hợp `(comment_id, user_id)`).
14. **`chat_messages`**: Lưu trữ lịch sử tin nhắn phòng chat thời gian thực (`id`, `sender_id`, `sender_name`, `sender_avatar`, `target_id`, `target_type`, `content`, `created_at`).
15. **`project_folders` & `project_files`**: Hệ thống thư mục đệ quy (`parent_id`) và tệp tài liệu cấp Dự án.
16. **`workspace_folders` & `workspace_files`**: Hệ thống thư mục đệ quy (`parent_id`) và tệp tài liệu cấp Workspace.
17. **`notifications`**: Hệ thống thông báo đa kênh (`id`, `recipient_id` FK CASCADE, `title`, `message`, `type`, `is_read`, `workspace_id`, `project_id`, `task_id`, `invitation_id`, `created_at`).
18. **`invitations`**: Quản lý lời mời tham gia và yêu cầu rời dự án (`id`, `email`, `workspace_id` FK CASCADE, `project_id` FK CASCADE, `inviter_id`, `role`, `status`, `type`, `reason`, `created_at`).
19. **`payment_orders`**: Quản lý đơn hàng nâng cấp gói VIP (`id`, `user_id` FK CASCADE, `plan_type`, `billing_cycle`, `amount`, `currency`, `payment_method`, `status`, `transaction_id` UNIQUE, `payment_url`, `qr_code_url`, `voucher_code`, `created_at`, `updated_at`).

### 3.2. Hệ thống Chỉ mục Tối ưu Hóa Truy Vấn (Index Optimization)
- `idx_users_email`: B-Tree index tăng tốc độ tra cứu đăng nhập $O(1)$.
- `idx_task_logs_created_at`: Tối ưu hóa truy vấn lọc các log hoạt động trong 24 giờ qua phục vụ AI sinh báo cáo Daily Standup.
- `idx_tasks_project_status_position` trên `tasks(project_id, status, position)`: **Composite Index đặc thù** giúp truy vấn cột bảng Kanban (`WHERE project_id = ? AND status = ? ORDER BY position ASC`) thực thi trực tiếp trên Index Scan, loại bỏ hoàn toàn chi phí Filesort trong PostgreSQL.
- `idx_tasks_deadline_reminder`: Partial Index tối ưu hóa truy vấn quét các công việc sắp đến hạn trong 24 giờ tới (`WHERE status <> 'DONE' AND reminded = FALSE`).

---

## PHẦN 4: CƠ CHẾ BẢO MẬT & PHÂN QUYỀN CHUYÊN SÂU

### 4.1. Xác thực Đa phương thức & Bảo mật Kết nối WebSocket STOMP
1. **Đăng nhập truyền thống & Google OAuth 2.0:** Mã hóa mật khẩu bằng **BCrypt** (`BCryptPasswordEncoder`) và xác thực ID Token qua Google Identity Services REST API.
2. **Cơ chế Thu hồi Token Tức thì (JWT Token Blacklist qua Redis):** Khi người dùng gọi `POST /api/auth/logout`, token được đưa vào Redis với key `token:blacklist:{jwt}` cùng TTL 24h.
3. **Bảo mật WebSocket STOMP (`AuthChannelInterceptor`):**
   - Chặn bắt khung tin `StompCommand.CONNECT`: Bắt buộc xác thực JWT từ header `Authorization: Bearer <token>` và kiểm tra Redis Blacklist trước khi cho phép thiết lập phiên kết nối.
   - Chặn bắt khung tin `StompCommand.SUBSCRIBE`: Kiểm tra quyền thành viên trên từng đích đến (`/topic/projects/{projectId}`, `/topic/workspaces/{workspaceId}`, `/topic/notifications/{userId}`), ngăn chặn triệt để hành vi nghe lén dữ liệu chéo dự án.
4. **Bảo mật Kho Lưu trữ MinIO (`MinioService`):**
   - Chỉ mở quyền đọc trực tiếp cho thư mục ảnh đại diện (`images/*`), giữ riêng tư tuyệt đối cho thư mục tài liệu (`documents/*`) và cấp phát **Presigned URL** có thời hạn 15 phút.

### 4.2. Bộ lọc Giới hạn Tần suất (Rate Limiting Filter)
- Triển khai thuật toán **Fixed Window Counter** trên Redis (`RateLimitingFilter`).
- Giới hạn tối đa **15 yêu cầu / phút / IP** cho toàn bộ endpoint AI (`/api/ai/**`, `/api/tasks/{id}/ai-subtasks`, `/api/tasks/{id}/suggest-subtasks`).
- Tự động phản hồi mã trạng thái HTTP 429 (*Too Many Requests*) kèm thông báo bằng tiếng Việt khi vượt ngưỡng.

### 4.3. Động cơ Phân quyền Hạt mịn 16 Quyền (Fine-Grained RBAC & ABAC)
Hệ thống triển khai `SecurityService` cho phép kiểm soát quyền theo mô hình ma trận phân cấp kết hợp kế thừa và ghi đè:

```
[ Bước 1: Direct Member Override ] -> Kiểm tra bảng workspace_member_permissions (Ghi đè cá nhân)
                │ (Nếu không có)
                ▼
[ Bước 2: Admin Bypass ] -----------> Nếu User Role = ADMIN -> Cho phép toàn quyền (True)
                │ (Nếu không phải Admin)
                ▼
[ Bước 3: Custom Role Permissions ] -> Tra cứu ma trận quyền của roleId trong bảng workspace_role_permissions
                │ (Nếu là vai trò mặc định)
                ▼
[ Bước 4: Default System Roles ] ----> MEMBER (Toàn quyền trừ xóa/quản trị workspace)
                                      VIEWER (Chỉ có quyền VIEW)
```

**Danh mục 16 Quyền Hạn Chi Tiết:**
- *Cấp Workspace:* `WORKSPACE_VIEW`, `WORKSPACE_UPDATE`, `WORKSPACE_DELETE`, `WORKSPACE_MEMBER_INVITE`, `WORKSPACE_MEMBER_REMOVE`, `WORKSPACE_ROLE_MANAGE`.
- *Cấp Project:* `PROJECT_CREATE`, `PROJECT_VIEW`, `PROJECT_UPDATE`, `PROJECT_DELETE`.
- *Cấp Task:* `TASK_CREATE`, `TASK_VIEW`, `TASK_UPDATE`, `TASK_DELETE`, `TASK_COMMENT_CREATE`, `TASK_COMMENT_DELETE`.

---

## PHẦN 5: HIỆN THỰC CÁC THUẬT TOÁN & TÍNH NĂNG ĐỘT PHÁ

### 5.1. Thuật toán Fractional Positioning & Khóa Lạc quan (`@Version`) trong Kéo thả Kanban
- **Vấn đề của phương pháp truyền thống:** Khi kéo thả thay đổi vị trí một thẻ trong danh sách có $N$ phần tử, việc đánh số thứ tự nguyên ($1, 2, 3...$) buộc hệ thống phải chạy câu lệnh `UPDATE` cập nhật lại chỉ mục của hàng loạt dòng ghi, gây nghẽn CSDL và xung đột khóa (Lock Contention).
- **Giải thuật Fractional Positioning trên Homix v2.0:** Lưu tọa độ dạng số thực (`Double position`) kết hợp trường khóa lạc quan `@Version Long version`. Khi kéo thả thẻ vào vị trí bất kỳ, vị trí mới được tính toán cục bộ $O(1)$ dựa trên 2 phần tử lân cận:
  $$\text{position} = \begin{cases} 
  1.0 & \text{khi cột rỗng} \\
  \text{nextPosition} - 1.0 & \text{khi chèn lên đầu cột (chống suy biến về 0)} \\
  \text{prevPosition} + 1.0 & \text{khi chèn xuống cuối cột} \\
  \frac{\text{prevPosition} + \text{nextPosition}}{2.0} & \text{khi chèn vào giữa hai thẻ}
  \end{cases}$$
- **Bộ lập lịch chống suy biến số thực (`PositionReindexScheduler`):** Để giải quyết triệt để bài toán Floating-point Underflow khi khoảng cách $\Delta < 10^{-4}$, một background job chạy định kỳ 10 phút tự động chuẩn hóa lại tọa độ về cấp số cộng ($1000.0, 2000.0, 3000.0\dots$) và phát sự kiện WebSocket `"REINDEX_POSITIONS"` tới `/topic/projects/{projectId}`.

### 5.2. Động cơ Trợ lý AI, Hàng đợi Redis Bất đồng bộ (`AiWorker`) & Chiến lược Dự phòng Kép
- **Hàng đợi Redis Bất đồng bộ cho AI Auto-Subtasks (`AiWorker.java` & `AiJob.java`):**
  - Khi người dùng gọi `POST /api/tasks/{id}/ai-subtasks`, `TaskController` đóng gói `AiJob` đẩy vào hàng đợi Redis `ai-subtasks-queue` (`LPUSH`) và trả về ngay lập tức `HTTP 202 Accepted` (< 50ms), giải phóng luồng HTTP.
  - Luồng nền `AiWorker` lắng nghe hàng đợi qua lệnh `BRPOP` (timeout 5s), thực thi gọi AI kèm cơ chế thử lại tối đa 3 lần (Exponential Backoff), lưu danh sách subtasks vào PostgreSQL và phát sóng gói tin WebSocket `"AI_SUBTASKS_COMPLETED"` tới `/topic/projects/{projectId}`.
- **Tầng 1 (Primary):** Gọi trực tiếp Google Gemini 2.0 Flash REST API (`gemini-2.0-flash`, `gemini-1.5-flash`).
- **Tầng 2 (Secondary Fallback):** Tự động chuyển hướng qua OpenRouter Gateway (`deepseek/deepseek-r1:free`, `qwen/qwen-2.5-coder-32b`, `llama-3.3-70b`) khi gặp sự cố cạn quota hoặc lỗi mạng.
- **Kỹ nghệ Câu lệnh PMO (Executive 5-Section Report):**
  - AI đóng vai Giám đốc Quản trị Dự án Cấp cao (*Chief PMO*), ép cấu trúc đầu ra thành JSON Array gồm đúng 5 phân hệ báo cáo chuyên sâu và 5 mô hình biểu đồ định lượng (`doughnut`, `bar`, `radar`, `stackedBar`, `line`).

### 5.3. Tối ưu Hiện diện Trực tuyến & Chống Spam Thông báo bằng Redis (Presence Optimization)
- Trong mô-đun thảo luận công việc (`CommentService`), khi người dùng mở xem tab bình luận của một Task, hệ thống ghi nhận `userId` vào Redis Set `task:viewers:{taskId}` với TTL 15 giây.
- Khi có bình luận mới, hệ thống tự động loại trừ những người đang xem trực tiếp màn hình đó khỏi danh sách gửi thông báo đẩy và email, loại bỏ triệt để hiện tượng Spam thông báo.

### 5.4. Đồng bộ Realtime Đa kênh (STOMP Multiplexing) & Tổng hợp Âm thanh Web Audio API
- Sử dụng Spring WebSocket STOMP qua 4 chủ đề phân tán trên một kết nối Singleton duy nhất (`useProjectSocket.ts`):
  1. `/topic/projects/{projectId}`: Đồng bộ thao tác Kanban (Tạo, Sửa, Xóa, Kéo thả, Reindex, AI Subtasks hoàn tất).
  2. `/topic/workspaces/{workspaceId}`: Đồng bộ thay đổi thành viên và quyền hạn.
  3. `/topic/notifications/{userId}`: Kênh thông báo cá nhân (phân công, phản hồi lời mời).
  4. `/topic/chat/{targetType}/{targetId}`: Phòng chat nhóm thời gian thực.
- **Web Audio API Chime Synthesis:** Component `ChatWidget` tự động phát âm thanh chuông đôi (Sine wave Oscillator tại tần số nốt E5 659.25Hz và A5 880.00Hz) trực tiếp bằng thuật toán âm thanh của trình duyệt.

### 5.5. Cổng Thanh toán & Vòng đời Thuê bao VIP
- **VNPay 2.1.0:** Tạo URL thanh toán và xác thực đối soát chữ ký số **HMAC-SHA512** (`verifyVnPayHash`) tại callback IPN/Return URL trước khi kích hoạt đơn hàng. Tự động sinh mã VietQR chuẩn ngân hàng.
- **PayPal Smart Buttons:** Tích hợp PayPal JavaScript SDK, tự động chuyển đổi tỷ giá VNĐ sang USD và xác nhận capture thanh toán có bảo vệ xác thực JWT.
- **Vòng đời Thuê bao Tự động:** Khi callback hợp lệ, giao dịch được xác thực (Idempotent check), tài khoản người dùng được tự động nâng cấp lên `PRO` hoặc `ENTERPRISE`, cộng 30 ngày hoặc 365 ngày và kích hoạt `EmailService` xuất hóa đơn HTML gửi về hòm thư người dùng.

---

## PHẦN 6: THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (FRONTEND & DESIGN SYSTEM)

### 6.1. Hệ thống Design Tokens & Dark/Light Mode
- Xây dựng trên nền tảng Tailwind CSS v4, sử dụng CSS Custom Properties phân lớp (`--background`, `--surface`, `--card`, `.glass`, `.glass-glow`).
- **Cơ chế Chống Nhấp Nháy Giao Diện (FOUC Prevention):** Chèn mã script đọc `localStorage` đồng bộ vào thẻ `<head>` của `layout.tsx`, gán thuộc tính `data-theme` trước khi trình duyệt vẽ DOM.

### 6.2. Hệ thống Bản địa hóa Đa ngôn ngữ (i18n Engine)
- Module `i18n.tsx` cung cấp React Context Provider với hơn **120 nhóm từ khóa song ngữ Việt - Anh** hoàn chỉnh, khởi tạo trạng thái ngôn ngữ bằng lazy state initializer chuẩn React 19 (đạt 0 lỗi/cảnh báo ESLint trên toàn dự án).

---

## PHẦN 7: DEVOPS, CONTAINERIZATION & CI/CD PIPELINE

### 7.1. Cấu hình Docker Compose (5 Dịch vụ Cách ly)
- **`smart_postgres`** (`postgres:15-alpine`): Cổng host `5433:5432`, volume `postgres_data`, tự động thực thi kịch bản `init-db/schema.sql` (21 bảng thực thể + 1 bảng tập hợp) khi khởi tạo.
- **`smart_redis`** (`redis:7-alpine`): Cổng host `6379:6379`, volume `redis_data`, bộ đệm và hàng đợi tin nhắn (`ai-subtasks-queue`, `email-invitations-queue`).
- **`smart_minio`** (`minio/minio`): Cổng API `9020:9000`, Console `9021:9001`, lưu trữ tệp đối tượng tương thích S3.
- **`smart_backend`** (Spring Boot 3.4.1 / JDK 21 Alpine): Cổng host `8000:8080`, phụ thuộc vào trạng thái `healthy` của Postgres và Redis.
- **`smart_frontend`** (Next.js 16 / Node 20 Alpine): Cổng host `3000:3000`.

### 7.2. Tự động hóa CI/CD với GitHub Actions (`.github/workflows/ci-cd.yml`)
- Tự động kích hoạt khi có sự kiện `push` hoặc `pull_request` vào nhánh `main`/`master`.
- **Job 1 (Backend):** Khởi tạo môi trường Ubuntu, nạp PostgreSQL 15 và Redis 7 service containers, thực thi `psql -f init-db/schema.sql` để kiểm định cấu trúc 21 bảng, cấu hình JDK 21 Temurin, thực thi `./gradlew test --info` và đóng gói `./gradlew bootJar -x test`.
- **Job 2 (Frontend):** Thiết lập Node.js 20, thực thi `npm ci`, kiểm tra chất lượng mã nguồn `npm run lint` (0 errors, 0 warnings) và biên dịch tối ưu `npm run build`.

---

## PHẦN 8: MA TRẬN TRẠNG THÁI HIỆN THỰC HỆ THỐNG (IMPLEMENTATION STATUS MATRIX)

| Phân hệ / Tính năng | Trạng thái thực tế trong mã nguồn | Chi tiết kỹ thuật & File minh chứng |
| :--- | :---: | :--- |
| **Đăng nhập & Đăng ký Email/Mật khẩu (BCrypt)** | `HOÀN THÀNH 100%` | `AuthController.java`, `AuthService.java`, `login/page.tsx` |
| **Đăng nhập Google OAuth 2.0 / GIS SDK** | `HOÀN THÀNH 100%` | `api/auth/google`, Google GIS Client ID trong `.env` |
| **Thu hồi Token JWT qua Redis Blacklist** | `HOÀN THÀNH 100%` | `TokenBlacklistService.java`, `JwtAuthenticationFilter.java` |
| **Bảo mật WebSocket STOMP (`AuthChannelInterceptor`)** | `HOÀN THÀNH 100%` | `AuthChannelInterceptor.java`, `WebSocketConfig.java` |
| **Bảo mật MinIO & Cấp phát Presigned URL 15 phút** | `HOÀN THÀNH 100%` | `MinioService.java`, `UploadController.java` |
| **Bộ lọc Giới hạn Tần suất (Rate Limiter 15 req/min)** | `HOÀN THÀNH 100%` | `RateLimitingFilter.java` (`/api/ai/**`, `*/ai-subtasks`) |
| **Quản trị Workspace & Cây Thư mục Tài liệu** | `HOÀN THÀNH 100%` | `WorkspaceController.java`, `workspace/[id]/page.tsx` |
| **Hệ thống Ma trận Phân quyền 16 Quyền (Custom RBAC)** | `HOÀN THÀNH 100%` | `SecurityService.java`, `WorkspaceRoleController.java` |
| **Phê duyệt Xóa Dự án Hai bước (Two-Phase Approval)** | `HOÀN THÀNH 100%` | `ProjectDeletionRequestEntity.java`, `ProjectService.java` |
| **Bảng Kanban Kéo thả Fractional Positioning + `@Version`** | `HOÀN THÀNH 100%` | `TaskService.java` (moveTask), `TaskEntity.java`, `components/kanban/*` |
| **Lập lịch Chống suy biến số thực & Broadcast Reindex** | `HOÀN THÀNH 100%` | `PositionReindexScheduler.java` (`REINDEX_POSITIONS`) |
| **Đồng bộ Realtime WebSocket STOMP Singleton (4 kênh)** | `HOÀN THÀNH 100%` | `WebSocketConfig.java`, `socket.ts`, `useProjectSocket.ts` |
| **Trợ lý AI Báo cáo PMO 5 phần & Biểu đồ** | `HOÀN THÀNH 100%` | `AiService.java`, `OpenRouterServiceClient.java` |
| **Tìm kiếm Ngữ nghĩa AI (Semantic Search)** | `HOÀN THÀNH 100%` | `AiController.java`, `AiService.java` (smartSearchTasks) |
| **Hàng đợi AI Auto-Subtasks Bất đồng bộ (`LPUSH`/`BRPOP`)** | `HOÀN THÀNH 100%` | `AiWorker.java`, `AiJob.java`, `TaskController.java` (HTTP 202) |
| **Thảo luận Cây lồng nhau & Tránh spam qua Redis** | `HOÀN THÀNH 100%` | `CommentService.java` (setViewingDiscussion, Redis Set) |
| **Hàng đợi Gửi Email Lời mời qua Redis Queue** | `HOÀN THÀNH 100%` | `EmailWorker.java` (`email-invitations-queue`) |
| **Lập lịch Cảnh báo Deadline Công việc (24h Alert)** | `HOÀN THÀNH 100%` | `TaskDeadlineReminderScheduler.java` (cron 1 phút + In-App Bell) |
| **Cổng Thanh toán VNPay (Xác thực HMAC-SHA512 & VietQR)**| `HOÀN THÀNH 100%` | `PaymentService.java` (`verifyVnPayHash`), `PaymentController.java` |
| **Cổng Thanh toán Quốc tế PayPal Smart Buttons** | `HOÀN THÀNH 100%` | PayPal SDK JavaScript, `POST /api/payments/paypal/capture` |
| **Gửi Hóa đơn Email Tự động khi Thanh toán VIP** | `HOÀN THÀNH 100%` | `EmailService.java` (sendPaymentSuccessEmail) |
| **Portal Quản trị Admin Hệ thống & Thống kê KPI** | `HOÀN THÀNH 100%` | `AdminController.java`, `client/src/app/admin/page.tsx` |
| **Xuất Báo cáo Người dùng & Doanh thu Excel (.xlsx)**| `HOÀN THÀNH 100%` | SheetJS `XLSX.utils.json_to_sheet` trên Admin Portal |
| **Hệ thống Design System Dark/Light & i18n Song ngữ** | `HOÀN THÀNH 100%` | `globals.css`, `ThemeToggle.tsx`, `i18n.tsx` (>120 keys, 0 ESLint errors) |
| **Bộ Kiểm thử Đơn vị & Tích hợp (11 test classes)** | `HOÀN THÀNH 100%` | JUnit 5 + Mockito trong `server/src/test/**` |
| **Containerization Docker Compose & 21-Table Schema** | `HOÀN THÀNH 100%` | `docker-compose.yml`, `init-db/schema.sql` |
| **Quy trình Tự động hóa CI/CD GitHub Actions** | `HOÀN THÀNH 100%` | `.github/workflows/ci-cd.yml` |

---

## KẾT LUẬN & ĐÁNH GIÁ HỌC THUẬT

Hệ sinh thái **Homix v2.0** là một công trình phần mềm hoàn chỉnh, đáp ứng xuất sắc các tiêu chí học thuật khắt khe của một **Đồ án / Khóa luận tốt nghiệp chuyên ngành Kỹ thuật Phần mềm / Công nghệ Thông tin**:
1. **Tính hoàn thiện (Completeness):** Toàn bộ các luồng từ Đăng ký, Phân quyền 16 quyền hạn, Quản trị, Kéo thả Kanban, Tương tác Realtime, Tích hợp Trí tuệ Nhân tạo bất đồng bộ, Thanh toán trực tuyến có đối soát chữ ký số cho đến DevOps CI/CD đều đã được hiện thực hóa 100% trong mã nguồn và đồng bộ hoàn toàn với thiết kế CSDL 21 bảng.
2. **Tính học thuật & Thuật toán (Academic Rigor):** Dự án sở hữu các điểm sáng nghiên cứu chuyên sâu bao gồm: giải thuật Fractional Positioning kết hợp khóa lạc quan `@Version` giải quyết bài toán $O(1)$ Reordering trên CSDL quan hệ, hàng đợi tác vụ kép trên Redis (`AiWorker` & `EmailWorker`), cơ chế Presence Detection trên In-Memory Redis, kiến trúc Dual-Fallback AI Gateway với kỹ nghệ Prompt JSON có kiểm soát, và mô hình bảo mật chiều sâu RBAC/ABAC + STOMP ChannelInterceptor.
3. **Tính ứng dụng & Khả năng mở rộng (Scalability):** Thiết kế Module hóa chuẩn mực, hệ thống lưu trữ phân tán MinIO S3 với Presigned URLs, bộ đệm đa nhiệm Redis, kiến trúc Container hóa đồng bộ giúp hệ thống sẵn sàng triển khai trên môi trường Production Cloud thực tế.
