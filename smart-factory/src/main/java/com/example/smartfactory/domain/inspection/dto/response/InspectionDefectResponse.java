package com.example.smartfactory.domain.inspection.dto.response;

import com.example.smartfactory.domain.inspection.entity.InspectionDefect;

public record InspectionDefectResponse(
        Long defectId,
        String defectType,
        Integer bboxX,
        Integer bboxY,
        Integer bboxW,
        Integer bboxH
) {

    public static InspectionDefectResponse from(InspectionDefect defect) {
        return new InspectionDefectResponse(
                defect.getId(),
                defect.getDefectType().name(),
                defect.getBboxX(),
                defect.getBboxY(),
                defect.getBboxW(),
                defect.getBboxH()
        );
    }
}
