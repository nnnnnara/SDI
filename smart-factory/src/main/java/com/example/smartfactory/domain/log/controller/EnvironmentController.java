package com.example.smartfactory.domain.log.controller;

import com.example.smartfactory.domain.log.dto.response.EnvironmentLogResponse;
import com.example.smartfactory.domain.log.service.EnvironmentQueryService;
import com.example.smartfactory.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/logs/environment")
public class EnvironmentController {

    private final EnvironmentQueryService environmentQueryService;

    @GetMapping("/latest")
    public ApiResponse<EnvironmentLogResponse> getLatestEnvironment() {
        return ApiResponse.ok(environmentQueryService.getLatestEnvironment());
    }

    @GetMapping
    public ApiResponse<List<EnvironmentLogResponse>> getEnvironmentLogs(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime start,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime end
    ) {
        return ApiResponse.ok(environmentQueryService.getEnvironmentLogs(start, end));
    }
}
