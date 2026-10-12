package com.example.smartmanager.admin;

import com.example.smartmanager.auth.UserPrincipal;
import com.example.smartmanager.users.UserEntity;
import com.example.smartmanager.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    private void checkSystemAdmin(UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }
        UserEntity user = userRepository.findById(UUID.fromString(userPrincipal.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy tài khoản"));
        if (!"ADMIN".equalsIgnoreCase(user.getSystemRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ Admin Hệ Thống mới có quyền truy cập trang quản trị này.");
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        checkSystemAdmin(userPrincipal);
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        checkSystemAdmin(userPrincipal);
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/plan")
    public ResponseEntity<?> updateUserPlan(
            @PathVariable("userId") String userId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        checkSystemAdmin(userPrincipal);
        String plan = (String) body.getOrDefault("plan", "FREE");
        Integer days = body.get("days") != null ? Integer.parseInt(body.get("days").toString()) : 365;

        UserEntity updated = adminService.updateUserPlan(userId, plan, days);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật gói VIP thành công",
                "userId", updated.getId().toString(),
                "plan", updated.getSubscriptionPlan()
        ));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable("userId") String userId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        checkSystemAdmin(userPrincipal);
        String role = body.getOrDefault("systemRole", "USER");

        UserEntity updated = adminService.updateUserSystemRole(userId, role);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật vai trò hệ thống thành công",
                "userId", updated.getId().toString(),
                "systemRole", updated.getSystemRole()
        ));
    }

    @GetMapping("/payments")
    public ResponseEntity<?> getAllPayments(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        checkSystemAdmin(userPrincipal);
        return ResponseEntity.ok(adminService.getAllPayments());
    }
}
