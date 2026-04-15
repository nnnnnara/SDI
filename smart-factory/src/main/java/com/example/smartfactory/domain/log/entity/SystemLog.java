package com.example.smartfactory.domain.log.entity;

import com.example.smartfactory.domain.common.entity.BaseEntity;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "system_logs")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SystemLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false, length = 10)
    private LogLevel level;

    @Column(name = "source", nullable = false, length = 50)
    private String source;

    @Lob
    @Column(name = "message", nullable = false)
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id", foreignKey = @ForeignKey(name = "fk_system_logs_run_id"))
    private ProcessRun processRun;

    @Builder
    public SystemLog(ProcessRun processRun, LogLevel level, String source, String message) {
        this.processRun = processRun;
        this.level = level;
        this.source = source;
        this.message = message;
    }
}
