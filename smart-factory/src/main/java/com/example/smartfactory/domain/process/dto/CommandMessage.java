package com.example.smartfactory.domain.process.dto;

import java.time.LocalDateTime;

public record CommandMessage(
        String commandType,
        LocalDateTime issuedAt
) {}
