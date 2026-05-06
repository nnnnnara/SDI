package com.example.smartfactory.domain.inspection.service;

import com.example.smartfactory.domain.inspection.dto.message.DefectMessage;
import com.example.smartfactory.domain.inspection.dto.message.InspectionMessage;
import com.example.smartfactory.domain.inspection.entity.Inspection;
import com.example.smartfactory.domain.inspection.entity.InspectionDefect;
import com.example.smartfactory.domain.inspection.entity.Product;
import com.example.smartfactory.domain.inspection.repository.InspectionDefectRepository;
import com.example.smartfactory.domain.inspection.repository.InspectionRepository;
import com.example.smartfactory.domain.inspection.repository.ProductRepository;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.repository.ProcessRunRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InspectionMqttService {

    private final InspectionRepository inspectionRepository;
    private final InspectionDefectRepository inspectionDefectRepository;
    private final ProductRepository productRepository;
    private final ProcessRunRepository processRunRepository;

    @Transactional
    public void handle(InspectionMessage message) {
        ProcessRun processRun = processRunRepository.findById(message.runId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        Product product = productRepository.findBySerialNo(message.serialNo())
                .orElseGet(() -> productRepository.save(
                        Product.builder()
                                .processRun(processRun)
                                .serialNo(message.serialNo())
                                .inputAt(message.inspectedAt())
                                .build()
                ));

        Inspection inspection = Inspection.builder()
                .product(product)
                .result(message.result())
                .confidence(message.confidence())
                .rawImageUrl(message.rawImageUrl())
                .resultImageUrl(message.resultImageUrl())
                .inspectedAt(message.inspectedAt())
                .build();

        Inspection savedInspection = inspectionRepository.save(inspection);

        List<InspectionDefect> defects = new ArrayList<>();
        if (message.defects() != null) {
            for (DefectMessage defectMessage : message.defects()) {
                InspectionDefect defect = InspectionDefect.builder()
                        .inspection(savedInspection)
                        .defectType(defectMessage.defectType())
                        .bboxX(defectMessage.bboxX())
                        .bboxY(defectMessage.bboxY())
                        .bboxW(defectMessage.bboxW())
                        .bboxH(defectMessage.bboxH())
                        .build();
                defects.add(defect);
            }
        }

        if (!defects.isEmpty()) {
            inspectionDefectRepository.saveAll(defects);
        }

        log.info("검사 결과 저장 완료. runId={}, serialNo={}, defectCount={}",
                message.runId(), message.serialNo(), defects.size());
    }
}
