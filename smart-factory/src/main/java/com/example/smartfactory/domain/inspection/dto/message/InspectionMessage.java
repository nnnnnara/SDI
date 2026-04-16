package com.example.smartfactory.domain.inspection.dto.message;

import com.example.smartfactory.domain.inspection.entity.enums.InspectionResult;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InspectionMessage(
        Long runId,
        String serialNo,
        InspectionResult result,
        BigDecimal confidence,
        List<DefectMessage> defects,
        LocalDateTime inspectedAt
) {}
