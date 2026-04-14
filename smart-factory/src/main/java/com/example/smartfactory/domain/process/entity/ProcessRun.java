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
@Table(name = "process_runs")
public class ProcessRun extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "run_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProcessStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "started_by", foreignKey = @ForeignKey(name = "fk_process_runs_started_by"))
    private User startedBy;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "stop_reason", length = 255)
    private String stopReason;

    @Builder
    public ProcessRun(ProcessStatus status, User startedBy, LocalDateTime startedAt) {
        this.status = status;
        this.startedBy = startedBy;
        this.startedAt = startedAt;
    }

    public void stop(String stopReason, LocalDateTime endedAt) {
        this.status = ProcessStatus.STOPPED;
        this.stopReason = stopReason;
        this.endedAt = endedAt;
    }

    public void markError() {
        this.status = ProcessStatus.ERROR;
    }
}