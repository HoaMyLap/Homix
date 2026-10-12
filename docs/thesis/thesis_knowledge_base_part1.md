# PROJECT THESIS KNOWLEDGE BASE — HOMIX v2.0 PLATFORM
# PHẦN 1: DATABASE, DOCKER, CI/CD, CONFIG & TESTING

> **Trạng thái**: Đang thu thập dữ liệu từ 6 subagent song song.
> **Phần này đã hoàn thành**: Database Schema, Docker Compose, CI/CD Pipeline, Build Config, Application Config, Dockerfiles, Testing Suite.
> **Đang chờ**: Backend Auth-Admin-Config, Backend Tasks-Projects-Workspaces, Backend AI-Chat-Email-Payments, Frontend Pages, Frontend Libs-Components-CSS.

---

## 1. PROJECT OVERVIEW

- **Tên dự án**: Homix v2.0 — Smart Task & Workspace Manager
- **Tên package backend**: `com.example.smartmanager`
- **Mục đích**: Nền tảng quản lý công việc nhóm thông minh tích hợp AI, hỗ trợ Kanban Board, Real-time WebSocket, Thanh toán VIP, Quản trị hệ thống.
- **Tỉ lệ thiết kế theo tài liệu gốc**: 70% tính năng phần mềm cốt lõi + 30% tính năng AI thông minh.
- **Đối tượng sử dụng**: Nhóm phát triển phần mềm, nhóm dự án, quản lý dự án (PM), quản trị viên hệ thống.

---

## 2. TECHNOLOGY STACK (Xác nhận từ source code)

### Backend
| Công nghệ | Phiên bản | File nguồn xác nhận |
|:--|:--|:--|
| Java | 21 LTS | `build.gradle` → `JavaLanguageVersion.of(21)` |
| Spring Boot | 3.4.1 | `build.gradle` → `org.springframework.boot version '3.4.1'` |
| Spring Security | 6.x | `build.gradle` → `spring-boot-starter-security` |
| Spring Data JPA (Hibernate 6) | — | `build.gradle` → `spring-boot-starter-data-jpa` |
| Spring Data Redis | — | `build.gradle` → `spring-boot-starter-data-redis` |
| Spring WebSocket (STOMP) | — | `build.gradle` → `spring-boot-starter-websocket` |
| Spring Mail (Jakarta Mail) | — | `build.gradle` → `spring-boot-starter-mail` |
| Spring Validation | — | `build.gradle` → `spring-boot-starter-validation` |
| JJWT (JSON Web Token) | 0.11.5 | `build.gradle` → `io.jsonwebtoken:jjwt-api:0.11.5` |
| MinIO Java SDK | 8.5.7 | `build.gradle` → `io.minio:minio:8.5.7` |
| Lombok | — | `build.gradle` → `org.projectlombok:lombok` |
| PostgreSQL Driver | — | `build.gradle` → `org.postgresql:postgresql` |
| JUnit 5 + Mockito | — | `build.gradle` → `spring-boot-starter-test`, `spring-security-test` |

### Frontend
| Công nghệ | Phiên bản | File nguồn xác nhận |
|:--|:--|:--|
| Next.js (App Router) | 16.2.10 | `client/package.json` |
| React | 19.2.4 | `client/package.json` |
| TypeScript | ^5 | `client/package.json` |
| Tailwind CSS | ^4 | `client/package.json` → `@tailwindcss/postcss` |
| Lucide React (Icons) | ^1.25.0 | `client/package.json` |
| SheetJS (XLSX) | ^0.18.5 | `client/package.json` |
| StompJS (WebSocket) | ^7.3.0 | `client/package.json` |
| SockJS Client | ^1.6.1 | `client/package.json` |
| jsonrepair | ^3.15.0 | `client/package.json` |

### Database & Infrastructure
| Công nghệ | Phiên bản | Vai trò |
|:--|:--|:--|
| PostgreSQL | 15-alpine | RDBMS chính |
| Redis | 7-alpine | Cache, Rate Limiter, Token Blacklist, Email Queue |
| MinIO | RELEASE.2024-01-18 | Object Storage (S3-compatible) |
| Docker & Docker Compose | 3.8 | Containerization |

### Third-party Services
| Dịch vụ | Mục đích | File cấu hình |
|:--|:--|:--|
| Google Gemini API | AI (phân rã công việc, tóm tắt) | `.env` → `GEMINI_API_KEY` |
| OpenRouter API | AI Gateway (fallback/alternative) | `.env` → `OPENROUTER_API_KEY` |
| Google OAuth 2.0 | Đăng nhập bằng Google | `.env` → `GOOGLE_CLIENT_ID/SECRET` |
| Gmail SMTP | Gửi email hóa đơn, nhắc nhở | `.env` → `SPRING_MAIL_*` |
| VNPay Sandbox | Thanh toán nội địa Việt Nam | `.env` → `VNPAY_*` |
| PayPal Sandbox | Thanh toán quốc tế | `.env` → `PAYPAL_*` |

