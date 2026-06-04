package com.example.smartfactory.domain.process.controller;

import com.example.smartfactory.domain.process.dto.message.StatusMessage;
import com.example.smartfactory.domain.process.service.StatusMqttService;
import com.example.smartfactory.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/device/status")
public class StatusIngestController {

    private final StatusMqttService statusMqttService;

    @PostMapping
    public ApiResponse<Void> updateStatus(@RequestBody StatusMessage message) {
        statusMqttService.handle(message);
        return ApiResponse.ok(null);
    }
}
