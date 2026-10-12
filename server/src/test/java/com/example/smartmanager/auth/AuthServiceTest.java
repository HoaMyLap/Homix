package com.example.smartmanager.auth;

import com.example.smartmanager.users.UserEntity;
import com.example.smartmanager.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private UserEntity userEntity;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("testuser@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullname("Test User");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("testuser@example.com");
        loginRequest.setPassword("password123");

        userEntity = new UserEntity();
        userEntity.setId(UUID.randomUUID());
        userEntity.setEmail("testuser@example.com");
        userEntity.setPasswordHash("hashed_password");
        userEntity.setFullname("Test User");
        userEntity.setSystemRole("USER");
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(UserEntity.class))).thenReturn(userEntity);

        UserEntity createdUser = authService.register(registerRequest);

        assertNotNull(createdUser);
        assertEquals("testuser@example.com", createdUser.getEmail());
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    void register_ThrowsException_WhenEmailExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            authService.register(registerRequest);
        });
    }

    @Test
    void register_AutoGrantAdminRole_WhenEmailIsAdmin() {
        RegisterRequest adminReq = new RegisterRequest();
        adminReq.setEmail("hoamyngothi@gmail.com");
        adminReq.setPassword("password123");
        adminReq.setFullname("Hoamy Admin");

        when(userRepository.existsByEmail("hoamyngothi@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserEntity createdUser = authService.register(adminReq);

        assertNotNull(createdUser);
        assertEquals("ADMIN", createdUser.getSystemRole());
        assertEquals("ENTERPRISE", createdUser.getSubscriptionPlan());
    }

    @Test
    void login_Success() {
        when(userRepository.findByEmail("testuser@example.com")).thenReturn(Optional.of(userEntity));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
        when(tokenProvider.generateToken("testuser@example.com")).thenReturn("mocked_jwt_token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mocked_jwt_token", response.getToken());
        assertEquals("testuser@example.com", response.getEmail());
    }

    @Test
    void logout_BlacklistsToken() {
        String authHeader = "Bearer mocked_jwt_token";
        authService.logout(authHeader);

        verify(tokenBlacklistService, times(1)).blacklistToken(eq("mocked_jwt_token"), anyLong());
    }
}
