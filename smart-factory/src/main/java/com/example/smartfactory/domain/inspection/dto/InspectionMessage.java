package com.example.smartfactory.domain.inspection.dto;

import java.time.LocalDateTime;
import java.util.List;

public record InspectionMessage(
        Long runId,
        String serialNo,
        String result,
        Double confidence,
        List<DefectMessage> defects,
        LocalDateTime inspectedAt
) {}
