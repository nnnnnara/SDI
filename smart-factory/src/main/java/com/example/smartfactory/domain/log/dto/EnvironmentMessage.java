package com.example.smartfactory.domain.log.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EnvironmentMessage(
        Long runId,
        BigDecimal pm25,
        BigDecimal pm10,
        BigDecimal temperature,
        BigDecimal humidity,
        LocalDateTime measuredAt
) {}
