package com.example.smartfactory.domain.process.dto.request;

public record JetsonProcessCommandRequest(
        Long runId,
        String commandType
) {
}
