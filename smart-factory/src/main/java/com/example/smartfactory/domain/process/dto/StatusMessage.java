package com.example.smartfactory.domain.process.dto;

import java.time.LocalDateTime;

public record StatusMessage(
        Long runId,
        String status,
        LocalDateTime updatedAt
) {}
