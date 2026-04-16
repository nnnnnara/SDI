package com.example.smartfactory.domain.common.mqtt;

import com.example.smartfactory.domain.inspection.dto.InspectionMessage;
import com.example.smartfactory.domain.log.dto.EnvironmentMessage;
import com.example.smartfactory.domain.process.dto.StatusMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MqttInboundHandler {

    private final ObjectMapper objectMapper;

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handle(Message<?> message) {
        String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
        String payload = String.valueOf(message.getPayload());

        try {
            switch (topic) {
                case "factory/environment" -> {
                    EnvironmentMessage dto = objectMapper.readValue(payload, EnvironmentMessage.class);
                    log.info("[MQTT 환경 데이터 수신] {}", dto);
                }
                case "factory/inspection" -> {
                    InspectionMessage dto = objectMapper.readValue(payload, InspectionMessage.class);
                    log.info("[MQTT 검사 결과 수신] {}", dto);
                }
                case "factory/status" -> {
                    StatusMessage dto = objectMapper.readValue(payload, StatusMessage.class);
                    log.info("[MQTT 상태 데이터 수신] {}", dto);
                }
                default -> log.warn("처리되지 않은 토픽입니다. topic={}, payload={}", topic, payload);
            }
        } catch (Exception e) {
            log.error("MQTT 메시지 처리 중 오류가 발생했습니다. topic={}, payload={}", topic, payload, e);
        }
    }
}
