package com.example.smartfactory.domain.inspection.dto;

public record DefectMessage(
        String defectType,
        Integer bboxX,
        Integer bboxY,
        Integer bboxW,
        Integer bboxH
) {}
