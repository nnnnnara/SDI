package com.example.smartfactory.domain.process.service;

import com.example.smartfactory.domain.log.service.SystemLogCommandService;
import com.example.smartfactory.domain.process.dto.message.StatusMessage;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;
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
    private final SystemLogCommandService systemLogCommandService;

    private static final String NORMAL_COMPLETE = "NORMAL_COMPLETE";

    @Transactional
    public void handle(StatusMessage message) {
        ProcessRun processRun = processRunRepository.findById(message.runId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        updateProcessStatus(processRun, message.status());
        saveStatusLogIfNeeded(message);

        log.info("Process status updated. runId={}, status={}", message.runId(), message.status());
    }

    private void updateProcessStatus(ProcessRun processRun, ProcessStatus status) {
        if (status == ProcessStatus.STOPPED) {
            processRun.stop(NORMAL_COMPLETE);
        } else if (status == ProcessStatus.ERROR) {
            processRun.markError();
        } else {
            processRun.updateStatus(status);
        }
    }

    private void saveStatusLogIfNeeded(StatusMessage message) {
        if (message.status() == ProcessStatus.ERROR) {
            systemLogCommandService.error(
                    "PROCESS",
                    "Process status changed to ERROR: runId=%d".formatted(message.runId()),
                    message.runId()
            );
        } else if (message.status() == ProcessStatus.STOPPED) {
            systemLogCommandService.info(
                    "PROCESS",
                    "Process stopped: runId=%d".formatted(message.runId()),
                    message.runId()
            );
        }
    }
}
