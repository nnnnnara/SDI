package com.example.smartfactory.global.sse;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SseEventType {

    CONNECTED("connected"),
    INSPECTION_CREATED("inspection-created"),
    PROCESS_STATUS_CHANGED("process-status-changed");

    private final String eventName;
}