---

## 3. DATABASE ANALYSIS (Từ `init-db/schema.sql` — 198 dòng)

### 3.1. Tổng quan
- **DBMS**: PostgreSQL 15+
- **Extension**: `uuid-ossp` (UUID generation)
- **Trigger chung**: `update_updated_at_column()` — Tự động cập nhật `updated_at = CURRENT_TIMESTAMP` trước mỗi UPDATE
- **Tổng số bảng**: 9 bảng
- **Tổng số Index**: 11 indexes (bao gồm 1 composite index đặc thù cho Kanban)

### 3.2. Chi tiết 9 bảng

#### Bảng 1: `users` — Người dùng hệ thống
| Cột | Kiểu dữ liệu | Ràng buộc |
|:--|:--|:--|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` |
| `email` | `VARCHAR(255)` | `NOT NULL UNIQUE` |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` |
| `fullname` | `VARCHAR(100)` | `NOT NULL` |
| `avatar_url` | `TEXT` | Nullable |
| `system_role` | `VARCHAR(50)` | `NOT NULL DEFAULT 'USER'` (ADMIN/USER) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` |

> **Lưu ý**: Các trường `subscription_plan`, `subscription_expires_at` KHÔNG có trong schema.sql ban đầu mà được tự động tạo bởi Hibernate `ddl-auto: update` dựa trên Entity `UserEntity.java`. Đây là điểm cần xác nhận từ Entity analysis.

#### Bảng 2: `workspaces` — Không gian làm việc
| Cột | Kiểu dữ liệu | Ràng buộc |
|:--|:--|:--|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` |
| `name` | `VARCHAR(100)` | `NOT NULL` |
| `description` | `TEXT` | Nullable |
| `owner_id` | `UUID` | `NOT NULL, FK → users(id) ON DELETE CASCADE` |
| `created_at` / `updated_at` | `TIMESTAMP WITH TIME ZONE` | Auto |

#### Bảng 3: `workspace_members` — Bảng trung gian RBAC (Many-to-Many)
| Cột | Kiểu dữ liệu | Ràng buộc |
|:--|:--|:--|
| `workspace_id` | `UUID` | `PK (composite), FK → workspaces(id) CASCADE` |
| `user_id` | `UUID` | `PK (composite), FK → users(id) CASCADE` |
| `role` | `VARCHAR(50)` | `NOT NULL DEFAULT 'MEMBER'` (ADMIN/MEMBER/VIEWER) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Auto |

#### Bảng 4: `projects` — Dự án
| Cột | Kiểu dữ liệu | Ràng buộc |
|:--|:--|:--|
| `id` | `UUID` | `PK` |
| `name` | `VARCHAR(100)` | `NOT NULL` |
| `description` | `TEXT` | Nullable |
| `workspace_id` | `UUID` | `NOT NULL, FK → workspaces(id) CASCADE` |
| `status` | `VARCHAR(50)` | `NOT NULL DEFAULT 'ACTIVE'` (ACTIVE/ARCHIVED/COMPLETED) |
| `created_at` / `updated_at` | timestamps | Auto |

#### Bảng 5: `tasks` — Công việc (Kanban + Subtasks)
| Cột | Kiểu dữ liệu | Ràng buộc |
|:--|:--|:--|
| `id` | `UUID` | `PK` |
| `title` | `VARCHAR(255)` | `NOT NULL` |
| `description` | `TEXT` | Nullable |
| `status` | `VARCHAR(50)` | `NOT NULL DEFAULT 'TODO'` (TODO/IN_PROGRESS/DONE) |
| `priority` | `VARCHAR(50)` | `NOT NULL DEFAULT 'MEDIUM'` (LOW/MEDIUM/HIGH/URGENT) |
| `position` | `DOUBLE PRECISION` | `NOT NULL DEFAULT 0.0` — **Fractional Positioning** |
| `due_date` | `TIMESTAMP WITH TIME ZONE` | Nullable |
| `assignee_id` | `UUID` | `FK → users(id) ON DELETE SET NULL` |
| `creator_id` | `UUID` | `FK → users(id) ON DELETE SET NULL` |
| `project_id` | `UUID` | `NOT NULL, FK → projects(id) CASCADE` |
| `parent_task_id` | `UUID` | `FK → tasks(id) CASCADE` — Self-referencing (Subtasks) |
| `created_at` / `updated_at` | timestamps | Auto |

