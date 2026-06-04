package com.example.smartfactory.domain.process.service;

import com.example.smartfactory.domain.process.dto.response.ControlCommandResponse;
import com.example.smartfactory.domain.process.repository.ControlCommandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ControlCommandQueryService {

    private final ControlCommandRepository controlCommandRepository;

    public Page<ControlCommandResponse> getCommands(Long userId, Pageable pageable) {
        return controlCommandRepository.findAllByUser_IdOrderByIssuedAtDesc(userId, pageable)
                .map(ControlCommandResponse::from);
    }

    public List<ControlCommandResponse> getRecentCommands(Long userId, int limit) {
        int normalizedLimit = Math.max(1, Math.min(limit, 50));

        return controlCommandRepository.findAllByUser_IdOrderByIssuedAtDesc(userId, PageRequest.of(0, normalizedLimit))
                .stream()
                .map(ControlCommandResponse::from)
                .toList();
    }
}
