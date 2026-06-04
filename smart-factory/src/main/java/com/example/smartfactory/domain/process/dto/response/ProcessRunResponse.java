package com.example.smartfactory.domain.process.dto.response;

import com.example.smartfactory.domain.auth.dto.response.UserSummaryResponse;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;

import java.time.LocalDateTime;

public record ProcessRunResponse(
        Long runId,
        ProcessStatus status,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        String stopReason,
        UserSummaryResponse startedBy
) {

    public static ProcessRunResponse from(ProcessRun processRun) {
        return new ProcessRunResponse(
                processRun.getId(),
                processRun.getStatus(),
                processRun.getStartedAt(),
                processRun.getEndedAt(),
                processRun.getStopReason(),
                processRun.getStartedBy() != null
                        ? UserSummaryResponse.from(processRun.getStartedBy())
                        : null
        );
    }
}
