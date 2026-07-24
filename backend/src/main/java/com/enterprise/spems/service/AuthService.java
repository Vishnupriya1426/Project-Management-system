package com.enterprise.spems.service;

import com.enterprise.spems.dto.request.LoginRequest;
import com.enterprise.spems.dto.request.RefreshTokenRequest;
import com.enterprise.spems.dto.request.RegisterRequest;
import com.enterprise.spems.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String email);
}
