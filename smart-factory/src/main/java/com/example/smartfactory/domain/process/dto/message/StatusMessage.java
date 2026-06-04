package com.example.smartfactory.domain.process.dto.message;

import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;

public record StatusMessage(
        Long runId,
        ProcessStatus status
) {}
