package com.example.smartmanager.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private static final String BLACKLIST_PREFIX = "token:blacklist:";

    /**
     * Add token to Redis Blacklist with expiration time (e.g. 24 hours)
     */
    public void blacklistToken(String token, long expirationMs) {
        if (token == null || token.isEmpty()) return;
        try {
            String key = BLACKLIST_PREFIX + token;
            long timeout = expirationMs > 0 ? expirationMs : 86400000L; // Default 24h
            redisTemplate.opsForValue().set(key, "blacklisted", timeout, TimeUnit.MILLISECONDS);
            log.info("🚫 [Redis Blacklist] Token blacklisted successfully for {} ms", timeout);
        } catch (Exception e) {
            log.warn("⚠️ [Redis Blacklist] Không thể ghi token vào Redis Blacklist: {}", e.getMessage());
        }
    }

    /**
     * Check if token is blacklisted
     */
    public boolean isBlacklisted(String token) {
        if (token == null || token.isEmpty()) return false;
        try {
            String key = BLACKLIST_PREFIX + token;
            Boolean hasKey = redisTemplate.hasKey(key);
            return Boolean.TRUE.equals(hasKey);
        } catch (Exception e) {
            log.warn("⚠️ [Redis Blacklist] Không thể kiểm tra trạng thái token trên Redis, tạm thời cho phép: {}", e.getMessage());
            return false;
        }
    }
}
