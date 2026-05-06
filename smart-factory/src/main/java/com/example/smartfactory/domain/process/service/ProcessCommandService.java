package com.example.smartfactory.domain.process.service;

import com.example.smartfactory.domain.auth.entity.User;
import com.example.smartfactory.domain.auth.repository.UserRepository;
import com.example.smartfactory.domain.process.dto.response.ProcessRunResponse;
import com.example.smartfactory.domain.process.dto.request.StopProcessRequest;
import com.example.smartfactory.domain.process.entity.ControlCommand;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.enums.CommandStatus;
import com.example.smartfactory.domain.process.entity.enums.CommandType;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;
import com.example.smartfactory.domain.process.repository.ControlCommandRepository;
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
    private final ControlCommandRepository controlCommandRepository;

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
        ControlCommand command = saveCommand(saved, user, CommandType.START);

        mqttCommandPublisher.publishStart();
        command.markSent();

        return ProcessRunResponse.from(saved);
    }

    @Transactional
    public ProcessRunResponse stop(Long userId, Long runId, StopProcessRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProcessRun processRun = processRunRepository.findByIdAndStartedBy_Id(runId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        if (processRun.getStatus() != ProcessStatus.RUNNING) {
            throw new BusinessException(ErrorCode.INVALID_PROCESS_STATUS);
        }

        processRun.stop(request.stopReason());
        ControlCommand command = saveCommand(processRun, user, CommandType.STOP);

        mqttCommandPublisher.publishStop();
        command.markSent();

        return ProcessRunResponse.from(processRun);
    }

    private ControlCommand saveCommand(ProcessRun processRun, User user, CommandType commandType) {
        return controlCommandRepository.save(ControlCommand.builder()
                .processRun(processRun)
                .user(user)
                .commandType(commandType)
                .commandStatus(CommandStatus.REQUESTED)
                .issuedAt(java.time.LocalDateTime.now())
                .build());
    }
}
