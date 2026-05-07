package com.example.smartfactory.domain.process.dto.message;

import com.example.smartfactory.domain.process.entity.enums.CommandType;

import java.time.LocalDateTime;

public record CommandMessage(
        Long runId,
        CommandType commandType,
        LocalDateTime issuedAt
) {}
