package com.example.smartfactory.domain.log.controller;

import com.example.smartfactory.domain.log.dto.response.SystemLogResponse;
import com.example.smartfactory.domain.log.service.SystemLogQueryService;
import com.example.smartfactory.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/logs/system")
public class SystemLogController {

    private final SystemLogQueryService systemLogQueryService;

    @GetMapping
    public ApiResponse<Page<SystemLogResponse>> getSystemLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            org.springframework.data.domain.Pageable pageable
    ) {
        return ApiResponse.ok(systemLogQueryService.getSystemLogs(pageable));
    }
}
