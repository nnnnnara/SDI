package com.example.smartfactory.domain.log.service;

import com.example.smartfactory.domain.log.dto.response.EnvironmentLogResponse;
import com.example.smartfactory.domain.log.entity.EnvironmentLog;
import com.example.smartfactory.domain.log.repository.EnvironmentLogRepository;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;
import com.example.smartfactory.domain.process.repository.ProcessRunRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnvironmentQueryService {

    private final EnvironmentLogRepository environmentLogRepository;
    private final ProcessRunRepository processRunRepository;

    public EnvironmentLogResponse getLatestEnvironment(Long userId) {
        ProcessRun currentRun = processRunRepository
                .findFirstByStatusAndStartedBy_IdOrderByStartedAtDesc(ProcessStatus.RUNNING, userId)
                .orElse(null);

        if (currentRun == null) {
            return null;
        }

        EnvironmentLog environmentLog = environmentLogRepository
                .findFirstByProcessRun_IdOrderByMeasuredAtDesc(currentRun.getId())
                .orElse(null);

        return environmentLog != null ? EnvironmentLogResponse.from(environmentLog) : null;
    }

    public List<EnvironmentLogResponse> getEnvironmentLogs(Long userId, LocalDateTime start, LocalDateTime end) {
        if (start.isAfter(end)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        List<EnvironmentLog> logs = environmentLogRepository
                .findAllByProcessRun_StartedBy_IdAndMeasuredAtBetweenOrderByMeasuredAtAsc(userId, start, end);

        return logs.stream()
                .map(EnvironmentLogResponse::from)
                .toList();
    }
}
