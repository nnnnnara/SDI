package com.example.smartfactory.domain.inspection.dto.response;

import com.example.smartfactory.domain.inspection.entity.Inspection;
import com.example.smartfactory.domain.inspection.entity.InspectionDefect;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
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
                        representativeConfidence(inspection),
                        imageUrl(inspection, "raw"),
                        imageUrl(inspection, "result"),
                        inspection.getInspectedAt(),
                        inspection.getDefects().stream()
                                .map(InspectionDefectResponse::from)
                                .toList()
        );
    }

    private static String imageUrl(Inspection inspection, String imageType) {
        boolean hasStoredImage = "raw".equals(imageType)
                ? inspection.getRawImageData() != null && inspection.getRawImageData().length > 0
                : inspection.getResultImageData() != null && inspection.getResultImageData().length > 0;

        if (hasStoredImage) {
            return "/api/inspections/%d/images/%s".formatted(inspection.getId(), imageType);
        }

        return "raw".equals(imageType)
                ? inspection.getRawImageUrl()
                : inspection.getResultImageUrl();
    }

    private static BigDecimal representativeConfidence(Inspection inspection) {
        return inspection.getDefects().stream()
                .map(InspectionDefect::getConfidence)
                .filter(confidence -> confidence != null)
                .max(Comparator.naturalOrder())
                .orElse(null);
    }
}
