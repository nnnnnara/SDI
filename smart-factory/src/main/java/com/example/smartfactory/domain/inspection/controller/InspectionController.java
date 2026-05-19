package com.example.smartfactory.domain.inspection.controller;

import com.example.smartfactory.domain.inspection.dto.response.InspectionResponse;
import com.example.smartfactory.domain.inspection.service.InspectionQueryService;
import com.example.smartfactory.global.response.ApiResponse;
import com.example.smartfactory.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/inspections")
public class InspectionController {

    private final InspectionQueryService inspectionQueryService;

    @GetMapping
    public ApiResponse<PageResponse<InspectionResponse>> getInspections(
            @AuthenticationPrincipal Long userId,
            @PageableDefault(size = 20, sort = "inspectedAt", direction = Sort.Direction.DESC)
            org.springframework.data.domain.Pageable pageable
    ) {
        return ApiResponse.ok(PageResponse.from(inspectionQueryService.getInspections(userId, pageable)));
    }

    @GetMapping("/{inspectionId}")
    public ApiResponse<InspectionResponse> getInspection(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long inspectionId
    ) {
        return ApiResponse.ok(inspectionQueryService.getInspection(userId, inspectionId));
    }

    @GetMapping("/recent")
    public ApiResponse<List<InspectionResponse>> getRecentInspections(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ApiResponse.ok(inspectionQueryService.getRecentInspections(userId, limit));
    }
}
