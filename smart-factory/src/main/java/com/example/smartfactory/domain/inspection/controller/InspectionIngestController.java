package com.example.smartfactory.domain.inspection.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.smartfactory.domain.inspection.dto.message.InspectionMessage;
import com.example.smartfactory.domain.inspection.service.InspectionMqttService;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import com.example.smartfactory.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/device/inspections")
public class InspectionIngestController {

    private final InspectionMqttService inspectionMqttService;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ApiResponse<Void> createInspection(@RequestBody String payload) {
        log.info("Jetson inspection payload received. payload={}", summarizePayload(payload));

        InspectionMessage message;
        try {
            message = objectMapper.readValue(payload, InspectionMessage.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse Jetson inspection payload. payload={}, error={}",
                    summarizePayload(payload), e.getOriginalMessage(), e);
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        log.info("Jetson inspection message parsed. runId={}, serialNo={}, result={}, confidence={}, "
                        + "rawImageUrl={}, resultImageUrl={}, rawImageBase64={}, resultImageBase64={}, "
                        + "defectCount={}, inspectedAt={}",
                message.runId(),
                message.serialNo(),
                message.result(),
                message.confidence(),
                message.rawImageUrl(),
                message.resultImageUrl(),
                summarizeLargeValue(message.rawImageBase64()),
                summarizeLargeValue(message.resultImageBase64()),
                message.defects() == null ? null : message.defects().size(),
                message.inspectedAt());

        inspectionMqttService.handle(message);
        return ApiResponse.ok(null);
    }

    private String summarizePayload(String payload) {
        if (payload == null) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            if (root instanceof com.fasterxml.jackson.databind.node.ObjectNode objectNode) {
                summarizeField(objectNode, "rawImageBase64");
                summarizeField(objectNode, "resultImageBase64");
            }
            return root.toString();
        } catch (JsonProcessingException e) {
            return summarizeLargeValue(payload);
        }
    }

    private void summarizeField(com.fasterxml.jackson.databind.node.ObjectNode objectNode, String fieldName) {
        JsonNode field = objectNode.get(fieldName);
        if (field == null || field.isNull()) {
            return;
        }

        objectNode.put(fieldName, summarizeLargeValue(field.asText()));
    }

    private String summarizeLargeValue(String value) {
        if (value == null) {
            return null;
        }

        String compact = value.replaceAll("\\s+", "");
        String preview = compact.substring(0, Math.min(compact.length(), 80));
        return "length=%d, preview=%s".formatted(value.length(), preview);
    }
}
