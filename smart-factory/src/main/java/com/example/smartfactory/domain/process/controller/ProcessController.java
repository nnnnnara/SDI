package com.example.smartfactory.domain.process.controller;

import com.example.smartfactory.domain.inspection.dto.response.InspectionResponse;
import com.example.smartfactory.domain.log.dto.response.EnvironmentLogResponse;
import com.example.smartfactory.domain.process.dto.response.ProcessRunResponse;
import com.example.smartfactory.domain.process.dto.request.StopProcessRequest;
import com.example.smartfactory.domain.process.service.ProcessCommandService;
import com.example.smartfactory.domain.process.service.ProcessQueryService;
import com.example.smartfactory.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
            @PathVariable Long runId,
            @RequestBody @Valid StopProcessRequest request
    ) {
        return ApiResponse.ok(processCommandService.stop(runId, request));
    }

    @GetMapping
    public ApiResponse<Page<ProcessRunResponse>> getRuns(
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return ApiResponse.ok(processQueryService.getRuns(pageable));
    }

    @GetMapping("/current")
    public ApiResponse<ProcessRunResponse> getCurrentRun() {
        return ApiResponse.ok(processQueryService.getCurrentRun());
    }

    @GetMapping("/{runId}")
    public ApiResponse<ProcessRunResponse> getRun(@PathVariable Long runId) {
        return ApiResponse.ok(processQueryService.getRun(runId));
    }

    @GetMapping("/{runId}/environment")
    public ApiResponse<List<EnvironmentLogResponse>> getEnvironmentLogs(@PathVariable Long runId) {
        return ApiResponse.ok(processQueryService.getEnvironmentLogs(runId));
    }

    @GetMapping("/{runId}/inspections")
    public ApiResponse<List<InspectionResponse>> getInspections(@PathVariable Long runId) {
        return ApiResponse.ok(processQueryService.getInspections(runId));
    }
}
