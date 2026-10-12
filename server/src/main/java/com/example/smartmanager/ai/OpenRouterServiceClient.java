package com.example.smartmanager.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenRouterServiceClient {

    public static final String EXCLUSIVE_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

    @Value("${app.ai.openrouter.api-key:${OPENROUTER_API_KEY:}}")
    private String openrouterApiKey;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

    /**
     * Gọi duy nhất model nvidia/nemotron-3-ultra-550b-a55b:free qua OpenRouter API.
     * Không sử dụng bất kỳ model dự phòng hay dữ liệu mẫu local nào khác.
     */
    public String generateContent(String prompt) {
        if (openrouterApiKey == null || openrouterApiKey.trim().isEmpty()) {
            throw new IllegalStateException("AI không thể sử dụng do chưa được cấu hình OPENROUTER_API_KEY.");
        }
        return callOpenRouter(openrouterApiKey.trim(), prompt);
    }

    private String callOpenRouter(String key, String prompt) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", EXCLUSIVE_MODEL);
            requestBody.put("messages", Collections.singletonList(message));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + key);
            headers.set("HTTP-Referer", "http://localhost:3000");
            headers.set("X-Title", "Homix Smart Task Manager");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(OPENROUTER_API_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode textNode = root.path("choices")
                        .path(0)
                        .path("message")
                        .path("content");
                if (!textNode.isMissingNode() && !textNode.asText().isBlank()) {
                    String content = textNode.asText().trim();
                    // Loại bỏ thẻ <think>...</think> nếu model reasoning trả kèm trong content
                    content = content.replaceAll("(?s)<think>.*?</think>", "").trim();
                    log.info("Gọi thành công OpenRouter API với model duy nhất {}!", EXCLUSIVE_MODEL);
                    return content;
                }
            }
            throw new RuntimeException("Model " + EXCLUSIVE_MODEL + " trả về phản hồi rỗng.");
        } catch (Exception e) {
            log.error("Gọi OpenRouter API với model {} thất bại: {}", EXCLUSIVE_MODEL, e.getMessage());
            throw new RuntimeException("Không thể kết nối tới AI (" + EXCLUSIVE_MODEL + "): " + e.getMessage(), e);
        }
    }

    /**
     * Parse danh sách các subtask từ phản hồi JSON của AI.
     */
    public List<String> parseSubtasks(String rawAiResponse) {
        if (rawAiResponse == null || rawAiResponse.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String cleaned = rawAiResponse.trim();
        if (cleaned.startsWith("```")) {
            int firstLineBreak = cleaned.indexOf("\n");
            int lastBackticks = cleaned.lastIndexOf("```");
            if (firstLineBreak != -1 && lastBackticks > firstLineBreak) {
                cleaned = cleaned.substring(firstLineBreak + 1, lastBackticks).trim();
            }
        }

        int arrayStart = cleaned.indexOf('[');
        int arrayEnd = cleaned.lastIndexOf(']');
        if (arrayStart != -1 && arrayEnd > arrayStart) {
            cleaned = cleaned.substring(arrayStart, arrayEnd + 1);
        }

        try {
            JsonNode node = objectMapper.readTree(cleaned);
            List<String> subtasks = new ArrayList<>();
            if (node.isArray()) {
                for (JsonNode item : node) {
                    if (item.isTextual()) {
                        subtasks.add(item.asText());
                    } else if (item.isObject() && item.has("title")) {
                        subtasks.add(item.get("title").asText());
                    }
                }
            }
            return subtasks;
        } catch (Exception e) {
            log.error("Không thể phân tích định dạng JSON subtask từ AI: {}", rawAiResponse, e);
            throw new RuntimeException("Phản hồi từ AI không đúng định dạng JSON mảng công việc con.", e);
        }
    }
}

