package com.example.smartmanager.payments;

import com.example.smartmanager.email.EmailService;
import com.example.smartmanager.notifications.NotificationService;
import com.example.smartmanager.users.UserEntity;
import com.example.smartmanager.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentOrderRepository paymentOrderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PaymentService paymentService;

    private UserEntity user;
    private PaymentOrderEntity pendingOrder;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setEmail("user@example.com");
        user.setFullname("Test User");

        pendingOrder = new PaymentOrderEntity();
        pendingOrder.setId(UUID.randomUUID());
        pendingOrder.setUserId(user.getId());
        pendingOrder.setPlanType("PRO");
        pendingOrder.setBillingCycle("monthly");
        pendingOrder.setAmount(100000L);
        pendingOrder.setStatus("PENDING");
        pendingOrder.setTransactionId("HOMIX_TXN_123");
    }

    @Test
    void processPaymentCallback_Success() {
        when(paymentOrderRepository.findByTransactionId("HOMIX_TXN_123")).thenReturn(Optional.of(pendingOrder));
        when(paymentOrderRepository.save(any(PaymentOrderEntity.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        PaymentOrderEntity completed = paymentService.confirmAndCompleteOrder("HOMIX_TXN_123");

        assertNotNull(completed);
        assertEquals("COMPLETED", completed.getStatus());
        assertEquals("PRO", user.getSubscriptionPlan());
        verify(emailService, times(1)).sendPaymentSuccessEmail(eq("user@example.com"), eq("Test User"), eq("PRO"), anyString(), eq("HOMIX_TXN_123"));
    }

    @Test
    void cancelSubscription_Success() {
        user.setSubscriptionPlan("PRO");
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        paymentService.cancelSubscription(user.getId().toString());

        assertEquals("FREE", user.getSubscriptionPlan());
        assertNull(user.getSubscriptionExpiresAt());
        verify(userRepository, times(1)).save(user);
    }
}
