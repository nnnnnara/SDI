package com.example.smartfactory.domain.auth.dto.response;

import com.example.smartfactory.domain.auth.entity.User;

public record UserSummaryResponse(
        Long userId,
        String name
) {

    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getName()
        );
    }
}
