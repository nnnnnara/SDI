package com.example.smartfactory.domain.inspection.controller;

import com.example.smartfactory.domain.inspection.dto.message.InspectionMessage;
import com.example.smartfactory.domain.inspection.service.InspectionMqttService;
import com.example.smartfactory.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/device/inspections")
public class InspectionIngestController {

    private final InspectionMqttService inspectionMqttService;

    @PostMapping
    public ApiResponse<Void> createInspection(@RequestBody InspectionMessage message) {
        inspectionMqttService.handle(message);
        return ApiResponse.ok(null);
    }
}
