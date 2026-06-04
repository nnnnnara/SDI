package com.example.smartfactory.domain.process.dto.response;

import com.example.smartfactory.domain.auth.dto.response.UserSummaryResponse;
import com.example.smartfactory.domain.process.entity.ControlCommand;
import com.example.smartfactory.domain.process.entity.enums.CommandStatus;
import com.example.smartfactory.domain.process.entity.enums.CommandType;

import java.time.LocalDateTime;

public record ControlCommandResponse(
        Long commandId,
        Long runId,
        CommandType commandType,
        CommandStatus commandStatus,
        LocalDateTime issuedAt,
        LocalDateTime executedAt,
        UserSummaryResponse user
) {

    public static ControlCommandResponse from(ControlCommand controlCommand) {
        return new ControlCommandResponse(
                controlCommand.getId(),
                controlCommand.getProcessRun() != null ? controlCommand.getProcessRun().getId() : null,
                controlCommand.getCommandType(),
                controlCommand.getCommandStatus(),
                controlCommand.getIssuedAt(),
                controlCommand.getExecutedAt(),
                UserSummaryResponse.from(controlCommand.getUser())
        );
    }
}