> **Kỹ thuật đặc biệt**: `position: DOUBLE PRECISION` sử dụng thuật toán Fractional Positioning cho phép kéo thả Kanban mà không cần re-index toàn bộ bảng. Composite Index `idx_tasks_project_status_position ON tasks(project_id, status, position)` tối ưu truy vấn Kanban columns.

#### Bảng 6: `comments` — Bình luận task
| Cột | Kiểu dữ liệu | Ràng buộc |
|:--|:--|:--|
| `id` | `UUID` | `PK` |
| `content` | `TEXT` | `NOT NULL` |
| `user_id` | `UUID` | `NOT NULL, FK → users(id) CASCADE` |
| `task_id` | `UUID` | `NOT NULL, FK → tasks(id) CASCADE` |
| `created_at` / `updated_at` | timestamps | Auto |

#### Bảng 7: `task_logs` — Audit log (phục vụ AI Daily Summary)
| Cột | Kiểu dữ liệu | Ràng buộc |
|:--|:--|:--|
| `id` | `UUID` | `PK` |
| `task_id` | `UUID` | `NOT NULL, FK → tasks(id) CASCADE` |
| `user_id` | `UUID` | `FK → users(id) SET NULL` |
| `action_type` | `VARCHAR(100)` | `NOT NULL` (CREATE/UPDATE_STATUS/UPDATE_ASSIGNEE/ADD_COMMENT/AI_SUBTASKS_GEN) |
| `old_value` / `new_value` | `TEXT` | Nullable |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Auto |

#### Bảng 8: `project_folders` — Thư mục lồng nhau (Self-referencing tree)
| Cột | Kiểu dữ liệu | Ràng buộc |
|:--|:--|:--|
| `id` | `UUID` | `PK` |
| `name` | `VARCHAR(255)` | `NOT NULL` |
| `project_id` | `UUID` | `NOT NULL, FK → projects(id) CASCADE` |
| `parent_id` | `UUID` | `FK → project_folders(id) CASCADE` — Self-ref tree |
| `created_by` | `UUID` | Nullable |
| `created_at` | timestamp | Auto |

#### Bảng 9: `project_files` — File đính kèm (metadata → MinIO S3)
| Cột | Kiểu dữ liệu | Ràng buộc |
|:--|:--|:--|
| `id` | `UUID` | `PK` |
| `name` | `VARCHAR(255)` | `NOT NULL` |
| `url` | `TEXT` | `NOT NULL` |
| `size` | `BIGINT` | `NOT NULL DEFAULT 0` |
| `type` | `VARCHAR(255)` | Nullable |
| `project_id` | `UUID` | `NOT NULL, FK → projects(id) CASCADE` |
| `folder_id` | `UUID` | `FK → project_folders(id) SET NULL` |
| `uploader_id` | `UUID` | Nullable |
| `uploaded_at` | timestamp | Auto |

### 3.3. Entity Relationship Diagram (ERD)
```
User 1 ──── N Workspace (owner)
User N ──── N Workspace (via workspace_members, roles: ADMIN/MEMBER/VIEWER)
Workspace 1 ──── N Project
Project 1 ──── N Task
Task 1 ──── N Task (parent_task_id → subtasks, self-referencing)
Task 1 ──── N Comment
Task 1 ──── N TaskLog (audit)
User 1 ──── N Task (assignee)
User 1 ──── N Task (creator)
User 1 ──── N Comment
Project 1 ──── N ProjectFolder
ProjectFolder 1 ──── N ProjectFolder (parent_id → tree)
Project 1 ──── N ProjectFile
ProjectFolder 1 ──── N ProjectFile
```

### 3.4. Database Indexes (11 total)
1. `idx_users_email` ON `users(email)` — Login/uniqueness
2. `idx_workspaces_owner` ON `workspaces(owner_id)` — Owner lookup
3. `idx_workspace_members_user` ON `workspace_members(user_id)` — User's workspaces
4. `idx_projects_workspace` ON `projects(workspace_id)` — Projects in workspace
5. `idx_tasks_project` ON `tasks(project_id)` — Tasks in project
6. `idx_tasks_assignee` ON `tasks(assignee_id)` — Assigned tasks
7. `idx_tasks_parent` ON `tasks(parent_task_id)` — Subtask tree
8. `idx_comments_task` ON `comments(task_id)` — Task comments
9. `idx_task_logs_task` ON `task_logs(task_id)` — Task history
10. `idx_task_logs_created_at` ON `task_logs(created_at)` — AI daily summary (24h filter)
11. `idx_tasks_project_status_position` ON `tasks(project_id, status, position)` — **Composite Index cho Kanban Board**

