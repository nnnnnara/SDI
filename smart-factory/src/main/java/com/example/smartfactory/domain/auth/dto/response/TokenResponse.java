package com.example.smartfactory.domain.auth.dto.response;

public record TokenResponse(
        Long userId,
        String accessToken
) {

    public static TokenResponse of(Long userId, String accessToken) {
        return new TokenResponse(userId, accessToken);
    }
}
