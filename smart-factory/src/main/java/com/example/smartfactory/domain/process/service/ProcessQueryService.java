package com.example.smartfactory.domain.process.service;

import com.example.smartfactory.domain.process.dto.response.ProcessRunResponse;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;
import com.example.smartfactory.domain.process.repository.ProcessRunRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProcessQueryService {

    private final ProcessRunRepository processRunRepository;

    public ProcessRunResponse getCurrentRun() {
        ProcessRun processRun = processRunRepository
                .findFirstByStatusOrderByStartedAtDesc(ProcessStatus.RUNNING)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        return ProcessRunResponse.from(processRun);
    }

    public ProcessRunResponse getRun(Long runId) {
        ProcessRun processRun = processRunRepository.findById(runId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        return ProcessRunResponse.from(processRun);
    }
}
