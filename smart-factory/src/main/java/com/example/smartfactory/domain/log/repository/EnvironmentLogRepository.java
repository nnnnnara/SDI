package com.example.smartfactory.domain.log.repository;

import com.example.smartfactory.domain.log.entity.EnvironmentLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnvironmentLogRepository extends JpaRepository<EnvironmentLog, Long> {

    List<EnvironmentLog> findAllByProcessRun_IdOrderByMeasuredAtAsc(Long runId);
}
