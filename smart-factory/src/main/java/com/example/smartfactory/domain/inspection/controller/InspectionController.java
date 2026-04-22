package com.example.smartfactory.domain.inspection.controller;

import com.example.smartfactory.domain.inspection.dto.response.InspectionResponse;
import com.example.smartfactory.domain.inspection.service.InspectionQueryService;
import com.example.smartfactory.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/inspections")
public class InspectionController {

    private final InspectionQueryService inspectionQueryService;

    @GetMapping("/{inspectionId}")
    public ApiResponse<InspectionResponse> getInspection(@PathVariable Long inspectionId) {
        return ApiResponse.ok(inspectionQueryService.getInspection(inspectionId));
    }

    @GetMapping("/recent")
    public ApiResponse<List<InspectionResponse>> getRecentInspections(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ApiResponse.ok(inspectionQueryService.getRecentInspections(limit));
    }
}
