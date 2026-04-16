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

@Slf4j
@Service
@RequiredArgsConstructor
public class EnvironmentMqttService {

    private final EnvironmentLogRepository environmentLogRepository;
    private final ProcessRunRepository processRunRepository;

    @Transactional
    public void handle(EnvironmentMessage message) {
        ProcessRun processRun = processRunRepository.findById(message.runId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        EnvironmentLog environmentLog = EnvironmentLog.builder()
                .processRun(processRun)
                .pm25(message.pm25())
                .pm10(message.pm10())
                .temperature(message.temperature())
                .humidity(message.
                        humidity())
                .measuredAt(message.measuredAt())
                .build();

        environmentLogRepository.save(environmentLog);

        log.info("환경 로그 저장 완료. runId={}", message.runId());
    }
}
