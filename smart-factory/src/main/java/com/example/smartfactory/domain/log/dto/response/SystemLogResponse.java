package com.example.smartfactory.domain.log.dto.response;

import com.example.smartfactory.domain.log.entity.SystemLog;
import com.example.smartfactory.domain.log.entity.LogLevel;

import java.time.LocalDateTime;

public record SystemLogResponse(
        Long logId,
        LogLevel level,
        String source,
        String message,
        Long runId,
        LocalDateTime createdAt
) {

    public static SystemLogResponse from(SystemLog log) {
        return new SystemLogResponse(
                log.getId(),
                log.getLevel(),
                log.getSource(),
                log.getMessage(),
                log.getProcessRun() != null ? log.getProcessRun().getId() : null,
                log.getCreatedAt()
        );
    }
}
