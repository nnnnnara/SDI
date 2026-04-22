package com.example.smartfactory.domain.process.service;

import com.example.smartfactory.domain.process.dto.response.ControlCommandResponse;
import com.example.smartfactory.domain.process.repository.ControlCommandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ControlCommandQueryService {

    private final ControlCommandRepository controlCommandRepository;

    public Page<ControlCommandResponse> getCommands(Pageable pageable) {
        return controlCommandRepository.findAllByOrderByIssuedAtDesc(pageable)
                .map(ControlCommandResponse::from);
    }
}
