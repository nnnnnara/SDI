package com.example.smartfactory.domain.process.service;

import com.example.smartfactory.domain.auth.entity.User;
import com.example.smartfactory.domain.auth.repository.UserRepository;
import com.example.smartfactory.domain.process.dto.response.ProcessRunResponse;
import com.example.smartfactory.domain.process.dto.request.StopProcessRequest;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;
import com.example.smartfactory.domain.process.repository.ProcessRunRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import com.example.smartfactory.mqtt.publisher.MqttCommandPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProcessCommandService {

    private final UserRepository userRepository;
    private final ProcessRunRepository processRunRepository;

    private final MqttCommandPublisher mqttCommandPublisher;

    @Transactional
    public ProcessRunResponse start(Long userId) {

        processRunRepository.findFirstByStatusOrderByStartedAtDesc(ProcessStatus.RUNNING)
                .ifPresent(run -> {
                    throw new BusinessException(ErrorCode.PROCESS_ALREADY_RUNNING);
                });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProcessRun processRun = ProcessRun.start(user);
        ProcessRun saved = processRunRepository.save(processRun);

        mqttCommandPublisher.publishStart();

        return ProcessRunResponse.from(saved);
    }

    @Transactional
    public ProcessRunResponse stop(Long runId, StopProcessRequest request) {

        ProcessRun processRun = processRunRepository.findById(runId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        if (processRun.getStatus() != ProcessStatus.RUNNING) {
            throw new BusinessException(ErrorCode.INVALID_PROCESS_STATUS);
        }

        processRun.stop(request.stopReason());

        mqttCommandPublisher.publishStop();

        return ProcessRunResponse.from(processRun);
    }
}
