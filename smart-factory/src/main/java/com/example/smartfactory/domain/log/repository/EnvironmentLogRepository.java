package com.example.smartfactory.domain.log.repository;

import com.example.smartfactory.domain.log.entity.EnvironmentLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvironmentLogRepository extends JpaRepository<EnvironmentLog, Long> {
}
