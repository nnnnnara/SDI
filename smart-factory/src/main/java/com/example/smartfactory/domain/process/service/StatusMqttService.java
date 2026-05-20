package com.example.smartfactory.domain.process.service;

import com.example.smartfactory.domain.log.service.SystemLogCommandService;
import com.example.smartfactory.domain.process.dto.message.StatusMessage;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;
import com.example.smartfactory.domain.process.repository.ProcessRunRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import com.example.smartfactory.global.sse.SseEmitterService;
import com.example.smartfactory.global.sse.SseEventType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatusMqttService {

    private static final String NORMAL_COMPLETE = "NORMAL_COMPLETE";
    private static final String USER_STOP = "USER_STOP";

    private final SseEmitterService sseEmitterService;
    private final ProcessRunRepository processRunRepository;
    private final SystemLogCommandService systemLogCommandService;

    @Transactional
    public void handle(StatusMessage message) {
        ProcessRun processRun = processRunRepository.findById(message.runId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        updateProcessStatus(processRun, message.status());
        processRunRepository.saveAndFlush(processRun);
        saveStatusLogIfNeeded(message);
        sendStatusEventAfterCommit(
                processRun.getStartedBy() != null ? processRun.getStartedBy().getId() : null,
                processRun.getId(),
                message.status()
        );

        log.info("Process status updated. runId={}, requestedStatus={}, savedStatus={}",
                message.runId(), message.status(), processRun.getStatus());
    }

    private void updateProcessStatus(ProcessRun processRun, ProcessStatus status) {
        if (status == ProcessStatus.COMPLETED) {
            processRun.complete(NORMAL_COMPLETE);
        } else if (status == ProcessStatus.STOPPED) {
            processRun.stop(USER_STOP);
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
        } else if (message.status() == ProcessStatus.COMPLETED) {
            systemLogCommandService.info(
                    "PROCESS",
                    "Process completed: runId=%d".formatted(message.runId()),
                    message.runId()
            );
        } else if (message.status() == ProcessStatus.STOPPED) {
            systemLogCommandService.info(
                    "PROCESS",
                    "Process stopped by user: runId=%d".formatted(message.runId()),
                    message.runId()
            );
        }
    }

    private void sendStatusEvent(Long userId, Long runId, ProcessStatus status) {
        if (userId == null) {
            log.warn("Skip process status SSE event because startedBy is missing. runId={}, status={}", runId, status);
            return;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("runId", runId);
        data.put("status", status.name());
        data.put("message", statusMessage(status));

        sseEmitterService.sendToUser(userId, SseEventType.PROCESS_STATUS_CHANGED, data);
        log.info("Process status SSE event sent. userId={}, runId={}, status={}", userId, runId, status);
    }

    private void sendStatusEventAfterCommit(Long userId, Long runId, ProcessStatus status) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendStatusEvent(userId, runId, status);
                }
            });
            return;
        }

        sendStatusEvent(userId, runId, status);
    }

    private String statusMessage(ProcessStatus status) {
        return switch (status) {
            case COMPLETED -> "\uacf5\uc815\uc774 \uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.";
            case STOPPED -> "\uc0ac\uc6a9\uc790\uc5d0 \uc758\ud574 \uacf5\uc815\uc774 \uc911\ub2e8\ub418\uc5c8\uc2b5\ub2c8\ub2e4.";
            case ERROR -> "\uacf5\uc815 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.";
            case RUNNING -> "\uacf5\uc815\uc774 \uc2dc\uc791\ub418\uc5c8\uc2b5\ub2c8\ub2e4.";
            case READY -> "\uacf5\uc815\uc774 \ub300\uae30 \uc0c1\ud0dc\uc785\ub2c8\ub2e4.";
        };
    }
}
