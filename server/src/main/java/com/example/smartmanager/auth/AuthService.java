package com.example.smartmanager.auth;

import com.example.smartmanager.users.UserEntity;
import com.example.smartmanager.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    public void logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            tokenBlacklistService.blacklistToken(token, 86400000L); // 24h
        }
    }

    private boolean isSystemAdminEmail(String email) {
        if (email == null) return false;
        String e = email.toLowerCase().trim();
        return "hoamyngothi@gmail.com".equals(e) || "hoamyngoithi@gmail.com".equals(e);
    }

    @Transactional
    public UserEntity register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại trong hệ thống");
        }

        boolean isAdminEmail = isSystemAdminEmail(request.getEmail());
        UserEntity user = new UserEntity();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullname(request.getFullname());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setSystemRole(isAdminEmail ? "ADMIN" : "USER");
        if (isAdminEmail) {
            user.setSubscriptionPlan("ENTERPRISE");
        }

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email hoặc mật khẩu không chính xác"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Email hoặc mật khẩu không chính xác");
        }

        String token = tokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getFullname(), user.getId().toString());
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void initSystemAdmin() {
        try {
            userRepository.findAll().forEach(user -> {
                if (isSystemAdminEmail(user.getEmail()) && !"ADMIN".equalsIgnoreCase(user.getSystemRole())) {
                    user.setSystemRole("ADMIN");
                    user.setSubscriptionPlan("ENTERPRISE");
                    userRepository.save(user);
                    System.out.println(">>> System ADMIN role set for: " + user.getEmail());
                }
            });
        } catch (Exception e) {
            System.err.println("Init system admin error: " + e.getMessage());
        }
    }

    public AuthResponse googleLogin(java.util.Map<String, String> body) {
        String credential = body.get("credential");
        if (credential == null || credential.trim().isEmpty()) {
            credential = body.get("idToken");
        }
        if (credential == null || credential.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã xác thực Google không được để trống.");
        }

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential;
            java.util.Map<String, Object> tokenInfo = restTemplate.getForObject(verifyUrl, java.util.Map.class);

            if (tokenInfo == null || !tokenInfo.containsKey("email")) {
                throw new IllegalArgumentException("Mã xác thực Google không hợp lệ hoặc đã hết hạn.");
            }

            String email = (String) tokenInfo.get("email");
            String fullname = (String) tokenInfo.getOrDefault("name", email.split("@")[0]);
            String avatarUrl = (String) tokenInfo.get("picture");

            boolean isDefaultAdmin = isSystemAdminEmail(email);

            UserEntity user = userRepository.findByEmail(email).orElseGet(() -> {
                UserEntity newUser = new UserEntity();
                newUser.setEmail(email);
                newUser.setFullname(fullname);
                newUser.setAvatarUrl(avatarUrl);
                newUser.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                newUser.setSystemRole(isDefaultAdmin ? "ADMIN" : "USER");
                newUser.setSubscriptionPlan(isDefaultAdmin ? "ENTERPRISE" : "FREE");
                return userRepository.save(newUser);
            });

            if (isDefaultAdmin && !"ADMIN".equalsIgnoreCase(user.getSystemRole())) {
                user.setSystemRole("ADMIN");
                user.setSubscriptionPlan("ENTERPRISE");
                user = userRepository.save(user);
            }

            if ((user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) && avatarUrl != null) {
                user.setAvatarUrl(avatarUrl);
                user = userRepository.save(user);
            }

            String token = tokenProvider.generateToken(user.getEmail());
            return new AuthResponse(token, user.getEmail(), user.getFullname(), user.getId().toString());
        } catch (Exception e) {
            throw new IllegalArgumentException("Đăng nhập bằng Google thất bại: " + e.getMessage());
        }
    }
}
