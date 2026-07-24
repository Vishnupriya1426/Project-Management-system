package com.enterprise.spems.service.impl;

import com.enterprise.spems.dto.request.LoginRequest;
import com.enterprise.spems.dto.request.RefreshTokenRequest;
import com.enterprise.spems.dto.request.RegisterRequest;
import com.enterprise.spems.dto.response.AuthResponse;
import com.enterprise.spems.exception.BadRequestException;
import com.enterprise.spems.exception.ResourceNotFoundException;
import com.enterprise.spems.model.entity.Department;
import com.enterprise.spems.model.entity.Employee;
import com.enterprise.spems.model.entity.RefreshToken;
import com.enterprise.spems.model.entity.Role;
import com.enterprise.spems.model.entity.User;
import com.enterprise.spems.repository.DepartmentRepository;
import com.enterprise.spems.repository.EmployeeRepository;
import com.enterprise.spems.repository.RefreshTokenRepository;
import com.enterprise.spems.repository.RoleRepository;
import com.enterprise.spems.repository.UserRepository;
import com.enterprise.spems.security.JwtTokenProvider;
import com.enterprise.spems.security.UserPrincipal;
import com.enterprise.spems.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Value("${spems.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String refreshTokenStr = createRefreshToken(user);

        Optional<Employee> employeeOpt = employeeRepository.findByUser(user);

        return AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .firstName(employeeOpt.map(Employee::getFirstName).orElse(""))
                .lastName(employeeOpt.map(Employee::getLastName).orElse(""))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already registered");
        }

        Role role = roleRepository.findByName(request.getRoleType())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRoleType()));

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isActive(true)
                .isVerified(true)
                .build();

        user = userRepository.save(user);

        String empCode = request.getEmployeeCode();
        if (empCode == null || empCode.isBlank()) {
            empCode = "EMP-" + String.format("%05d", (int) (Math.random() * 90000) + 10000);
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        Employee employee = Employee.builder()
                .user(user)
                .employeeCode(empCode)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .designation(request.getDesignation())
                .department(department)
                .build();

        employeeRepository.save(employee);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(request.getEmail());
        loginRequest.setPassword(request.getPassword());
        return login(loginRequest);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenRepository.findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    UserPrincipal userPrincipal = UserPrincipal.create(user);
                    Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
                    String token = tokenProvider.generateToken(authentication);
                    Optional<Employee> employeeOpt = employeeRepository.findByUser(user);

                    return AuthResponse.builder()
                            .accessToken(token)
                            .refreshToken(requestRefreshToken)
                            .tokenType("Bearer")
                            .userId(user.getId())
                            .email(user.getEmail())
                            .role(user.getRole().getName().name())
                            .firstName(employeeOpt.map(Employee::getFirstName).orElse(""))
                            .lastName(employeeOpt.map(Employee::getLastName).orElse(""))
                            .build();
                })
                .orElseThrow(() -> new BadRequestException("Refresh token is not in database or expired!"));
    }

    @Override
    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(refreshTokenRepository::deleteByUser);
    }

    private String createRefreshToken(User user) {
        Optional<RefreshToken> existing = refreshTokenRepository.findByUser(user);
        RefreshToken refreshToken;
        if (existing.isPresent()) {
            refreshToken = existing.get();
            refreshToken.setToken(UUID.randomUUID().toString());
            refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));
        } else {
            refreshToken = RefreshToken.builder()
                    .user(user)
                    .token(UUID.randomUUID().toString())
                    .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                    .build();
        }

        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }
}
