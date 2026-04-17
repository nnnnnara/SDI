package com.example.smartfactory.domain.inspection.dto.response;

import com.example.smartfactory.domain.inspection.entity.Inspection;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InspectionResponse(
        Long inspectionId,
        String serialNo,
        String result,
        BigDecimal confidence,
        String rawImageUrl,
        String resultImageUrl,
        LocalDateTime inspectedAt,
        List<InspectionDefectResponse> defects
) {

    public static InspectionResponse from(Inspection inspection) {
        return new InspectionResponse(
                inspection.getId(),
                inspection.getProduct().getSerialNo(),
                inspection.getResult().name(),
                inspection.getConfidence(),
                inspection.getRawImageUrl(),
                inspection.getResultImageUrl(),
                inspection.getInspectedAt(),
                inspection.getDefects().stream()
                        .map(InspectionDefectResponse::from)
                        .toList()
        );
    }
}
