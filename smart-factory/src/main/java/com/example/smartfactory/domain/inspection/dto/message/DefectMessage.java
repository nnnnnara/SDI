package com.example.smartfactory.domain.inspection.dto.message;

import com.example.smartfactory.domain.inspection.entity.enums.DefectType;

import java.math.BigDecimal;

public record DefectMessage(
        DefectType defectType,
        BigDecimal confidence,
        Integer bboxX,
        Integer bboxY,
        Integer bboxW,
        Integer bboxH
) {}
