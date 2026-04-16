package com.example.smartfactory.domain.process.dto.response;

import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;

public record ProcessRunResponse(
        Long runId,
        ProcessStatus status
) {

    public static ProcessRunResponse from(ProcessRun processRun) {
        return new ProcessRunResponse(
                processRun.getId(),
                processRun.getStatus()
        );
    }
}
