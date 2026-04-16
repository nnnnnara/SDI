package com.example.smartfactory.domain.inspection.dto;

import com.example.smartfactory.domain.inspection.entity.enums.DefectType;

public record DefectMessage(
        DefectType defectType,
        Integer bboxX,
        Integer bboxY,
        Integer bboxW,
        Integer bboxH
) {}