---

## 4. DOCKER & DEPLOYMENT

### 4.1. Docker Compose Architecture (5 services)
```
Internet
   ↓
Host Machine (Windows)
   ├── Port 3000 → smart_frontend (Next.js 16 / Node 20-alpine)
   ├── Port 8000 → smart_backend (Spring Boot 3.4.1 / JDK 21-alpine)
   ├── Port 5433 → smart_postgres (PostgreSQL 15-alpine)
   ├── Port 6379 → smart_redis (Redis 7-alpine)
   └── Port 9020/9021 → smart_minio (MinIO S3)
   
   Internal Network: app_network (bridge)
   Named Volumes: postgres_data, redis_data, minio_data
```

### 4.2. Startup Dependencies
```
postgres (healthcheck: pg_isready) ──┐
redis (healthcheck: redis-cli ping) ──┤──→ backend ──→ frontend
minio (service_started) ──────────────┘
```

### 4.3. Dockerfiles
- **Backend**: `eclipse-temurin:21-jdk-alpine` → `./gradlew bootRun` (dev hot-reload)
- **Frontend**: `node:20-alpine` → `npm install` → `npm run dev` (Turbopack)

---

## 5. CI/CD PIPELINE (GitHub Actions)

### Pipeline: `Homix v2.0 CI/CD Pipeline`
- **Trigger**: push/PR to `main` or `master`

#### Job 1: `backend-test-and-build`
```
Checkout → Setup JDK 21 (temurin, cache: gradle) → chmod +x gradlew 
→ ./gradlew test --info (with postgres:15 & redis:7 service containers) 
→ ./gradlew bootJar -x test
```

#### Job 2: `frontend-test-and-build`
```
Checkout → Setup Node.js 20 (cache: npm) → npm ci → npm run build
```

---

## 6. TESTING ANALYSIS

### 6.1. Tổng quan
- **Tổng số file test**: 8 files
- **Framework**: JUnit 5 + Mockito + Spring Boot Test
- **Loại test**: Unit Tests (Mockito) + Integration Tests (SpringBootTest)

### 6.2. Chi tiết Test Coverage

| Test File | Loại | Service Tested | Test Cases | Mô tả |
|:--|:--|:--|:--|:--|
| `SmartManagerApplicationTests` | Integration | Application Context | 1 | Context loads successfully |
| `AuthServiceTest` | Unit (Mockito) | AuthService | 5 | Register, Login, Logout+Blacklist, Admin auto-grant |
| `JwtTokenProviderTests` | Integration | JwtTokenProvider | 1 | Token generation + validation |
| `AdminServiceTest` | Unit (Mockito) | AdminService | 2 | Dashboard stats, Update user plan |
| `PaymentServiceTest` | Unit (Mockito) | PaymentService | 2 | Payment callback, Cancel subscription |
| `TaskServiceTests` | Integration | TaskService | 1 (4 cases) | Fractional Positioning algorithm |
| `ChatServiceTests` | Unit (Mockito) | ChatService | 2 | Save message, Message history |
| `OpenRouterServiceClientTests` | Unit | OpenRouterServiceClient | 3 | JSON parse, Markdown unwrap, Fallback text parse |

### 6.3. Thuật toán đáng chú ý được kiểm thử
- **Fractional Positioning** (TaskServiceTests):
  - Kéo vào cột rỗng: `position = 1.0`
  - Kéo lên đầu: `position = next / 2.0`
  - Kéo xuống cuối: `position = prev + 1.0`
  - Kéo vào giữa: `position = (prev + next) / 2.0`

- **AI Response Parser** (OpenRouterServiceClientTests):
  - Clean JSON: `["Task 1", "Task 2"]` → parse trực tiếp
  - Markdown-wrapped: ` ```json\n[...]\n``` ` → strip markdown rồi parse
  - Fallback text: `1. Setup\n2. Write` → regex extract

---

## 7. APPLICATION CONFIGURATION

### `application.yml` Key Settings
- `server.port`: 8080
- `spring.profiles.active`: dev
- `spring.jpa.hibernate.ddl-auto`: update (auto-sync Entity ↔ DB)
- `spring.jpa.show-sql`: true
- `spring.servlet.multipart.max-file-size`: 50MB
- `app.jwt.expiration-ms`: 86400000 (24 hours)
- `logging.level.org.springframework.security`: DEBUG

---

> **TIẾP TỤC**: Đang chờ kết quả từ 5 subagent còn lại (Backend packages, Frontend pages, Frontend libs).
> Khi nhận được sẽ bổ sung vào Part 2, Part 3...
