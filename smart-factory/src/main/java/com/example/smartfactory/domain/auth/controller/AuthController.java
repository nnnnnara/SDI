package com.example.smartfactory.domain.auth.controller;


import com.example.smartfactory.domain.auth.dto.request.LoginRequest;
import com.example.smartfactory.domain.auth.dto.request.SignupRequest;
import com.example.smartfactory.domain.auth.dto.response.SignupResponse;
import com.example.smartfactory.domain.auth.dto.response.TokenResponse;
import com.example.smartfactory.domain.auth.service.AuthService;
import com.example.smartfactory.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ApiResponse<SignupResponse> signup(@RequestBody @Valid SignupRequest req) {
        return ApiResponse.ok(authService.signup(req));
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@RequestBody @Valid LoginRequest req) {
        return ApiResponse.ok(authService.login(req));
    }
}
