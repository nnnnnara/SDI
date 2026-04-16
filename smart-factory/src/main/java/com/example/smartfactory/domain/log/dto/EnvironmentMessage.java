package com.example.smartfactory.domain.log.dto;

import java.time.LocalDateTime;

public record EnvironmentMessage(
        Long runId,
        Double pm25,
        Double pm10,
        Double temperature,
        Double humidity,
        LocalDateTime measuredAt
) {}
