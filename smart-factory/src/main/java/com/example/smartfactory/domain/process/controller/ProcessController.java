package com.example.smartfactory.domain.process.controller;

import com.example.smartfactory.domain.process.dto.response.ProcessRunResponse;
import com.example.smartfactory.domain.process.dto.request.StopProcessRequest;
import com.example.smartfactory.domain.process.service.ProcessCommandService;
import com.example.smartfactory.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/process")
public class ProcessController {

    private final ProcessCommandService processCommandService;

    @PostMapping("/start")
    public ApiResponse<ProcessRunResponse> start(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(processCommandService.start(userId));
    }

    @PostMapping("/{runId}/stop")
    public ApiResponse<ProcessRunResponse> stop(
            @PathVariable Long runId,
            @RequestBody @Valid StopProcessRequest request
    ) {
        return ApiResponse.ok(processCommandService.stop(runId, request));
    }
}
