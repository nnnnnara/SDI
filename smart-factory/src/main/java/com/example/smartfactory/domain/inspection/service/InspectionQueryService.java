package com.example.smartfactory.domain.inspection.service;

import com.example.smartfactory.domain.inspection.dto.response.InspectionResponse;
import com.example.smartfactory.domain.inspection.entity.Inspection;
import com.example.smartfactory.domain.inspection.repository.InspectionRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InspectionQueryService {

    private final InspectionRepository inspectionRepository;

    public InspectionResponse getInspection(Long userId, Long inspectionId) {
        Inspection inspection = inspectionRepository.findDetailByIdAndUserId(inspectionId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INSPECTION_NOT_FOUND));

        return InspectionResponse.from(inspection);
    }

    public Page<InspectionResponse> getInspections(Long userId, Pageable pageable) {
        return inspectionRepository.findAllByUserId(userId, pageable)
                .map(InspectionResponse::from);
    }

    public List<InspectionResponse> getRecentInspections(Long userId, int limit) {
        if (limit <= 0) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        List<Inspection> inspections = inspectionRepository.findRecentInspectionsByUserId(userId, PageRequest.of(0, limit));

        return inspections.stream()
                .map(InspectionResponse::from)
                .toList();
    }
}
