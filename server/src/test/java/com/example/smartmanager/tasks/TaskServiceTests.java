package com.example.smartmanager.tasks;

import com.example.smartmanager.ai.OpenRouterServiceClient;
import com.example.smartmanager.notifications.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTests {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskLogRepository taskLogRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private NotificationService notificationService;

    @Mock
    private OpenRouterServiceClient openRouterServiceClient;

    @InjectMocks
    private TaskService taskService;

    @Test
    @DisplayName("Kiểm thử thuật toán Fractional Positioning (cột rỗng, đầu cột, cuối cột, xen giữa và lặp chèn đầu)")
    void testMoveTaskCalculations() {
        UUID taskId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        TaskEntity mockTask = new TaskEntity();
        mockTask.setId(taskId);
        mockTask.setTitle("Test Title");
        mockTask.setDescription("Desc");
        mockTask.setStatus("TODO");
        mockTask.setPriority("MEDIUM");
        mockTask.setPosition(1.0);
        mockTask.setVersion(0L);
        mockTask.setProjectId(projectId);
        mockTask.setCreatedAt(LocalDateTime.now());
        mockTask.setUpdatedAt(LocalDateTime.now());

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(mockTask));
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Case 1: di chuyển vào cột rỗng (prev = null, next = null)
        TaskEntity resultEmpty = taskService.moveTask(taskId.toString(), "IN_PROGRESS", null, null, null);
        assertEquals("IN_PROGRESS", resultEmpty.getStatus());
        assertEquals(1.0, resultEmpty.getPosition());

        // Case 2: di chuyển lên đầu cột (prev = null, next = 2.0) -> P_new = P_first - 1.0 = 1.0
        TaskEntity resultTop = taskService.moveTask(taskId.toString(), "IN_PROGRESS", null, 2.0, null);
        assertEquals(1.0, resultTop.getPosition());

        // Case 2b: kéo lên đầu cột nhiều lần liên tiếp không bị suy biến về 0 như chia đôi
        TaskEntity resultTopAgain = taskService.moveTask(taskId.toString(), "IN_PROGRESS", null, 1.0, null);
        assertEquals(0.0, resultTopAgain.getPosition());
        TaskEntity resultTopNegative = taskService.moveTask(taskId.toString(), "IN_PROGRESS", null, 0.0, null);
        assertEquals(-1.0, resultTopNegative.getPosition());

        // Case 3: di chuyển xuống cuối cột (prev = 3.0, next = null) -> P_new = P_last + 1.0 = 4.0
        TaskEntity resultBottom = taskService.moveTask(taskId.toString(), "IN_PROGRESS", 3.0, null, null);
        assertEquals(4.0, resultBottom.getPosition());

        // Case 4: di chuyển xen giữa hai task (prev = 1.5, next = 2.5) -> P_new = (1.5 + 2.5) / 2.0 = 2.0
        TaskEntity resultMiddle = taskService.moveTask(taskId.toString(), "IN_PROGRESS", 1.5, 2.5, null);
        assertEquals(2.0, resultMiddle.getPosition());

        // Case 5: kiểm tra khóa lạc quan @Version và reset cờ nhắc hạn khi kéo từ DONE về IN_PROGRESS
        mockTask.setStatus("DONE");
        mockTask.setReminded(true);
        TaskEntity reopened = taskService.moveTask(taskId.toString(), "IN_PROGRESS", 2.0, 3.0, null);
        assertFalse(reopened.getReminded());
        assertEquals(2.5, reopened.getPosition());
        assertEquals(0L, reopened.getVersion());
    }
}
