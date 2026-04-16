package com.example.smartfactory.mqtt.handler;

import com.example.smartfactory.domain.inspection.dto.message.InspectionMessage;
import com.example.smartfactory.domain.inspection.service.InspectionMqttService;
import com.example.smartfactory.domain.log.dto.message.EnvironmentMessage;
import com.example.smartfactory.domain.log.service.EnvironmentMqttService;
import com.example.smartfactory.domain.process.dto.message.StatusMessage;
import com.example.smartfactory.domain.process.service.StatusMqttService;
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
    private final EnvironmentMqttService environmentMqttService;
    private final InspectionMqttService inspectionMqttService;
    private final StatusMqttService statusMqttService;

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handle(Message<?> message) {
        String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
        String payload = String.valueOf(message.getPayload());

        try {
            switch (topic) {
                case "factory/environment" -> {
                    EnvironmentMessage dto = objectMapper.readValue(payload, EnvironmentMessage.class);
                    environmentMqttService.handle(dto);
                }
                case "factory/inspection" -> {
                    InspectionMessage dto = objectMapper.readValue(payload, InspectionMessage.class);
                    inspectionMqttService.handle(dto);
                }
                case "factory/status" -> {
                    StatusMessage dto = objectMapper.readValue(payload, StatusMessage.class);
                    statusMqttService.handle(dto);
                }
                default -> log.warn("처리되지 않은 토픽입니다. topic={}, payload={}", topic, payload);
            }
        } catch (Exception e) {
            log.error("MQTT 메시지 처리 중 오류가 발생했습니다. topic={}, payload={}", topic, payload, e);
        }
    }
}
