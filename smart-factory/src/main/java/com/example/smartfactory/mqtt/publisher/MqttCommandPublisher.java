package com.example.smartfactory.mqtt.publisher;

import com.example.smartfactory.domain.process.dto.CommandMessage;
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

    public void publishStart() {
        publish(new CommandMessage("START", LocalDateTime.now()));
    }

    public void publishStop() {
        publish(new CommandMessage("STOP", LocalDateTime.now()));
    }

    public void publish(CommandMessage commandMessage) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(commandMessage);

            mqttOutboundChannel.send(
                    MessageBuilder.withPayload(jsonPayload)
                            .setHeader("mqtt_topic", "factory/command")
                            .setHeader("mqtt_qos", 1)
                            .build()
            );
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("MQTT 명령 메시지 JSON 변환에 실패했습니다.", e);
        }
    }
}
