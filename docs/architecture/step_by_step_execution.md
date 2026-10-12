# HƯỚNG DẪN TỪNG BƯỚC TRIỂN KHAI DỰ ÁN (STEP-BY-STEP EXECUTION GUIDE)

Tài liệu này cung cấp hướng dẫn chi tiết từng bước xây dựng hệ thống **Quản lý công việc và Cộng tác dự án thông minh (AI-Powered Project Management Tool)**. Hệ thống bao gồm Backend phát triển trên **Java Spring Boot 3.x** và Frontend phát triển trên **Next.js**.

---

## CẤU TRÚC THƯ MỤC DỰ ÁN MẪU (MAVEN SPRING BOOT)

```text
smart-task-manager-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── smartmanager/
│   │   │               ├── SmartManagerApplication.java
│   │   │               ├── config/                         # Các cấu hình của dự án
│   │   │               │   ├── SecurityConfig.java
│   │   │               │   ├── RedisQueueConfig.java
│   │   │               │   ├── WebSocketConfig.java
│   │   │               │   └── AppConfig.java
│   │   │               ├── auth/                           # Đăng nhập, đăng ký, JWT
│   │   │               │   ├── AuthController.java
│   │   │               │   ├── AuthService.java
│   │   │               │   ├── JwtTokenProvider.java
│   │   │               │   ├── JwtAuthenticationFilter.java
│   │   │               │   └── Dtos.java
│   │   │               ├── workspaces/                     # Không gian làm việc
│   │   │               │   ├── WorkspaceEntity.java
│   │   │               │   ├── WorkspaceRepository.java
│   │   │               │   └── WorkspaceController.java
│   │   │               ├── tasks/                          # Công việc, Kanban
│   │   │               │   ├── TaskEntity.java
│   │   │               │   ├── TaskRepository.java
│   │   │               │   ├── TaskService.java
│   │   │               │   ├── TaskController.java
│   │   │               │   └── processors/
│   │   │               │       └── AiSubtaskWorker.java    # Redis Queue Worker rã việc
│   │   │               ├── ai/                             # Tích hợp AI (Gemini/OpenAI)
│   │   │               │   ├── ports/
│   │   │               │   │   └── AiIntegrationService.java
│   │   │               │   └── adapters/
│   │   │               │       └── GeminiAiAdapter.java
│   │   │               └── realtime/                       # WebSockets Broadcast
│   │   │                   └── ProjectNotificationService.java
│   │   └── resources/
│   │       ├── application.yml                             # Cấu hình môi trường
│   │       └── schema.sql                                  # File khởi tạo DB
│   └── test/
└── pom.xml                                                 # Quản lý thư viện Maven
```

---

## PHẦN 1: THIẾT LẬP MÔI TRƯỜNG BAN ĐẦU (Mức độ: Dễ)

### 1.1. Cài đặt các công cụ phát triển
*   **JDK 17 hoặc 21**: Tải từ Oracle hoặc Eclipse Temurin. Kiểm tra bằng lệnh:
    ```bash
    java -version
    ```
*   **Maven**: Cài đặt Maven để build dự án Java. Kiểm tra:
    ```bash
    mvn -version
    ```
*   **Docker & Docker Desktop**: Dùng để chạy Postgres và Redis dạng container. Kiểm tra:
    ```bash
    docker --version
    docker-compose --version
    ```

### 1.2. Khởi chạy Docker Compose (Postgres & Redis)
1.  Tạo file `docker-compose.yml` ở thư mục gốc dự án.
2.  Chạy lệnh để khởi động database và cache:
    ```bash
    docker-compose up -d
    ```
3.  Kiểm tra danh sách container đang chạy:
    ```bash
    docker ps
    ```

### 1.3. Kiểm tra kết nối cơ sở hạ tầng
*   **PostgreSQL**: Mở DBeaver, tạo kết nối mới kiểu *PostgreSQL*. Nhập host: `localhost`, port: `5432`, database: `smart_task_db`, user: `admin`, password: `supersecretpassword`. Nhấn **Test Connection**.
*   **Redis**: Sử dụng Redis Insight (hoặc chạy terminal `docker exec -it smart_redis redis-cli ping`). Nếu kết quả trả về `PONG` tức là Redis đã sẵn sàng.

