package com.example.smartfactory.domain.inspection.service;

import com.example.smartfactory.domain.inspection.dto.response.InspectionResponse;
import com.example.smartfactory.domain.inspection.entity.Inspection;
import com.example.smartfactory.domain.inspection.repository.InspectionRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
        Page<Long> inspectionIds = inspectionRepository.findIdsByUserId(userId, pageable);
        List<InspectionResponse> inspections = findInspectionsKeepingOrder(inspectionIds.getContent()).stream()
                .map(InspectionResponse::from)
                .toList();

        return new PageImpl<>(inspections, pageable, inspectionIds.getTotalElements());
    }

    public List<InspectionResponse> getRecentInspections(Long userId, int limit) {
        if (limit <= 0) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        List<Long> inspectionIds = inspectionRepository.findRecentInspectionIdsByUserId(userId, PageRequest.of(0, limit));

        return findInspectionsKeepingOrder(inspectionIds).stream()
                .map(InspectionResponse::from)
                .toList();
    }

    private List<Inspection> findInspectionsKeepingOrder(List<Long> inspectionIds) {
        if (inspectionIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Inspection> inspectionsById = inspectionRepository
                .findAllWithProductAndDefectsByIdIn(inspectionIds).stream()
                .collect(Collectors.toMap(Inspection::getId, Function.identity()));

        return inspectionIds.stream()
                .map(inspectionsById::get)
                .toList();
    }
}
