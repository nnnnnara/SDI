package com.example.smartfactory.mqtt.publisher;

import com.example.smartfactory.domain.process.dto.message.CommandMessage;
import com.example.smartfactory.domain.process.entity.enums.CommandType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.messaging.MessageChannel;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class MqttCommandPublisher {

    private final MessageChannel mqttOutboundChannel;
    private final ObjectMapper objectMapper;

    public void publishStart(Long runId) {
        publish(new CommandMessage(runId, CommandType.START, LocalDateTime.now()));
    }

    public void publishStop(Long runId) {
        publish(new CommandMessage(runId, CommandType.STOP, LocalDateTime.now()));
    }

    private void publish(CommandMessage commandMessage) {
        try {
            String payload = objectMapper.writeValueAsString(commandMessage);

            mqttOutboundChannel.send(
                    MessageBuilder.withPayload(payload)
                            .setHeader("mqtt_topic", "factory/command")
                            .setHeader("mqtt_qos", 1)
                            .build()
            );
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("MQTT 명령 발행 실패", e);
        }
    }
}
