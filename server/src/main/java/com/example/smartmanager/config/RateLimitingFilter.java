package com.example.smartmanager.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;
    private static final int MAX_AI_REQUESTS_PER_MINUTE = 15;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();

        // Apply rate limit specifically for AI endpoints to prevent API key token overuse
        boolean isAiEndpoint = path.startsWith("/api/ai/")
                || path.endsWith("/ai-subtasks")
                || path.endsWith("/suggest-subtasks");
        if (isAiEndpoint) {
            try {
                String clientIp = getClientIp(request);
                String key = "ratelimit:ai:" + clientIp;

                Long currentCount = redisTemplate.opsForValue().increment(key);
                if (currentCount != null && currentCount == 1) {
                    redisTemplate.expire(key, 60, TimeUnit.SECONDS);
                }

                if (currentCount != null && currentCount > MAX_AI_REQUESTS_PER_MINUTE) {
                    log.warn("⚠️ [Rate Limiter] Limit exceeded for IP: {} on endpoint {}", clientIp, path);
                    response.setStatus(429); // HTTP 429 Too Many Requests
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"error\": \"Bạn đã vượt quá giới hạn 15 lượt gọi AI / phút. Vui lòng chờ 60 giây và thử lại.\"}");
                    return;
                }
            } catch (Exception e) {
                log.warn("⚠️ [Rate Limiter] Không thể kết nối Redis để kiểm tra giới hạn tần suất: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
