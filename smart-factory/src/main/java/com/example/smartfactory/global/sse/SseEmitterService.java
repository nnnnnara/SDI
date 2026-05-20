package com.example.smartfactory.global.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class SseEmitterService {

    private static final long TIMEOUT = 60L * 60L * 1000L;

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter connect(Long userId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT);

        List<SseEmitter> userEmitters = emitters.computeIfAbsent(userId, key -> new CopyOnWriteArrayList<>());
        userEmitters.add(emitter);
        log.info("SSE connected. userId={}, activeEmitters={}", userId, userEmitters.size());

        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError(error -> remove(userId, emitter));

        sendToEmitter(userId, emitter, SseEventType.CONNECTED, Map.of(
                "message", "SSE connected"
        ));

        return emitter;
    }

    public void sendToUser(Long userId, SseEventType eventType, Object data) {
        List<SseEmitter> userEmitters = emitters.get(userId);

        if (userEmitters == null || userEmitters.isEmpty()) {
            log.info("Skip SSE event because user has no active emitters. userId={}, event={}",
                    userId, eventType.getEventName());
            return;
        }

        for (SseEmitter emitter : userEmitters) {
            sendToEmitter(userId, emitter, eventType, data);
        }
    }

    private void sendToEmitter(Long userId, SseEmitter emitter, SseEventType eventType, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .name(eventType.getEventName())
                    .data(data));
            log.info("SSE event sent. userId={}, event={}", userId, eventType.getEventName());
        } catch (IOException | IllegalStateException e) {
            log.warn("Failed to send SSE event. userId={}, event={}", userId, eventType.getEventName(), e);
            remove(userId, emitter);
        }
    }

    private void remove(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);

        if (userEmitters == null) {
            return;
        }

        userEmitters.remove(emitter);

        if (userEmitters.isEmpty()) {
            emitters.remove(userId);
        }

        log.info("SSE disconnected. userId={}, activeEmitters={}", userId, userEmitters.size());
    }
}
