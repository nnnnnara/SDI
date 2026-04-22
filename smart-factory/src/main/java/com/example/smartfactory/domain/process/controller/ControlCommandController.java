package com.example.smartfactory.domain.process.controller;

import com.example.smartfactory.domain.process.dto.response.ControlCommandResponse;
import com.example.smartfactory.domain.process.service.ControlCommandQueryService;
import com.example.smartfactory.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/commands")
public class ControlCommandController {

    private final ControlCommandQueryService controlCommandQueryService;

    @GetMapping
    public ApiResponse<Page<ControlCommandResponse>> getCommands(
            @PageableDefault(size = 10, sort = "issuedAt", direction = Sort.Direction.DESC)
            org.springframework.data.domain.Pageable pageable
    ) {
        return ApiResponse.ok(controlCommandQueryService.getCommands(pageable));
    }
}
