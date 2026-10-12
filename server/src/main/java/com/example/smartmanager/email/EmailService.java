package com.example.smartmanager.email;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:homixspace@gmail.com}")
    private String fromEmail;

    @Async
    public void sendPaymentSuccessEmail(String toEmail, String fullname, String planType, String amount, String transactionId) {
        log.info("📧 [Email Service] Sending Payment Invoice Email to: {} | Plan: {} | TxID: {}", toEmail, planType, transactionId);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "Homix v2.0 Platform");
            helper.setTo(toEmail);
            helper.setSubject("🎉 Hóa Đơn Xác Nhận Thanh Toán Gói VIP " + planType + " Thành Công");

            String htmlContent = String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #6366f1; margin: 0;">HOMIX PLATFORM ECOSYSTEM</h2>
                        <p style="color: #64748b; font-size: 13px;">Hóa Đơn Giao Dịch Điện Tử Thanh Toán VIP</p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                        <p style="margin: 5px 0;">Xin chào <strong>%s</strong>,</p>
                        <p style="margin: 5px 0;">Cảm ơn bạn đã nâng cấp thành công gói dịch vụ <strong>%s PLAN</strong> trên hệ thống Homix.</p>
                        <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;" />
                        <p style="margin: 5px 0;"><strong>Mã giao dịch (TxID):</strong> <span style="font-family: monospace; color: #d97706;">%s</span></p>
                        <p style="margin: 5px 0;"><strong>Gói kích hoạt:</strong> %s PLAN</p>
                        <p style="margin: 5px 0;"><strong>Tổng số tiền:</strong> <span style="font-weight: bold; color: #16a34a;">%s</span></p>
                    </div>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="http://localhost:3000/profile" style="background-color: #6366f1; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Xem Hồ Sơ VIP Ngay</a>
                    </div>
                    <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px;">Email tự động gửi từ Homix Platform. Vui lòng không trả lời trực tiếp email này.</p>
                </div>
                """, fullname, planType, transactionId, planType, amount);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ [Email Service] Payment confirmation email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.warn("⚠️ [Email Service] Could not send payment email: {}", e.getMessage());
        }
    }

    @Async
    public void sendVipExpirationReminderEmail(String toEmail, String fullname, String planType, int daysRemaining) {
        log.info("📧 [Email Service] Sending Expiration Reminder Email to: {} | Days left: {}", toEmail, daysRemaining);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "Homix v2.0 Platform");
            helper.setTo(toEmail);
            helper.setSubject("⚠️ Nhắc Nhở: Gói VIP " + planType + " Của Bạn Sắp Hết Hạn Sau " + daysRemaining + " Ngày");

            String htmlContent = String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #fed7aa; border-radius: 16px; background-color: #fff7ed;">
                    <h2 style="color: #c2410c; text-align: center;">Thông Báo Gia Hạn Gói VIP Homix</h2>
                    <p>Xin chào <strong>%s</strong>,</p>
                    <p>Gói dịch vụ <strong>%s PLAN</strong> của bạn sẽ hết hạn sau <strong>%d ngày nữa</strong>.</p>
                    <p>Để không làm gián đoạn các tính năng quản lý công việc AI và không gian làm việc nhóm, bạn vui lòng gia hạn gói dịch vụ sớm.</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="http://localhost:3000/pricing" style="background-color: #ea580c; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Gia Hạn Gói VIP Ngay</a>
                    </div>
                    <p style="font-size: 11px; color: #9a3412; text-align: center;">Homix v2.0 Platform Customer Support.</p>
                </div>
                """, fullname, planType, daysRemaining);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ [Email Service] Expiration reminder email sent to {}", toEmail);
        } catch (Exception e) {
            log.warn("⚠️ [Email Service] Could not send reminder email: {}", e.getMessage());
        }
    }
}
