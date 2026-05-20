package com.example.smartfactory.domain.log.service;

import com.example.smartfactory.domain.log.dto.message.EnvironmentMessage;
import com.example.smartfactory.domain.log.entity.EnvironmentLog;
import com.example.smartfactory.domain.log.repository.EnvironmentLogRepository;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.repository.ProcessRunRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnvironmentMqttService {

    private static final double MAX_TEMPERATURE = 30.0;
    private static final double MAX_HUMIDITY = 70.0;
    private static final double MAX_PM25 = 35.0;
    private static final double MAX_PM10 = 80.0;

    private final EnvironmentLogRepository environmentLogRepository;
    private final ProcessRunRepository processRunRepository;
    private final SystemLogCommandService systemLogCommandService;

    @Transactional
    public void handle(EnvironmentMessage message) {
        ProcessRun processRun = processRunRepository.findById(message.runId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        EnvironmentLog environmentLog = EnvironmentLog.builder()
                .processRun(processRun)
                .pm25(message.pm25())
                .pm10(message.pm10())
                .temperature(message.temperature())
                .humidity(message.humidity())
                .measuredAt(message.measuredAt())
                .build();

        environmentLogRepository.save(environmentLog);
        saveThresholdLogIfNeeded(message);

        log.info("Environment log saved. runId={}", message.runId());
    }

    private void saveThresholdLogIfNeeded(EnvironmentMessage message) {
        if (isOver(message.temperature(), MAX_TEMPERATURE)
                || isOver(message.humidity(), MAX_HUMIDITY)
                || isOver(message.pm25(), MAX_PM25)
                || isOver(message.pm10(), MAX_PM10)) {
            systemLogCommandService.warn(
                    "ENVIRONMENT",
                    "환경 기준치 초과: 온도=%s, 습도=%s, PM2.5=%s, PM10=%s"
                            .formatted(message.temperature(), message.humidity(), message.pm25(), message.pm10()),
                    message.runId()
            );
        }
    }

    private boolean isOver(BigDecimal value, double threshold) {
        return value != null && value.doubleValue() > threshold;
    }
}
