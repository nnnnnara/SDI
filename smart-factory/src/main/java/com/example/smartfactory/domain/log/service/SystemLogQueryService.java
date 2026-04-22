package com.example.smartfactory.domain.log.service;

import com.example.smartfactory.domain.log.dto.response.SystemLogResponse;
import com.example.smartfactory.domain.log.repository.SystemLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SystemLogQueryService {

    private final SystemLogRepository systemLogRepository;

    public Page<SystemLogResponse> getSystemLogs(Pageable pageable) {
        return systemLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(SystemLogResponse::from);
    }
}
