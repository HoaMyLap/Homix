# LỘ TRÌNH THỰC HIỆN DỰ ÁN & ĐÁNH GIÁ MỨC ĐỘ HOÀN THIỆN

Tài liệu này dùng để theo dõi tiến độ thực hiện dự án **Hệ thống Quản lý công việc và Cộng tác dự án thông minh** sử dụng công nghệ **Java Spring Boot** cho Backend và **Next.js** cho Frontend.

Bạn có thể đánh dấu `[x]` thay cho `[ ]` khi hoàn thành các đầu việc dưới đây để tự động theo dõi mức độ hoàn thành (% Progress).

---

## 📊 Bảng Theo Dõi Tiến Độ Tổng Thể

| Sprint | Nội dung chính | Trạng thái | Số Task Hoàn Thành / Tổng số | Tỉ Lệ Hoàn Thành |
| :--- | :--- | :---: | :---: | :---: |
| **Sprint 1** | Thiết lập Hạ tầng & Cơ sở dữ liệu | `Hoàn thành` | 6 / 6 | 100% |
| **Sprint 2** | Xác thực & Quản trị Hệ thống | `Chưa bắt đầu` | 0 / 6 | 0% |
| **Sprint 3** | Quản lý Kanban & Đồng bộ Real-time | `Chưa bắt đầu` | 0 / 6 | 0% |
| **Sprint 4** | Trợ lý AI & Triển khai Đóng gói | `Chưa bắt đầu` | 0 / 6 | 0% |
| **Tổng cộng** | **Toàn bộ hệ thống** | **-** | **6 / 24** | **25%** |

---

## 🏃‍♂️ Chi Tiết Từng Sprint & Tiêu Chí Nghiệm Thu

### SPRINT 1: Thiết Lập Hạ Tầng & Cơ Sở Dữ Liệu
*Mục tiêu: Dựng thành công môi trường docker-compose chạy dưới local, khởi tạo hoàn chỉnh dự án backend (Spring Boot 3.x), frontend (Next.js) và database schema.*

*   [x] **Task 1.1**: Khởi chạy thành công các container cơ bản (PostgreSQL, Redis) qua `docker-compose.yml`.
    *   *Tiêu chí nghiệm thu*: Cả 2 service đều ở trạng thái `healthy` trên Docker Desktop, có thể kết nối từ máy Host.
*   [x] **Task 1.2**: Thực thi file `init-db/schema.sql` khởi tạo thành công cấu trúc bảng và các triggers trong Postgres.
    *   *Tiêu chí nghiệm thu*: Có đầy đủ 8 bảng dữ liệu, chạy thử câu lệnh SQL chèn dữ liệu không báo lỗi khóa ngoại.
*   [x] **Task 1.3**: Khởi tạo khung dự án Next.js (Frontend) với TailwindCSS và Shadcn/ui.
    *   *Tiêu chí nghiệm thu*: Khởi chạy Next.js cục bộ qua cổng `3000` thành công, cài đặt được gói thư viện UI cơ bản.
*   [x] **Task 1.4**: Khởi tạo khung dự án Spring Boot (Backend) với Maven và Java 17/21.
    *   *Tiêu chí nghiệm thu*: Khởi chạy thành công Spring Boot cục bộ qua cổng `8080`, kết nối thành công tới Database qua JPA.
*   [x] **Task 1.5**: Thiết lập cấu hình biến môi trường (`application.yml`) và profiles phát triển.
    *   *Tiêu chí nghiệm thu*: Đọc thành công các cấu hình cơ sở dữ liệu và Redis từ biến môi trường.
*   [x] **Task 1.6**: Viết file `Dockerfile.dev` cho cả Client (Next.js) và Server (Spring Boot).
    *   *Tiêu chí nghiệm thu*: Chạy lệnh `docker-compose build` thành công, không gặp lỗi cài đặt thư viện/JDK.

---

### SPRINT 2: Xác Thực, Phân Quyền & Quản Trị Hệ Thống (Spring Security & JPA)
*Mục tiêu: Xây dựng xong hệ thống xác thực an toàn bằng Spring Security + JWT, cơ chế phân quyền RBAC và các API quản lý Workspace/Thành viên.*

*   [ ] **Task 2.1**: Thiết lập Spring Data JPA entities khớp với Database Schema, cấu hình Hibernate ddl-auto.
    *   *Tiêu chí nghiệm thu*: Kiểm tra log khởi động thấy Spring Boot map thành công các entities với database postgres.
*   [ ] **Task 2.2**: Xây dựng bộ lọc Spring Security và JWT Authentication Filter.
    *   *Tiêu chí nghiệm thu*: Mật khẩu được mã hóa bằng `BCryptPasswordEncoder`, API đăng nhập trả về JWT hợp lệ.
*   [ ] **Task 2.3**: Phát triển Annotation/AOP hoặc Security Guards phân quyền truy cập dự án (RBAC).
    *   *Tiêu chí nghiệm thu*: Người có vai trò `VIEWER` trong Workspace không thể gọi API xóa Dự án (`HTTP 403 Forbidden`).
