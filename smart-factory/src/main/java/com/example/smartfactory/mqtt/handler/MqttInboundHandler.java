package com.example.smartfactory.mqtt.handler;

import com.example.smartfactory.domain.inspection.dto.message.InspectionMessage;
import com.example.smartfactory.domain.inspection.service.InspectionMqttService;
import com.example.smartfactory.domain.log.dto.message.EnvironmentMessage;
import com.example.smartfactory.domain.log.service.EnvironmentMqttService;
import com.example.smartfactory.domain.log.service.SystemLogCommandService;
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
    private final SystemLogCommandService systemLogCommandService;

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handle(Message<?> message) {
        String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
        String payload = String.valueOf(message.getPayload());

        try {
            log.info("MQTT message received. topic={}, payload={}", topic, payload);

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
                default -> {
                    log.warn("Unhandled MQTT topic. topic={}, payload={}", topic, payload);
                    systemLogCommandService.warn(
                            "MQTT",
                            "Unhandled MQTT topic received: topic=%s".formatted(topic),
                            null
                    );
                }
            }
        } catch (Exception e) {
            log.error("Failed to process MQTT message. topic={}, payload={}", topic, payload, e);
            saveMqttErrorLog(topic, e);
        }
    }

    private void saveMqttErrorLog(String topic, Exception e) {
        try {
            systemLogCommandService.error(
                    "MQTT",
                    "Failed to process MQTT message: topic=%s, reason=%s".formatted(topic, e.getMessage()),
                    null
            );
        } catch (Exception logException) {
            log.warn("Failed to save MQTT error system log. topic={}", topic, logException);
        }
    }
}
