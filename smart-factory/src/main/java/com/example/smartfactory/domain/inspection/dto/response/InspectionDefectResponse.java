package com.example.smartfactory.domain.inspection.dto.response;

import com.example.smartfactory.domain.inspection.entity.InspectionDefect;

import java.math.BigDecimal;

public record InspectionDefectResponse(
        Long defectId,
        String defectType,
        BigDecimal confidence,
        Integer bboxX,
        Integer bboxY,
        Integer bboxW,
        Integer bboxH
) {

    public static InspectionDefectResponse from(InspectionDefect defect) {
        return new InspectionDefectResponse(
                defect.getId(),
                defect.getDefectType().name(),
                defect.getConfidence(),
                defect.getBboxX(),
                defect.getBboxY(),
                defect.getBboxW(),
                defect.getBboxH()
        );
    }
}
