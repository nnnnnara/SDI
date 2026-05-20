package com.example.smartfactory.domain.inspection.controller;

import com.example.smartfactory.domain.inspection.dto.response.InspectionResponse;
import com.example.smartfactory.domain.inspection.service.InspectionQueryService;
import com.example.smartfactory.global.response.ApiResponse;
import com.example.smartfactory.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

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

    @GetMapping("/{inspectionId}/images/{imageType}")
    public ResponseEntity<byte[]> getInspectionImage(
            @PathVariable Long inspectionId,
            @PathVariable String imageType
    ) {
        InspectionQueryService.InspectionImage image = inspectionQueryService.getInspectionImage(inspectionId, imageType);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.contentType()))
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
                .body(image.data());
    }

    @GetMapping("/recent")
    public ApiResponse<List<InspectionResponse>> getRecentInspections(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ApiResponse.ok(inspectionQueryService.getRecentInspections(userId, limit));
    }
}
