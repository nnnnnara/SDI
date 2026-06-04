package com.example.smartfactory.domain.process.controller;

import com.example.smartfactory.domain.inspection.dto.response.InspectionResponse;
import com.example.smartfactory.domain.log.dto.response.EnvironmentLogResponse;
import com.example.smartfactory.domain.process.dto.response.ProcessRunResponse;
import com.example.smartfactory.domain.process.dto.request.StopProcessRequest;
import com.example.smartfactory.domain.process.service.ProcessCommandService;
import com.example.smartfactory.domain.process.service.ProcessQueryService;
import com.example.smartfactory.global.response.ApiResponse;
import com.example.smartfactory.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/process")
public class ProcessController {

    private final ProcessQueryService processQueryService;
    private final ProcessCommandService processCommandService;

    @PostMapping("/start")
    public ApiResponse<ProcessRunResponse> start(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(processCommandService.start(userId));
    }

    @PostMapping("/{runId}/stop")
    public ApiResponse<ProcessRunResponse> stop(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long runId,
            @RequestBody @Valid StopProcessRequest request
    ) {
        return ApiResponse.ok(processCommandService.stop(userId, runId, request));
    }

    @GetMapping
    public ApiResponse<PageResponse<ProcessRunResponse>> getRuns(
            @AuthenticationPrincipal Long userId,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return ApiResponse.ok(PageResponse.from(processQueryService.getRuns(userId, pageable)));
    }

    @GetMapping("/current")
    public ApiResponse<ProcessRunResponse> getCurrentRun(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(processQueryService.getCurrentRun(userId));
    }

    @GetMapping("/{runId}")
    public ApiResponse<ProcessRunResponse> getRun(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long runId
    ) {
        return ApiResponse.ok(processQueryService.getRun(userId, runId));
    }

    @GetMapping("/{runId}/environment")
    public ApiResponse<List<EnvironmentLogResponse>> getEnvironmentLogs(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long runId
    ) {
        return ApiResponse.ok(processQueryService.getEnvironmentLogs(userId, runId));
    }

    @GetMapping("/{runId}/inspections")
    public ApiResponse<List<InspectionResponse>> getInspections(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long runId
    ) {
        return ApiResponse.ok(processQueryService.getInspections(userId, runId));
    }
}