---

## PHẦN 2: KHỞI TẠO BACKEND (Spring Boot) & LIÊN KẾT DATABASE (Mức độ: Trung bình)

### 2.1. Khởi tạo dự án qua Spring Initializr
1.  Truy cập trang [start.spring.io](https://start.spring.io/).
2.  Lựa chọn cấu hình:
    *   Project: **Maven Project**
    *   Language: **Java** (JDK 17 hoặc 21)
    *   Spring Boot: **3.x.x**
3.  Thêm các Dependency:
    *   `Spring Web` (xây dựng REST API)
    *   `Spring Data JPA` (tương tác database ORM)
    *   `Spring Security` (bảo mật hệ thống)
    *   `Lombok` (sinh tự động getter/setter)
    *   `PostgreSQL Driver` (kết nối cơ sở dữ liệu Postgres)
    *   `Spring Boot Starter Data Redis` (giao tiếp với Redis cache/queue)
4.  Nhấn **Generate** để tải file `.zip` dự án về, giải nén và import vào các IDE (IntelliJ IDEA, VS Code).

### 2.2. Cấu hình file `application.yml`
Tạo file `src/main/resources/application.yml`:

```yaml
server:
  port: 8080

spring:
  profiles:
    active: dev

  datasource:
    url: jdbc:postgresql://localhost:5432/smart_task_db
    username: admin
    password: supersecretpassword
    driver-class-name: org.postgresql.Driver

  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: update # Tự động ánh xạ entity thành bảng database
    show-sql: true
    properties:
      hibernate:
        format_sql: true

  data:
    redis:
      host: localhost
      port: 6379

app:
  jwt:
    secret: springboot_jwt_secret_dev_key_must_change_in_prod_long_key_32_bytes
    expiration-ms: 86400000 # 24 giờ
  ai:
    gemini:
      api-key: ${GEMINI_API_KEY:your_fallback_api_key}
```

### 2.3. Khởi tạo Database Schema
*   Khi chạy lần đầu, Spring Boot Data JPA sẽ tự động tạo cấu trúc bảng dựa trên cấu hình `@Entity` nhờ thuộc tính `ddl-auto: update`.
*   Để chạy khởi tạo ban đầu an toàn hơn, ta có thể đặt file `schema.sql` vào thư mục `src/main/resources/` và thiết lập `spring.sql.init.mode=always` (nhưng thông thường ở môi trường dev, ddl-auto của Hibernate đã là quá đủ).

---

## PHẦN 3: TRIỂN KHAI TỪNG TÍNH NĂNG THEO CHUẨN CLEAN ARCHITECTURE

### Bước 3.1: Đăng nhập, Đăng ký & Phân quyền Thành viên (JWT + Spring Security)

#### 1. Tạo JWT Provider
Tạo file `src/main/java/com/example/smartmanager/auth/JwtTokenProvider.java`:

```java
package com.example.smartmanager.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationInMs;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("Token JWT không hợp lệ: {}", ex.getMessage());
        }
        return false;
    }
}
```

#### 2. Tạo JWT Authentication Filter
Tạo file `src/main/java/com/example/smartmanager/auth/JwtAuthenticationFilter.java`:

```java
package com.example.smartmanager.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String email = tokenProvider.getEmailFromJWT(jwt);

                // Tạo đối tượng Authentication đơn giản (trong thực tế lấy đầy đủ UserDetails từ database)
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.emptyList());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Không thể thiết lập danh tính người dùng trong Security Context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

#### 3. Cấu hình Security Config (Spring Security 6.x)
Tạo file `src/main/java/com/example/smartmanager/config/SecurityConfig.java`:

```java
package com.example.smartmanager.config;

import com.example.smartmanager.auth.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Tắt CSRF vì sử dụng Stateless JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/ws/**").permitAll() // Cho phép truy cập không cần token
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

---

### Bước 3.2: Nghiệp vụ Quản lý Kanban & Kéo thả (Fractional Positioning)

#### 1. Entity định nghĩa Task
Tạo file `src/main/java/com/example/smartmanager/tasks/TaskEntity.java`:

```java
package com.example.smartmanager.tasks;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
public class TaskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String status; // TODO, IN_PROGRESS, DONE

    @Column(nullable = false)
    private Double position; // Dùng kiểu Double để thực thi Fractional Positioning

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(name = "parent_task_id")
    private String parentTaskId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

#### 2. Service cập nhật vị trí Task kéo thả
Tạo file `src/main/java/com/example/smartmanager/tasks/TaskService.java`:

```java
package com.example.smartmanager.tasks;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    @Transactional
    public TaskEntity updateTaskPosition(String taskId, String status, Double prevPosition, Double nextPosition) {
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy task tương ứng"));

        double newPosition;

        if (prevPosition == null && nextPosition == null) {
            // Danh sách trống
            newPosition = 65536.0;
        } else if (prevPosition == null) {
            // Kéo lên đầu danh sách
            newPosition = nextPosition - 1.0;
        } else if (nextPosition == null) {
            // Kéo xuống cuối danh sách
            newPosition = prevPosition + 1.0;
        } else {
            // Kéo vào giữa hai phần tử
            newPosition = (prevPosition + nextPosition) / 2.0;
        }

        task.setStatus(status);
        task.setPosition(newPosition);
        task.setUpdatedAt(java.time.LocalDateTime.now());

        return taskRepository.save(task);
    }
}
```

---

### Bước 3.3: Đồng Bộ Real-time Kanban Board qua WebSockets (STOMP)

Mã nguồn cấu hình và Service thông báo WebSockets đã được trình bày chi tiết tại **Phần 1 của Hướng dẫn Triển khai kỹ thuật** ([implementation_guide.md](file:///e:/Embe/KL/docs/implementation_guide.md)).
*   Dùng `WebSocketConfig` để kích hoạt Stomp Message Broker.
*   Dùng `ProjectNotificationService` sử dụng `SimpMessagingTemplate` để gửi broadcast tin nhắn tới topic `/topic/project.{projectId}` mỗi khi có thay đổi trạng thái hoặc vị trí công việc.

---

### Bước 3.4: Triển khai Trợ lý AI Rã Việc Bất Đồng Bộ (Redis Queue)

Mã nguồn cấu hình và Worker tiêu thụ hàng đợi xử lý ngầm gọi Gemini API/OpenAI API đã được xây dựng hoàn chỉnh tại **Phần 2 của Hướng dẫn Triển khai kỹ thuật** ([implementation_guide.md](file:///e:/Embe/KL/docs/implementation_guide.md)).
*   `RedisQueueConfig` cấu hình template lưu trữ data.
*   `TaskController` tiếp nhận request, đóng gói job và đẩy vào Redis List (`ai-subtasks-queue`).
*   `AiSubtaskWorker` chạy ngầm kéo job từ Redis List ra xử lý, gọi `GeminiAiAdapter` sinh subtasks bằng AI dưới dạng JSON, cập nhật database và phát tín hiệu hoàn thành qua websocket.

---

## PHẦN 4: KHỞI TẠO FRONTEND (Next.js) & KẾT NỐI API

### 4.1. Khởi tạo dự án Next.js
Chạy các câu lệnh sau ở thư mục client:
```bash
npx -y create-next-app@latest client --typescript --tailwind --eslint --src-dir --app
cd client
npx -y shadcn-ui@latest init
# Chọn Default, Slate, Yes cho CSS variables
npx -y shadcn-ui@latest add button card dialog
```

### 4.2. Cấu hình Axios gọi API
Tạo file `src/lib/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// Tự động gán token JWT vào header của mỗi request nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 4.3. Kết nối STOMP Client ở Frontend
Cài đặt các gói thư viện STOMP và SockJS:
```bash
npm install sockjs-client @stomp/stompjs
```

Tạo hook kết nối Websocket `src/hooks/useProjectWebsocket.ts`:

```typescript
import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useProjectWebsocket = (projectId: string, onMessageReceived: (event: any) => void) => {
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    // 1. Tạo kết nối SockJS kết hợp STOMP Client
    const socket = new SockJS('http://localhost:8000/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Đã kết nối WebSocket thành công');
        // 2. Đăng ký nhận tin nhắn từ Topic của Project
        client.subscribe(`/topic/project.${projectId}`, (message) => {
          if (message.body) {
            const payload = JSON.parse(message.body);
            onMessageReceived(payload);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Lỗi STOMP: ' + frame.headers['message']);
      }
    });

    client.activate();
    stompClientRef.current = client;

    // Ngắt kết nối khi rời khỏi trang
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [projectId]);
};
```

### 4.4. Dựng giao diện Kanban Board kéo thả
Sử dụng thư viện `@hello-pangea/dnd`. Dưới đây là cấu trúc cơ bản của component bảng Kanban trong Next.js:

```tsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import api from '@/lib/api';

interface Task {
  id: string;
  title: string;
  status: string;
  position: number;
}

export default function KanbanBoard({ initialTasks, projectId }: { initialTasks: Task[], projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    // Nếu không thay đổi cột lẫn vị trí thì bỏ qua
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const columnTasks = tasks.filter(t => t.status === destination.droppableId)
      .sort((a, b) => a.position - b.position);

    let prevPos: number | null = null;
    let nextPos: number | null = null;

    if (columnTasks.length > 0) {
      if (destination.index === 0) {
        nextPos = columnTasks[0].position;
      } else if (destination.index >= columnTasks.length) {
        prevPos = columnTasks[columnTasks.length - 1].position;
      } else {
        prevPos = columnTasks[destination.index - 1].position;
        nextPos = columnTasks[destination.index].position;
      }
    }

    // Gửi API cập nhật vị trí lên Spring Boot backend
    try {
      const response = await api.patch(`/api/tasks/${draggableId}/position`, {
        status: destination.droppableId,
        prevPosition: prevPos,
        nextPosition: nextPos
      });
      
      // Giao diện cục bộ sẽ được cập nhật tự động khi nhận event từ WebSocket
    } catch (error) {
      console.error('Kéo thả thất bại:', error);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 p-4 h-full">
        {['TODO', 'IN_PROGRESS', 'DONE'].map((columnId) => (
          <Droppable droppableId={columnId} key={columnId}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="w-1/3 bg-slate-100 p-4 rounded-lg">
                <h3 className="font-bold mb-4">{columnId}</h3>
                <div className="flex flex-col gap-2">
                  {tasks.filter(t => t.status === columnId)
                    .sort((a, b) => a.position - b.position)
                    .map((task, index) => (
                      <Draggable draggableId={task.id} index={index} key={task.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded shadow border border-slate-200"
                          >
                            {task.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
```

---

## PHẦN 5: KIỂM THỬ (TESTING) VÀ ĐÁNH GIÁ ĐẦU RA

### 5.1. Kịch bản API Test qua Postman/Bruno

#### 1. Đăng ký & Đăng nhập (Auth API)
*   **Method**: `POST`
*   **URL**: `http://localhost:8000/api/auth/login`
*   **Payload (JSON)**:
    ```json
    {
      "email": "admin@example.com",
      "password": "password123"
    }
    ```
*   **Response mẫu**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "type": "Bearer"
    }
    ```

#### 2. Yêu cầu AI rã việc (AI Subtasks API)
*   **Method**: `POST`
*   **URL**: `http://localhost:8000/api/tasks/e322d715-188b-402a-a92e-3356bc0a8637/ai-subtasks`
*   **Headers**: `Authorization: Bearer <your_jwt_token>`
*   **Response mẫu**:
    ```json
    {
      "status": "ACCEPTED",
      "message": "Yêu cầu rã việc đã được xếp vào hàng đợi xử lý ngầm."
    }
    ```

### 5.2. Giả lập kiểm thử WebSockets & Worker
1.  Mở tab console trên trình duyệt chạy Next.js hoặc sử dụng tool hỗ trợ WebSocket như *Apies* hay *Chrome WebSocket extension*.
2.  Bắt tay tới endpoint `ws://localhost:8000/ws/websocket`.
3.  Gửi frame subscribe: `SUBSCRIBE destination:/topic/project.123`.
4.  Gọi API yêu cầu AI rã việc (hoặc API kéo thả task) từ Postman.
5.  Xem log hệ thống backend:
    *   Kiểm tra log của `AiSubtaskWorker` xem có kéo job thành công không.
    *   Kiểm tra log gọi sang API Gemini/OpenAI.
    *   Kiểm tra xem console WebSocket của Client có nhận được thông điệp `task.subtasks.generated` chứa mảng JSON các subtasks mới tạo lập tức không.
