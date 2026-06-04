package com.example.smartfactory.domain.auth.dto.response;

public record TokenResponse(
        Long userId,
        String accessToken,
        String name
) {

    public static TokenResponse of(Long userId, String accessToken, String name) {
        return new TokenResponse(userId, accessToken, name);
    }
}
