package com.example.smartfactory.domain.process.entity;

import com.example.smartfactory.domain.auth.entity.User;
import com.example.smartfactory.domain.common.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "control_commands")
public class ControlCommand extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "command_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id", foreignKey = @ForeignKey(name = "fk_control_commands_run_id"))
    private ProcessRun processRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_control_commands_user_id"))
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "command_type", nullable = false, length = 20)
    private CommandType commandType;

    @Enumerated(EnumType.STRING)
    @Column(name = "command_status", nullable = false, length = 20)
    private CommandStatus commandStatus;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @Builder
    public ControlCommand(
            ProcessRun processRun,
            User user,
            CommandType commandType,
            CommandStatus commandStatus,
            LocalDateTime issuedAt
    ) {
        this.processRun = processRun;
        this.user = user;
        this.commandType = commandType;
        this.commandStatus = commandStatus;
        this.issuedAt = issuedAt;
    }

    public void markSent() {
        this.commandStatus = CommandStatus.SENT;
    }

    public void markSuccess(LocalDateTime executedAt) {
        this.commandStatus = CommandStatus.SUCCESS;
        this.executedAt = executedAt;
    }

    public void markFailed() {
        this.commandStatus = CommandStatus.FAILED;
    }
}