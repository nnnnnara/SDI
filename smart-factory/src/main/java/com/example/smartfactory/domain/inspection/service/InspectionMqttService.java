package com.example.smartfactory.domain.inspection.service;

import com.example.smartfactory.domain.inspection.dto.message.DefectMessage;
import com.example.smartfactory.domain.inspection.dto.message.InspectionMessage;
import com.example.smartfactory.domain.inspection.entity.Inspection;
import com.example.smartfactory.domain.inspection.entity.InspectionDefect;
import com.example.smartfactory.domain.inspection.entity.Product;
import com.example.smartfactory.domain.inspection.entity.enums.InspectionResult;
import com.example.smartfactory.domain.inspection.repository.InspectionDefectRepository;
import com.example.smartfactory.domain.inspection.repository.InspectionRepository;
import com.example.smartfactory.domain.inspection.repository.ProductRepository;
import com.example.smartfactory.domain.log.service.SystemLogCommandService;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.repository.ProcessRunRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import com.example.smartfactory.global.sse.SseEmitterService;
import com.example.smartfactory.global.sse.SseEventType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class InspectionMqttService {

    private final SseEmitterService sseEmitterService;
    private final InspectionRepository inspectionRepository;
    private final InspectionDefectRepository inspectionDefectRepository;
    private final ProductRepository productRepository;
    private final ProcessRunRepository processRunRepository;
    private final SystemLogCommandService systemLogCommandService;

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

        if (message.result() == InspectionResult.BAD) {
            systemLogCommandService.warn(
                    "INSPECTION",
                    "Bad inspection result: serialNo=%s, defectCount=%d".formatted(message.serialNo(), defects.size()),
                    message.runId()
            );
        }

        sendInspectionEventAfterCommit(processRun, message, defects.size());

        log.info("Inspection result saved. runId={}, serialNo={}, defectCount={}",
                message.runId(), message.serialNo(), defects.size());
    }

    private void sendInspectionEvent(ProcessRun processRun, InspectionMessage message, int defectCount) {
        if (processRun.getStartedBy() == null) {
            return;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("runId", processRun.getId());
        data.put("serialNo", message.serialNo());
        data.put("result", message.result().name());
        data.put("confidence", message.confidence());
        data.put("defectCount", defectCount);
        data.put("message", inspectionMessage(message.result()));

        sseEmitterService.sendToUser(
                processRun.getStartedBy().getId(),
                SseEventType.INSPECTION_CREATED,
                data
        );
    }

    private void sendInspectionEventAfterCommit(ProcessRun processRun, InspectionMessage message, int defectCount) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendInspectionEvent(processRun, message, defectCount);
                }
            });
            return;
        }

        sendInspectionEvent(processRun, message, defectCount);
    }

    private String inspectionMessage(InspectionResult result) {
        return result == InspectionResult.BAD
                ? "\ubd88\ub7c9\uc774 \uac10\uc9c0\ub418\uc5c8\uc2b5\ub2c8\ub2e4."
                : "\uac80\uc0ac\uac00 \uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.";
    }
}
