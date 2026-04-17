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

    public Page<ProcessRunResponse> getRuns(Pageable pageable) {
        return processRunRepository.findAllWithStartedBy(pageable)
                .map(ProcessRunResponse::from);
    }

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

    public List<EnvironmentLogResponse> getEnvironmentLogs(Long runId) {
        validateRunExists(runId);

        return environmentLogRepository.findAllByProcessRun_IdOrderByMeasuredAtAsc(runId).stream()
                .map(EnvironmentLogResponse::from)
                .toList();
    }

    public List<InspectionResponse> getInspections(Long runId) {
        validateRunExists(runId);

        return inspectionRepository.findAllWithDefectsByRunId(runId).stream()
                .map(InspectionResponse::from)
                .toList();
    }

    private void validateRunExists(Long runId) {
        if (!processRunRepository.existsById(runId)) {
            throw new BusinessException(ErrorCode.PROCESS_RUN_NOT_FOUND);
        }
    }
}
