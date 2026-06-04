package com.example.smartfactory.domain.process.entity;

import com.example.smartfactory.domain.auth.entity.User;
import com.example.smartfactory.global.entity.BaseEntity;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "process_runs")
public class ProcessRun extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "run_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "varchar(20)")
    private ProcessStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "stop_reason", length = 255)
    private String stopReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "started_by", foreignKey = @ForeignKey(name = "fk_process_runs_started_by"))
    private User startedBy;

    @Builder
    public ProcessRun(ProcessStatus status, User startedBy, LocalDateTime startedAt) {
        this.status = status;
        this.startedBy = startedBy;
        this.startedAt = startedAt;
    }

    public static ProcessRun start(User startedBy) {
        return ProcessRun.builder()
                .status(ProcessStatus.RUNNING)
                .startedBy(startedBy)
                .startedAt(LocalDateTime.now())
                .build();
    }

    public void updateStatus(ProcessStatus status) {
        this.status = status;
    }

    public void stop(String stopReason) {
        if (isTerminalStatus()) {
            return;
        }

        this.status = ProcessStatus.STOPPED;
        this.stopReason = stopReason;
        this.endedAt = LocalDateTime.now();
    }

    public void complete(String stopReason) {
        if (isTerminalStatus()) {
            return;
        }

        this.status = ProcessStatus.COMPLETED;
        this.stopReason = stopReason;
        this.endedAt = LocalDateTime.now();
    }

    public void markError() {
        if (isTerminalStatus()) {
            return;
        }

        this.status = ProcessStatus.ERROR;
        this.endedAt = LocalDateTime.now();
    }

    private boolean isTerminalStatus() {
        return this.status == ProcessStatus.COMPLETED
                || this.status == ProcessStatus.STOPPED
                || this.status == ProcessStatus.ERROR;
    }
}
