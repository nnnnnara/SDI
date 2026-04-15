package com.example.smartfactory.domain.log.entity;

import com.example.smartfactory.domain.common.entity.BaseEntity;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "environment_logs")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EnvironmentLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "env_log_id")
    private Long id;

    @Column(name = "pm25", precision = 10, scale = 2)
    private BigDecimal pm25;

    @Column(name = "pm10", precision = 10, scale = 2)
    private BigDecimal pm10;

    @Column(name = "temperature", precision = 5, scale = 2)
    private BigDecimal temperature;

    @Column(name = "humidity", precision = 5, scale = 2)
    private BigDecimal humidity;

    @Column(name = "measured_at", nullable = false)
    private LocalDateTime measuredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id", nullable = false, foreignKey = @ForeignKey(name = "fk_environment_logs_run_id"))
    private ProcessRun processRun;

    @Builder
    public EnvironmentLog(
            ProcessRun processRun,
            BigDecimal pm25,
            BigDecimal pm10,
            BigDecimal temperature,
            BigDecimal humidity,
            LocalDateTime measuredAt
    ) {
        this.processRun = processRun;
        this.pm25 = pm25;
        this.pm10 = pm10;
        this.temperature = temperature;
        this.humidity = humidity;
        this.measuredAt = measuredAt;
    }
}
