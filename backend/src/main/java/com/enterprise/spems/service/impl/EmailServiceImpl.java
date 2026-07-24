package com.enterprise.spems.service.impl;

import com.enterprise.spems.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:vishnupriyaravula3@gmail.com}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String recipientEmail, String otpCode, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("🔐 SPEMS Enterprise - Your 6-Digit Email Security OTP Code");

            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9;'>"
                    + "<div style='max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;'>"
                    + "<h2 style='color: #0078D4; margin-top: 0;'>SPEMS Enterprise Portal</h2>"
                    + "<p>Hello <strong>" + userName + "</strong>,</p>"
                    + "<p>Thank you for registering on SPEMS Enterprise. Use the following 6-digit security OTP code to verify your corporate email address and activate your account:</p>"
                    + "<div style='text-align: center; margin: 25px 0;'>"
                    + "<span style='display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0078D4; background: #f0f7ff; padding: 12px 24px; border-radius: 6px; border: 1px dashed #0078D4;'>"
                    + otpCode + "</span>"
                    + "</div>"
                    + "<p style='color: #666; font-size: 13px;'>This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>"
                    + "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'/>"
                    + "<p style='color: #999; font-size: 12px; text-align: center;'>SPEMS Enterprise System • Automated Email Notification</p>"
                    + "</div></div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Successfully dispatched OTP email to {}", recipientEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", recipientEmail, e.getMessage());
        }
    }

    @Override
    public void sendWelcomeEmail(String recipientEmail, String userName, String temporaryPassword, String roleName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("🎉 Welcome to SPEMS Enterprise - Account Credentials");

            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9;'>"
                    + "<div style='max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;'>"
                    + "<h2 style='color: #107C41; margin-top: 0;'>Welcome to SPEMS Enterprise</h2>"
                    + "<p>Hello <strong>" + userName + "</strong>,</p>"
                    + "<p>Your corporate employee account has been provisioned with role <strong>" + roleName
                    + "</strong>.</p>"
                    + "<div style='background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;'>"
                    + "<p style='margin: 5px 0;'><strong>Login Email:</strong> " + recipientEmail + "</p>"
                    + "<p style='margin: 5px 0;'><strong>Temporary Password:</strong> <code style='font-size: 16px; color: #d9534f;'>"
                    + temporaryPassword + "</code></p>"
                    + "</div>"
                    + "<p style='color: #666; font-size: 13px;'>Please log in at <a href='http://localhost:3001/login'>http://localhost:3001/login</a> and set your permanent password.</p>"
                    + "</div></div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Successfully dispatched Welcome email to {}", recipientEmail);

        } catch (Exception e) {
            log.error("Failed to send Welcome email to {}: {}", recipientEmail, e.getMessage());
        }
    }
}
