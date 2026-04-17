package com.example.smartfactory.domain.log.dto.response;

import com.example.smartfactory.domain.log.entity.EnvironmentLog;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EnvironmentLogResponse(
        Long envLogId,
        BigDecimal pm25,
        BigDecimal pm10,
        BigDecimal temperature,
        BigDecimal humidity,
        LocalDateTime measuredAt
) {

    public static EnvironmentLogResponse from(EnvironmentLog environmentLog) {
        return new EnvironmentLogResponse(
                environmentLog.getId(),
                environmentLog.getPm25(),
                environmentLog.getPm10(),
                environmentLog.getTemperature(),
                environmentLog.getHumidity(),
                environmentLog.getMeasuredAt()
        );
    }
}
