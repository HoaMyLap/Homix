package com.example.smartmanager.ai;

import com.example.smartmanager.tasks.TaskEntity;
import com.example.smartmanager.tasks.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiWorkerTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private TaskService taskService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private AiWorker aiWorker;

    @Test
    @DisplayName("AiWorker xử lý thành công AiJob từ hàng đợi và phát sự kiện WebSocket AI_SUBTASKS_COMPLETED")
    void testProcessJobSuccessAndWebSocketBroadcast() {
        String taskId = UUID.randomUUID().toString();
        String projectId = UUID.randomUUID().toString();
        String userId = UUID.randomUUID().toString();

        AiJob job = new AiJob(taskId, "Thiết kế hệ thống", "Chi tiết kiến trúc", projectId, userId);

        TaskEntity subtask1 = new TaskEntity();
        subtask1.setId(UUID.randomUUID());
        subtask1.setTitle("1. Thiết kế Database Schema");

        TaskEntity subtask2 = new TaskEntity();
        subtask2.setId(UUID.randomUUID());
        subtask2.setTitle("2. Xây dựng REST API");

        when(taskService.generateAiSubtasks(taskId, userId)).thenReturn(List.of(subtask1, subtask2));

        aiWorker.processJobWithRetry(job);

        verify(taskService, times(1)).generateAiSubtasks(taskId, userId);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/projects/" + projectId), payloadCaptor.capture());

        Map<String, Object> wsMessage = payloadCaptor.getValue();
        assertEquals("AI_SUBTASKS_COMPLETED", wsMessage.get("action"));
        assertEquals(taskId, wsMessage.get("taskId"));
        assertEquals(projectId, wsMessage.get("projectId"));
    }

    @Test
    @DisplayName("AiWorker tự động thử lại (Retry) khi lượt gọi AI đầu tiên gặp lỗi tạm thời")
    void testProcessJobRetryOnTransientFailure() {
        String taskId = UUID.randomUUID().toString();
        String projectId = UUID.randomUUID().toString();
        String userId = UUID.randomUUID().toString();

        AiJob job = new AiJob(taskId, "Tối ưu hiệu năng", "Cấu hình Redis", projectId, userId);

        TaskEntity subtask = new TaskEntity();
        subtask.setId(UUID.randomUUID());
        subtask.setTitle("Cấu hình Redis Queue");

        when(taskService.generateAiSubtasks(taskId, userId))
                .thenThrow(new RuntimeException("Gemini API 429 Quota Exceeded - switching to OpenRouter fallback"))
                .thenReturn(List.of(subtask));

        aiWorker.processJobWithRetry(job);

        verify(taskService, times(2)).generateAiSubtasks(taskId, userId);
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/projects/" + projectId), any(Map.class));
    }
}
