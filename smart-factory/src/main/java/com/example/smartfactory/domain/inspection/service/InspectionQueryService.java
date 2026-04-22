package com.example.smartfactory.domain.inspection.service;

import com.example.smartfactory.domain.inspection.dto.response.InspectionResponse;
import com.example.smartfactory.domain.inspection.entity.Inspection;
import com.example.smartfactory.domain.inspection.repository.InspectionRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InspectionQueryService {

    private final InspectionRepository inspectionRepository;

    public InspectionResponse getInspection(Long inspectionId) {
        Inspection inspection = inspectionRepository.findDetailById(inspectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INSPECTION_NOT_FOUND));

        return InspectionResponse.from(inspection);
    }

    public List<InspectionResponse> getRecentInspections(int limit) {
        if (limit <= 0) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        List<Inspection> inspections = inspectionRepository.findRecentInspections(PageRequest.of(0, limit));

        return inspections.stream()
                .map(InspectionResponse::from)
                .toList();
    }
}
