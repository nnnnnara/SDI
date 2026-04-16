package com.example.smartfactory.domain.process.service;

import com.example.smartfactory.domain.process.dto.message.StatusMessage;
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
public class StatusMqttService {

    private final ProcessRunRepository processRunRepository;

    @Transactional
    public void handle(StatusMessage message) {
        ProcessRun processRun = processRunRepository.findById(message.runId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        processRun.updateStatus(message.status());

        log.info("공정 상태 갱신 완료. runId={}, status={}", message.runId(), message.status());
    }
}
