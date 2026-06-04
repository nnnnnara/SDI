package com.example.smartfactory.domain.process.controller;

import com.example.smartfactory.domain.process.dto.response.ControlCommandResponse;
import com.example.smartfactory.domain.process.service.ControlCommandQueryService;
import com.example.smartfactory.global.response.ApiResponse;
import com.example.smartfactory.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/commands")
public class ControlCommandController {

    private final ControlCommandQueryService controlCommandQueryService;

    @GetMapping
    public ApiResponse<PageResponse<ControlCommandResponse>> getCommands(
            @AuthenticationPrincipal Long userId,
            @PageableDefault(size = 20, sort = "issuedAt", direction = Sort.Direction.DESC)
            org.springframework.data.domain.Pageable pageable
    ) {
        return ApiResponse.ok(PageResponse.from(controlCommandQueryService.getCommands(userId, pageable)));
    }

    @GetMapping("/recent")
    public ApiResponse<List<ControlCommandResponse>> getRecentCommands(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "8") int limit
    ) {
        return ApiResponse.ok(controlCommandQueryService.getRecentCommands(userId, limit));
    }
}
