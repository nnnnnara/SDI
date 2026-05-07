package com.example.smartfactory.domain.log.repository;

import com.example.smartfactory.domain.log.entity.EnvironmentLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EnvironmentLogRepository extends JpaRepository<EnvironmentLog, Long> {

    List<EnvironmentLog> findAllByProcessRun_IdOrderByMeasuredAtAsc(Long runId);

    Optional<EnvironmentLog> findFirstByProcessRun_IdOrderByMeasuredAtDesc(Long runId);

    List<EnvironmentLog> findAllByMeasuredAtBetweenOrderByMeasuredAtAsc(LocalDateTime start, LocalDateTime end);

    List<EnvironmentLog> findAllByProcessRun_StartedBy_IdAndMeasuredAtBetweenOrderByMeasuredAtAsc(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );
}
