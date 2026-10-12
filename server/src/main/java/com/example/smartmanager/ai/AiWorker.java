package com.example.smartmanager.ai;

import com.example.smartmanager.tasks.TaskEntity;
import com.example.smartmanager.tasks.TaskService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class AiWorker {

    public static final String AI_SUBTASKS_QUEUE = "ai-subtasks-queue";
    private static final int MAX_RETRIES = 3;

    private final StringRedisTemplate redisTemplate;
    private final TaskService taskService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ExecutorService workerExecutor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "homix-ai-worker");
        t.setDaemon(true);
        return t;
    });

    private volatile boolean running = true;

    @PostConstruct
    public void startWorker() {
        workerExecutor.submit(this::pollLoop);
        log.info("🚀 [AiWorker] Khởi chạy luồng nền lắng nghe hàng đợi Redis '{}'", AI_SUBTASKS_QUEUE);
    }

    @PreDestroy
    public void stopWorker() {
        running = false;
        workerExecutor.shutdownNow();
    }

    private void pollLoop() {
        while (running && !Thread.currentThread().isInterrupted()) {
            try {
                String jobJson = redisTemplate.opsForList().rightPop(AI_SUBTASKS_QUEUE, 5, TimeUnit.SECONDS);
                if (jobJson == null || jobJson.isBlank()) {
                    continue;
                }

                AiJob job = objectMapper.readValue(jobJson, AiJob.class);
                processJobWithRetry(job);
            } catch (Exception e) {
                if (running) {
                    try {
                        Thread.sleep(2000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
    }

    public void processJobWithRetry(AiJob job) {
        int attempt = 0;
        while (attempt < MAX_RETRIES) {
            attempt++;
            try {
                log.info("🤖 [AiWorker] Đang xử lý phân rã công việc AI cho taskId={} (Lần thử {}/{})",
                        job.getTaskId(), attempt, MAX_RETRIES);
                List<TaskEntity> createdSubtasks = taskService.generateAiSubtasks(job.getTaskId(), job.getUserId());

                if (job.getProjectId() != null) {
                    messagingTemplate.convertAndSend(
                            "/topic/projects/" + job.getProjectId(),
                            Map.of(
                                    "action", "AI_SUBTASKS_COMPLETED",
                                    "taskId", job.getTaskId(),
                                    "projectId", job.getProjectId(),
                                    "payload", createdSubtasks,
                                    "actorId", job.getUserId() != null ? job.getUserId() : ""
                            )
                    );
                }
                log.info("✅ [AiWorker] Hoàn tất tạo {} subtasks cho taskId={}", createdSubtasks.size(), job.getTaskId());
                return;
            } catch (Exception e) {
                log.warn("⚠️ [AiWorker] Lỗi khi xử lý job AI cho taskId={} (Lần {}/{}): {}",
                        job.getTaskId(), attempt, MAX_RETRIES, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(1500L * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            }
        }
        log.error("❌ [AiWorker] Thất bại sau {} lần thử cho taskId={}", MAX_RETRIES, job.getTaskId());
    }
}
