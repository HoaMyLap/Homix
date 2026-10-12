# HƯỚNG DẪN TRIỂN KHAI KỸ THUẬT (IMPLEMENTATION GUIDE)

Tài liệu này hướng dẫn chi tiết cách cài đặt cấu hình và cung cấp mã nguồn cốt lõi (Core Code Snippets) viết bằng **Java (Spring Boot 3.x)** cho hệ thống Backend. Mã nguồn tuân thủ nguyên lý **Clean Architecture**, tách biệt rõ ràng giữa Business Logic và Third-party Service (AI API).

---

## 1. Cấu Hình Spring WebSockets & STOMP Message Broker

Phân hệ WebSockets sử dụng `spring-boot-starter-websocket` để thiết lập kết nối và trao đổi tin nhắn bằng giao thức STOMP. Mỗi khi có sự thay đổi trạng thái hoặc vị trí công việc, Server sẽ phát tín hiệu broadcast tới các client đang subscribe.

### 1.1. Cấu hình WebSocket Config
Tạo file `src/main/java/com/example/smartmanager/config/WebSocketConfig.java`:

```java
package com.example.smartmanager.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Kích hoạt Simple Broker để gửi tin nhắn tới client qua prefix /topic
        config.enableSimpleBroker("/topic");
        
        // Prefix dành cho các tin nhắn từ client gửi lên các @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint đăng ký bắt tay WebSocket, hỗ trợ SockJS dự phòng
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

### 1.2. WebSocket Controller & Helper Service
Tạo file `src/main/java/com/example/smartmanager/realtime/ProjectNotificationService.java` để hỗ trợ gửi broadcast tin nhắn từ bất kỳ Service nào:

```java
package com.example.smartmanager.realtime;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast sự kiện cập nhật công việc tới tất cả thành viên trong Room dự án.
     * Endpoint client lắng nghe: /topic/project.{projectId}
     */
    public void broadcastTaskUpdate(String projectId, String eventType, Object payload) {
        String destination = "/topic/project." + projectId;
        WsResponse response = new WsResponse(eventType, payload);
        messagingTemplate.convertAndSend(destination, response);
        log.info("Đã broadcast sự kiện {} tới topic {}", eventType, destination);
    }

    @lombok.Value
    public static class WsResponse {
        String eventType;
        Object data;
    }
}
```

---

## 2. Setup Redis Queue & Worker Tiêu Thụ Bất Đồng Bộ (AI Subtasks Integration)

Áp dụng Clean Architecture, lớp Business Logic (Worker) sẽ không phụ thuộc trực tiếp vào SDK của nhà cung cấp AI mà thông qua một **Interface (Port)**. Dưới đây là cách cấu hình và triển khai.

### 2.1. Định nghĩa Interface AI (Core Application Layer)
Tạo file `src/main/java/com/example/smartmanager/ai/ports/AiIntegrationService.java`:

```java
package com.example.smartmanager.ai.ports;

import java.util.List;

public interface AiIntegrationService {
    
    @lombok.Data
    class SubtaskSuggestion {
        private String title;
    }

    /**
     * Phân tích một công việc lớn và đề xuất các công việc con nhỏ hơn.
     */
    List<SubtaskSuggestion> generateSubtasks(String title, String description);
}
```

### 2.2. Triển khai AI Service sử dụng WebClient calling Gemini API (Infrastructure Layer)
Tạo file `src/main/java/com/example/smartmanager/ai/adapters/GeminiAiAdapter.java`:

```java
package com.example.smartmanager.ai.adapters;

import com.example.smartmanager.ai.ports.AiIntegrationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAiAdapter implements AiIntegrationService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.gemini.api-key}")
    private String apiKey;

    @Override
    public List<SubtaskSuggestion> generateSubtasks(String title, String description) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
        
        String prompt = String.format(
            "Bạn là một Trợ lý quản lý dự án Agile chuyên nghiệp. " +
            "Hãy đọc thông tin về công việc lớn dưới đây:\n" +
            "Tiêu đề: %s\nMô tả chi tiết: %s\n\n" +
            "Nhiệm vụ: Hãy phân tích và đề xuất ra danh sách các đầu việc con (Sub-tasks) cần làm. " +
            "Yêu cầu trả về kết quả định dạng JSON chuẩn theo mẫu sau, không ghi thêm lời giải thích hay bất kỳ ký tự nào khác ngoài JSON:\n" +
            "[{\"title\": \"Tên đầu việc con thứ nhất\"}, {\"title\": \"Tên đầu việc con thứ hai\"}]",
            title, (description != null ? description : "Không có mô tả")
        );

        // Tạo Request Payload cho Gemini API
        Map<String, Object> requestPayload = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            )
        );

        try {
            WebClient webClient = webClientBuilder.build();
            String responseBody = webClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestPayload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(); // Đợi phản hồi đồng bộ từ AI

            // Trích xuất văn bản trả về từ JSON của Gemini
            Map<String, Object> responseMap = objectMapper.readValue(responseBody, new TypeReference<>() {});
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String responseText = (String) parts.get(0).get("text");

            // Làm sạch chuỗi markdown code block nếu AI chèn thêm vào
            String cleanJson = responseText.replaceAll("```json", "").replaceAll("```", "").trim();
            
            return objectMapper.readValue(cleanJson, new TypeReference<List<SubtaskSuggestion>>() {});
        } catch (Exception e) {
            log.error("Lỗi khi gọi hoặc parse kết quả từ Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi tích hợp dịch vụ AI: " + e.getMessage());
        }
    }
}
```

### 2.3. Cấu hình Redis Queue (Redis List)
Tạo file `src/main/java/com/example/smartmanager/config/RedisQueueConfig.java`:

```java
package com.example.smartmanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisQueueConfig {

    public static final String QUEUE_NAME = "ai-subtasks-queue";

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Serializer Key dạng String
        template.setKeySerializer(new StringRedisSerializer());
        
        // Serializer Value dạng JSON thông qua Jackson để dễ dàng truyền nhận Object giữa các Node
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        return template;
    }
}
```

### 2.4. REST Controller gửi Job vào Hàng đợi
Tạo file `src/main/java/com/example/smartmanager/tasks/TaskController.java`:

```java
package com.example.smartmanager.tasks;

