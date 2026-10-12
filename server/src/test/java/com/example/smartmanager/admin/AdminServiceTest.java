package com.example.smartmanager.admin;

import com.example.smartmanager.payments.PaymentOrderEntity;
import com.example.smartmanager.payments.PaymentOrderRepository;
import com.example.smartmanager.projects.ProjectRepository;
import com.example.smartmanager.users.UserEntity;
import com.example.smartmanager.users.UserRepository;
import com.example.smartmanager.workspaces.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentOrderRepository paymentOrderRepository;

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private AdminService adminService;

    private UserEntity user;
    private PaymentOrderEntity paymentOrder;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setEmail("user@example.com");
        user.setFullname("Standard User");
        user.setSubscriptionPlan("FREE");
        user.setSystemRole("USER");

        paymentOrder = new PaymentOrderEntity();
        paymentOrder.setId(UUID.randomUUID());
        paymentOrder.setUserId(user.getId());
        paymentOrder.setPlanType("PRO");
        paymentOrder.setBillingCycle("monthly");
        paymentOrder.setAmount(100000L);
        paymentOrder.setStatus("COMPLETED");
        paymentOrder.setTransactionId("TXN123456");
    }

    @Test
    void getDashboardStats_CalculatesMetricsCorrectly() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(workspaceRepository.count()).thenReturn(5L);
        when(projectRepository.count()).thenReturn(12L);
        when(paymentOrderRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(paymentOrder));

        var stats = adminService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(10L, stats.get("totalUsers"));
        assertEquals(5L, stats.get("totalWorkspaces"));
        assertEquals(12L, stats.get("totalProjects"));
        assertEquals(100000L, stats.get("totalRevenue"));
        assertEquals(1L, stats.get("totalOrders"));
    }

    @Test
    void updateUserPlan_Success() {
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserEntity updated = adminService.updateUserPlan(user.getId().toString(), "PRO", 30);

        assertNotNull(updated);
        assertEquals("PRO", updated.getSubscriptionPlan());
        assertNotNull(updated.getSubscriptionExpiresAt());
        verify(userRepository, times(1)).save(user);
    }
}
