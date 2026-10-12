package com.example.smartmanager.payments;

import com.example.smartmanager.auth.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> request
    ) {
        if (userPrincipal == null || userPrincipal.getId() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để thực hiện thanh toán đơn hàng."));
        }
        String userId = userPrincipal.getId();

        String planType = request.getOrDefault("planType", "PRO");
        String billingCycle = request.getOrDefault("billingCycle", "annual");
        String paymentMethod = request.getOrDefault("paymentMethod", "VNPAY");
        String voucherCode = request.get("voucherCode");

        PaymentOrderEntity order = paymentService.createOrder(
                userId,
                planType,
                billingCycle,
                paymentMethod,
                voucherCode
        );

        return ResponseEntity.ok(order);
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> request
    ) {
        if (userPrincipal == null || userPrincipal.getId() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để xác nhận thanh toán."));
        }

        String orderId = request.get("orderId");
        if (orderId == null || orderId.trim().isEmpty()) {
            orderId = request.get("transactionId");
        }
        if (orderId == null || orderId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu mã đơn hàng thanh toán."));
        }

        // Nếu có kèm chữ ký VNPay trong request thì bắt buộc đối soát chữ ký HMAC-SHA512
        if (request.containsKey("vnp_SecureHash") && !paymentService.verifyVnPayHash(request)) {
            return ResponseEntity.status(400).body(Map.of("error", "Chữ ký giao dịch VNPay không hợp lệ."));
        }

        PaymentOrderEntity completed = paymentService.confirmAndCompleteOrder(orderId);
        if (!completed.getUserId().toString().equals(userPrincipal.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền xác nhận đơn hàng của người khác."));
        }
        return ResponseEntity.ok(completed);
    }

    @GetMapping("/order-status/{orderId}")
    public ResponseEntity<?> getOrderStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("orderId") String orderId
    ) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập."));
        }
        PaymentOrderEntity order = paymentService.getOrderById(orderId);
        if (!order.getUserId().toString().equals(userPrincipal.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Không có quyền truy cập đơn hàng này."));
        }
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("transactionId", order.getTransactionId());
        response.put("status", order.getStatus());
        response.put("planType", order.getPlanType());
        response.put("amount", order.getAmount());
        response.put("paymentMethod", order.getPaymentMethod());
        response.put("updatedAt", order.getUpdatedAt());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-orders")
    public ResponseEntity<?> getUserOrders(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập."));
        }
        return ResponseEntity.ok(paymentService.getUserOrders(userPrincipal.getId().toString()));
    }

    @PostMapping("/cancel-subscription")
    public ResponseEntity<?> cancelSubscription(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để thực hiện thao tác này."));
        }
        paymentService.cancelSubscription(userPrincipal.getId());
        return ResponseEntity.ok(Map.of("message", "Đã hủy gói dịch vụ thành công"));
    }

    // =========================================================================
    // GATEWAY CALLBACKS & WEBHOOK IPN ENDPOINTS
    // =========================================================================

    @GetMapping("/vnpay/callback")
    public ResponseEntity<Map<String, String>> vnpayCallback(
            @RequestParam Map<String, String> allParams
    ) {
        Map<String, String> res = new HashMap<>();
        if (!paymentService.verifyVnPayHash(allParams)) {
            res.put("status", "FAILED");
            res.put("message", "Chữ ký bảo mật VNPay không hợp lệ (Invalid HMAC-SHA512 Signature)");
            return ResponseEntity.badRequest().body(res);
        }

        String txnRef = allParams.get("vnp_TxnRef");
        String responseCode = allParams.get("vnp_ResponseCode");

        if ("00".equals(responseCode) && txnRef != null) {
            paymentService.confirmAndCompleteOrder(txnRef);
            res.put("status", "SUCCESS");
            res.put("message", "Giao dịch VNPay thành công");
        } else {
            res.put("status", "FAILED");
            res.put("message", "Giao dịch VNPay thất bại hoặc bị hủy");
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/momo/ipn")
    public ResponseEntity<Map<String, String>> momoIpn(
            @RequestBody Map<String, Object> body
    ) {
        String orderId = (String) body.get("orderId");
        Integer resultCode = (Integer) body.get("resultCode");
        String signature = (String) body.get("signature");

        Map<String, String> res = new HashMap<>();
        if (signature == null || signature.trim().isEmpty()) {
            res.put("status", "FAILED");
            res.put("message", "Thiếu chữ ký xác thực MoMo IPN");
            return ResponseEntity.badRequest().body(res);
        }

        if (resultCode != null && resultCode == 0 && orderId != null) {
            paymentService.confirmAndCompleteOrder(orderId);
            res.put("status", "SUCCESS");
        } else {
            res.put("status", "FAILED");
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/paypal/capture")
    public ResponseEntity<Map<String, String>> paypalCapture(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> body
    ) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("status", "FAILED", "message", "Vui lòng đăng nhập."));
        }
        String orderId = body.get("orderId");
        String txnId = body.get("transactionId");
        String ref = orderId != null ? orderId : txnId;

        PaymentOrderEntity completed = paymentService.confirmAndCompleteOrder(ref);

        Map<String, String> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("orderId", completed.getId().toString());
        res.put("message", "Giao dịch PayPal hoàn tất thành công");
        return ResponseEntity.ok(res);
    }
}
