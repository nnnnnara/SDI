package com.example.smartfactory.global.jetson;

import com.example.smartfactory.domain.process.dto.request.JetsonProcessCommandRequest;
import com.example.smartfactory.domain.process.entity.enums.CommandType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class JetsonClient {

    private final WebClient webClient;

    @Value("${jetson.base-url}")
    private String jetsonBaseUrl;

    public void sendCommand(Long runId, CommandType commandType) {

        webClient.post()
                .uri(jetsonBaseUrl + "/process")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new JetsonProcessCommandRequest(
                        runId,
                        commandType.name()
                ))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }
}