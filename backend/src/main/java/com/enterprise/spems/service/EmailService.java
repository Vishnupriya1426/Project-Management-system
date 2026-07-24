package com.enterprise.spems.service;

public interface EmailService {
    void sendOtpEmail(String recipientEmail, String otpCode, String userName);

    void sendWelcomeEmail(String recipientEmail, String userName, String temporaryPassword, String roleName);
}
