package com.example.smartfactory.domain.process.service;

import com.example.smartfactory.domain.inspection.dto.response.InspectionResponse;
import com.example.smartfactory.domain.inspection.repository.InspectionRepository;
import com.example.smartfactory.domain.log.dto.response.EnvironmentLogResponse;
import com.example.smartfactory.domain.log.repository.EnvironmentLogRepository;
import com.example.smartfactory.domain.process.dto.response.ProcessRunResponse;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;
import com.example.smartfactory.domain.process.repository.ProcessRunRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProcessQueryService {

    private final ProcessRunRepository processRunRepository;
    private final InspectionRepository inspectionRepository;
    private final EnvironmentLogRepository environmentLogRepository;

    public Page<ProcessRunResponse> getRuns(Long userId, Pageable pageable) {
        return processRunRepository.findAllByStartedBy_Id(userId, pageable)
                .map(ProcessRunResponse::from);
    }

    public ProcessRunResponse getCurrentRun(Long userId) {
        return processRunRepository
                .findFirstByStatusAndStartedBy_IdOrderByStartedAtDesc(ProcessStatus.RUNNING, userId)
                .map(ProcessRunResponse::from)
                .orElse(null);
    }

    public ProcessRunResponse getRun(Long userId, Long runId) {
        ProcessRun processRun = processRunRepository.findByIdAndStartedBy_Id(runId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND));

        return ProcessRunResponse.from(processRun);
    }

    public List<EnvironmentLogResponse> getEnvironmentLogs(Long userId, Long runId) {
        validateRunOwner(userId, runId);

        return environmentLogRepository.findAllByProcessRun_IdOrderByMeasuredAtAsc(runId).stream()
                .map(EnvironmentLogResponse::from)
                .toList();
    }

    public List<InspectionResponse> getInspections(Long userId, Long runId) {
        validateRunOwner(userId, runId);

        return inspectionRepository.findAllWithDefectsByRunId(runId).stream()
                .map(InspectionResponse::from)
                .toList();
    }

    private void validateRunOwner(Long userId, Long runId) {
        if (processRunRepository.findByIdAndStartedBy_Id(runId, userId).isEmpty()) {
            throw new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND);
        }
    }
}