*   [ ] **Task 2.4**: Phát triển cụm API REST CRUD cho Workspace.
    *   *Tiêu chí nghiệm thu*: Tạo mới Workspace thành công thông qua JPA, tự động gán User làm `ADMIN`.
*   [ ] **Task 2.5**: Phát triển API mời thành viên vào Workspace qua email (sử dụng Spring Async hoặc Redis Queue chạy ngầm).
    *   *Tiêu chí nghiệm thu*: Khi gửi yêu cầu mời, Job được đẩy vào hàng đợi và gửi mail ngầm thành công.
*   [ ] **Task 2.6**: Thiết kế giao diện Frontend cho Login, Register và Chọn Workspace.
    *   *Tiêu chí nghiệm thu*: Giao diện Next.js responsive, xử lý lưu token JWT vào Cookies/LocalStorage và chuyển hướng trang hợp lệ.

---

### SPRINT 3: Quản Lý Kanban Board & Đồng Bộ Real-Time (WebSockets STOMP)
*Mục tiêu: Xây dựng bảng Kanban tương tác kéo thả mượt mà, đồng bộ hóa vị trí tức thời qua giao thức STOMP WebSockets.*

*   [ ] **Task 3.1**: Phát triển cụm API REST CRUD cho Projects và Tasks trong Spring Boot.
    *   *Tiêu chí nghiệm thu*: Tạo mới, chỉnh sửa, xóa project/task hoạt động ổn định qua REST API.
*   [ ] **Task 3.2**: Triển khai giải thuật Fractional Positioning cho Task position trên Backend Service.
    *   *Tiêu chí nghiệm thu*: API cập nhật vị trí tính toán chính xác số thực vị trí mới và lưu lại thành công qua JPA.
*   [ ] **Task 3.3**: Thiết lập WebSocket Broker Config và SimpMessagingTemplate trong Spring Boot.
    *   *Tiêu chí nghiệm thu*: Client bắt tay thành công qua `/ws`, subscribe topic `/topic/project.{id}` tương ứng để nhận tin.
*   [ ] **Task 3.4**: Xây dựng giao diện Kanban Board ở Frontend bằng Next.js và `@hello-pangea/dnd`.
    *   *Tiêu chí nghiệm thu*: Kéo thả thẻ công việc trơn tru giữa các cột `To Do`, `In Progress`, `Done`.
*   [ ] **Task 3.5**: Kết nối SockJS & stomp-client ở Frontend để nhận tin nhắn real-time.
    *   *Tiêu chí nghiệm thu*: Khi Client A kéo thả, màn hình của Client B cập nhật vị trí Task tương tự ngay lập tức.
*   [ ] **Task 3.6**: Xây dựng Modal chi tiết Task hiển thị Checklists, ô bình luận (Comments) và tệp đính kèm.
    *   *Tiêu chí nghiệm thu*: Hiển thị đầy đủ thông tin, cập nhật checklist và bình luận mượt mà.

---

### SPRINT 4: Tích Hợp Trợ Lý AI & Triển Khai Đóng Gói
*Mục tiêu: Hoàn thiện các tính năng AI thông minh chạy ngầm qua Redis Queue, tích hợp AI API và đóng gói dự án.*

*   [ ] **Task 4.1**: Thiết lập WebClient gọi Gemini API / OpenAI API từ Spring Boot.
    *   *Tiêu chí nghiệm thu*: Gọi thử API sinh văn bản cơ bản thành công, bảo mật an toàn API Key trong `.yml`.
*   [ ] **Task 4.2**: Triển khai tính năng AI Auto-Subtasks (Tự động rã việc) qua Redis Queue List và Worker.
    *   *Tiêu chí nghiệm thu*: Nhấn nút rã việc trên UI -> REST API gửi HTTP 202 -> Redis Queue tiếp nhận -> Worker chạy ngầm gọi AI -> Thêm vào DB -> WebSocket gửi danh sách subtasks về hiển thị ngay lập tức.
*   [ ] **Task 4.3**: Triển khai tính năng AI Daily Standup Summarizer (Báo cáo ngày).
    *   *Tiêu chí nghiệm thu*: Truy vấn nhật ký hành động từ `task_logs`, gửi prompt cho AI tóm tắt thành văn bản Markdown và hiển thị lên UI.
*   [ ] **Task 4.4**: Triển khai tính năng AI Smart Search (Tìm kiếm ngữ nghĩa).
    *   *Tiêu chí nghiệm thu*: Tìm kiếm bằng câu lệnh tự nhiên trả về đúng các tasks có ngữ nghĩa tương đương trong hệ thống.
*   [ ] **Task 4.5**: Viết tài liệu hướng dẫn chạy chi tiết và tóm tắt kiểm thử dự án (Walkthrough).
    *   *Tiêu chí nghiệm thu*: Tài liệu hướng dẫn tường tận các bước chạy và kịch bản test để hội đồng chấm điểm dễ làm theo.
*   [ ] **Task 4.6**: Đóng gói dự án bằng file `docker-compose.prod.yml` chạy bản Production.
    *   *Tiêu chí nghiệm thu*: Triển khai toàn bộ dự án trên một VPS hoặc local chạy cổng `80` mượt mà, ổn định.
