package com.example.smartmanager.payments;

import com.example.smartmanager.email.EmailService;
import com.example.smartmanager.notifications.NotificationService;
import com.example.smartmanager.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class PaymentSecurityTest {

    private static final String TEST_SECRET = "EPRTWZDPHRVEQOMRWWFZEKQRGYDRCUIO";

    @Mock
    private PaymentOrderRepository paymentOrderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentOrderRepository,
                userRepository,
                notificationService,
                emailService
        );
        ReflectionTestUtils.setField(paymentService, "vnpHashSecret", TEST_SECRET);
    }

    @Test
    @DisplayName("Xác thực chữ ký số VNPay HMAC-SHA512 hợp lệ phải trả về true")
    void testVerifyValidVnPayHash() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "19900000");
        params.put("vnp_Command", "pay");
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TmnCode", "NS4R2SPO");
        params.put("vnp_TxnRef", "HOMIX_1712345678_999");

        String validHash = computeExpectedHmac(params, TEST_SECRET);
        params.put("vnp_SecureHash", validHash);

        assertTrue(paymentService.verifyVnPayHash(params));
    }

    @Test
    @DisplayName("Từ chối callback VNPay khi chữ ký bị giả mạo hoặc số tiền bị thay đổi")
    void testRejectTamperedOrMissingVnPayHash() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "19900000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", "HOMIX_1712345678_999");

        String validHash = computeExpectedHmac(params, TEST_SECRET);
        params.put("vnp_SecureHash", validHash);

        // Giả mạo số tiền sau khi ký
        params.put("vnp_Amount", "1000");
        assertFalse(paymentService.verifyVnPayHash(params));

        // Chữ ký giả mạo hoàn toàn
        params.put("vnp_SecureHash", "deadbeef0123456789fakehash");
        assertFalse(paymentService.verifyVnPayHash(params));

        // Thiếu chữ ký
        params.remove("vnp_SecureHash");
        assertFalse(paymentService.verifyVnPayHash(params));
    }

    private String computeExpectedHmac(Map<String, String> params, String secret) {
        try {
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    hashData.append(fieldName).append('=')
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(hashData.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
