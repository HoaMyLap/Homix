package com.example.smartmanager.config;

import com.example.smartmanager.auth.CustomUserDetailsService;
import com.example.smartmanager.auth.JwtTokenProvider;
import com.example.smartmanager.auth.SecurityService;
import com.example.smartmanager.auth.TokenBlacklistService;
import com.example.smartmanager.auth.UserPrincipal;
import com.example.smartmanager.projects.ProjectEntity;
import com.example.smartmanager.projects.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final CustomUserDetailsService userDetailsService;
    private final SecurityService securityService;
    private final ProjectRepository projectRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (!tokenBlacklistService.isBlacklisted(token) && jwtTokenProvider.validateToken(token)) {
                    String email = jwtTokenProvider.getEmailFromJWT(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    accessor.setUser(authentication);
                    return message;
                }
            }
            log.warn("Từ chối kết nối WebSocket STOMP: Thiếu hoặc sai JWT token");
            throw new AccessDeniedException("Từ chối kết nối WebSocket: Token xác thực không hợp lệ.");
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            Principal user = accessor.getUser();
            String destination = accessor.getDestination();
            if (user instanceof UsernamePasswordAuthenticationToken auth
                    && auth.getPrincipal() instanceof UserPrincipal principal
                    && destination != null) {
                validateSubscriptionAccess(principal.getId(), destination);
            }
        }

        return message;
    }

    private void validateSubscriptionAccess(String userIdStr, String destination) {
        UUID userId = UUID.fromString(userIdStr);

        if (destination.startsWith("/topic/notifications/")) {
            String targetUserId = destination.substring("/topic/notifications/".length());
            if (!userIdStr.equals(targetUserId)) {
                throw new AccessDeniedException("Không được phép lắng nghe kênh thông báo của người dùng khác.");
            }
        } else if (destination.startsWith("/topic/workspaces/")) {
            String wsIdStr = destination.substring("/topic/workspaces/".length());
            UUID wsId = UUID.fromString(wsIdStr);
            if (!securityService.hasPermission(wsId, userId, "WORKSPACE_VIEW")) {
                throw new AccessDeniedException("Không có quyền truy cập kênh Workspace này.");
            }
        } else if (destination.startsWith("/topic/projects/")) {
            String projIdStr = destination.substring("/topic/projects/".length());
            Optional<ProjectEntity> projOpt = projectRepository.findById(UUID.fromString(projIdStr));
            if (projOpt.isEmpty() || !securityService.hasPermission(projOpt.get().getWorkspaceId(), userId, "PROJECT_VIEW")) {
                throw new AccessDeniedException("Không có quyền truy cập kênh Dự án này.");
            }
        }
    }
}
