package com.example.smartmanager.admin;

import com.example.smartmanager.payments.PaymentOrderEntity;
import com.example.smartmanager.payments.PaymentOrderRepository;
import com.example.smartmanager.projects.ProjectRepository;
import com.example.smartmanager.users.UserEntity;
import com.example.smartmanager.users.UserRepository;
import com.example.smartmanager.workspaces.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final PaymentOrderRepository paymentOrderRepository;

    public Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.count();
        List<UserEntity> allUsers = userRepository.findAll();

        long proUsers = allUsers.stream().filter(u -> "PRO".equalsIgnoreCase(u.getSubscriptionPlan())).count();
        long enterpriseUsers = allUsers.stream().filter(u -> "ENTERPRISE".equalsIgnoreCase(u.getSubscriptionPlan())).count();

        long totalWorkspaces = workspaceRepository.count();
        long totalProjects = projectRepository.count();

        List<PaymentOrderEntity> allOrders = paymentOrderRepository.findAllByOrderByCreatedAtDesc();
        long totalOrders = allOrders.size();

        Long totalRevenue = allOrders.stream()
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()))
                .mapToLong(PaymentOrderEntity::getAmount)
                .sum();

        List<PaymentOrderEntity> recentOrders = allOrders.stream().limit(10).toList();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("proUsers", proUsers);
        stats.put("enterpriseUsers", enterpriseUsers);
        stats.put("totalWorkspaces", totalWorkspaces);
        stats.put("totalProjects", totalProjects);
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("recentOrders", recentOrders);

        return stats;
    }

    public List<Map<String, Object>> getAllUsers() {
        List<UserEntity> users = userRepository.findAll();
        List<Map<String, Object>> list = new ArrayList<>();
        for (UserEntity u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId().toString());
            map.put("email", u.getEmail());
            map.put("fullname", u.getFullname());
            map.put("avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "");
            map.put("systemRole", u.getSystemRole() != null ? u.getSystemRole() : "USER");
            map.put("subscriptionPlan", u.getSubscriptionPlan() != null ? u.getSubscriptionPlan() : "FREE");
            map.put("subscriptionExpiresAt", u.getSubscriptionExpiresAt() != null ? u.getSubscriptionExpiresAt().toString() : "");
            map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
            list.add(map);
        }
        return list;
    }

    @Transactional
    public UserEntity updateUserPlan(String userId, String plan, Integer customDays) {
        UUID uId = UUID.fromString(userId);
        UserEntity user = userRepository.findById(uId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        user.setSubscriptionPlan(plan.toUpperCase());
        if ("FREE".equalsIgnoreCase(plan)) {
            user.setSubscriptionExpiresAt(null);
        } else {
            int days = customDays != null && customDays > 0 ? customDays : 365;
            user.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(days));
        }

        return userRepository.save(user);
    }

    @Transactional
    public UserEntity updateUserSystemRole(String userId, String systemRole) {
        UUID uId = UUID.fromString(userId);
        UserEntity user = userRepository.findById(uId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        user.setSystemRole(systemRole.toUpperCase());
        return userRepository.save(user);
    }

    public List<PaymentOrderEntity> getAllPayments() {
        return paymentOrderRepository.findAllByOrderByCreatedAtDesc();
    }
}
