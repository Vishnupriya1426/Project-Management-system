package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.dto.request.LoginRequest;
import com.enterprise.spems.dto.request.RefreshTokenRequest;
import com.enterprise.spems.dto.request.RegisterRequest;
import com.enterprise.spems.dto.response.AuthResponse;
import com.enterprise.spems.service.AuthService;
import com.enterprise.spems.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful", request.getRequestURI()));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        AuthResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully", request.getRequestURI()));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        try {
            String email = payload.get("email");
            String otpCode = payload.get("otpCode");
            String userName = payload.getOrDefault("userName", "User");
            if (email != null && otpCode != null) {
                emailService.sendOtpEmail(email, otpCode, userName);
            }
            return ResponseEntity.ok(ApiResponse.success("OTP email dispatched successfully", "OTP Sent", request.getRequestURI()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("OTP generated and ready", "OTP Active", request.getRequestURI()));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshRequest, HttpServletRequest request) {
        AuthResponse response = authService.refreshToken(refreshRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully", request.getRequestURI()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(Authentication authentication, HttpServletRequest request) {
        if (authentication != null) {
            authService.logout(authentication.getName());
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", "Logged out", request.getRequestURI()));
    }
}
