package com.example.smartfactory.domain.log.service;

import com.example.smartfactory.domain.log.entity.LogLevel;
import com.example.smartfactory.domain.log.entity.SystemLog;
import com.example.smartfactory.domain.log.repository.SystemLogRepository;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.repository.ProcessRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemLogCommandService {

    private static final int SOURCE_MAX_LENGTH = 50;
    private static final int MESSAGE_MAX_LENGTH = 255;

    private final SystemLogRepository systemLogRepository;
    private final ProcessRunRepository processRunRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void info(String source, String message, Long runId) {
        save(LogLevel.INFO, source, message, runId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void warn(String source, String message, Long runId) {
        save(LogLevel.WARN, source, message, runId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void error(String source, String message, Long runId) {
        save(LogLevel.ERROR, source, message, runId);
    }

    private void save(LogLevel level, String source, String message, Long runId) {
        ProcessRun processRun = runId != null
                ? processRunRepository.findById(runId).orElse(null)
                : null;

        systemLogRepository.save(SystemLog.builder()
                .processRun(processRun)
                .level(level)
                .source(truncate(source, SOURCE_MAX_LENGTH))
                .message(truncate(message, MESSAGE_MAX_LENGTH))
                .build());
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return "";
        }

        if (value.length() <= maxLength) {
            return value;
        }

        return value.substring(0, maxLength);
    }
}