import com.example.smartmanager.config.RedisQueueConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final RedisTemplate<String, Object> redisTemplate;
    private final TaskRepository taskRepository; // Spring Data JPA Repository

    @PostMapping("/{id}/ai-subtasks")
    public ResponseEntity<?> triggerAiSubtasks(@PathVariable("id") String taskId) {
        // 1. Kiểm tra sự tồn tại của Task trong database
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy công việc"));

        // 2. Tạo DTO Job
        AiSubtaskJob job = new AiSubtaskJob(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getProjectId()
        );

        // 3. Đẩy Job vào đầu danh sách (Left Push - LPUSH) trong Redis List làm Queue
        redisTemplate.opsForList().leftPush(RedisQueueConfig.QUEUE_NAME, job);

        return ResponseEntity.accepted().body(Map.of(
                "status", "ACCEPTED",
                "message", "Yêu cầu rã việc đã được xếp vào hàng đợi xử lý ngầm."
        ));
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class AiSubtaskJob implements Serializable {
        private String taskId;
        private String title;
        private String description;
        private String projectId;
    }
}
```

### 2.5. Worker chạy ngầm tiêu thụ và thực thi Job (Redis Queue Listener)
Tạo file `src/main/java/com/example/smartmanager/tasks/processors/AiSubtaskWorker.java`:

```java
package com.example.smartmanager.tasks.processors;

import com.example.smartmanager.ai.ports.AiIntegrationService;
import com.example.smartmanager.config.RedisQueueConfig;
import com.example.smartmanager.realtime.ProjectNotificationService;
import com.example.smartmanager.tasks.TaskController.AiSubtaskJob;
import com.example.smartmanager.tasks.TaskEntity;
import com.example.smartmanager.tasks.TaskRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class AiSubtaskWorker {

    private final RedisTemplate<String, Object> redisTemplate;
    private final AiIntegrationService aiService;
    private final TaskRepository taskRepository;
    private final ProjectNotificationService notificationService;
    
    private ExecutorService executorService;
    private volatile boolean running = true;

    @PostConstruct
    public void startWorker() {
        // Tạo một Thread chạy độc lập chuyên lắng nghe từ Redis Queue
        executorService = Executors.newSingleThreadExecutor();
        executorService.submit(this::listenToQueue);
        log.info("Redis Queue Worker đã được khởi chạy.");
    }

    private void listenToQueue() {
        while (running) {
            try {
                // Đọc từ đuôi danh sách (Right Pop - BRPOP tương đương)
                // block 5 giây nếu không có dữ liệu để tránh làm nghẽn CPU
                Object rawJob = redisTemplate.opsForList().rightPop(RedisQueueConfig.QUEUE_NAME, 5, TimeUnit.SECONDS);
                
                if (rawJob instanceof AiSubtaskJob job) {
                    processJob(job);
                }
            } catch (Exception e) {
                log.error("Lỗi xảy ra trong vòng lặp Queue Listener: {}", e.getMessage());
                try { Thread.sleep(2000); } catch (InterruptedException ex) { Thread.currentThread().interrupt(); }
            }
        }
    }

    private void processJob(AiSubtaskJob job) {
        log.info("Đang xử lý sinh Subtasks tự động cho Task ID: {}", job.getTaskId());
        try {
            // 1. Gọi Dịch vụ AI thông qua Interface
            List<AiIntegrationService.SubtaskSuggestion> suggestions = 
                    aiService.generateSubtasks(job.getTitle(), job.getDescription());

            // 2. Lưu vào DB thông qua Repository
            for (int i = 0; i < suggestions.size(); i++) {
                TaskEntity subtask = new TaskEntity();
                subtask.setTitle(suggestions.get(i).getTitle());
                subtask.setParentTaskId(job.getTaskId());
                subtask.setProjectId(job.getProjectId());
                subtask.setStatus("TODO");
                subtask.setPosition((i + 1) * 1000.0);
                taskRepository.save(subtask);
            }

            // 3. Truy vấn lại danh sách subtasks vừa lưu để gửi đầy đủ thông tin về frontend
            List<TaskEntity> savedSubtasks = taskRepository.findByParentTaskId(job.getTaskId());

            // 4. Broadcast sự kiện cập nhật real-time tới Websocket Topic của Project
            notificationService.broadcastTaskUpdate(
                    job.getProjectId(), 
                    "task.subtasks.generated", 
                    Map.of("parentTaskId", job.getTaskId(), "subtasks", savedSubtasks)
            );
            
            log.info("Hoàn thành sinh subtasks cho Task ID: {}", job.getTaskId());
        } catch (Exception e) {
            log.error("Lỗi khi xử lý job của Task {}: {}", job.getTaskId(), e.getMessage(), e);
            // Có thể bổ sung cơ chế push lại vào queue hoặc lưu log lỗi vào DB tại đây
        }
    }

    @PreDestroy
    public void stopWorker() {
        running = false;
        if (executorService != null) {
            executorService.shutdown();
            try {
                if (!executorService.awaitTermination(5, TimeUnit.SECONDS)) {
                    executorService.shutdownNow();
                }
            } catch (InterruptedException e) {
                executorService.shutdownNow();
            }
        }
        log.info("Redis Queue Worker đã được dừng lại.");
    }
}
```
