package com.example.smartfactory.domain.environment.repository;

import com.example.smartfactory.domain.environment.entity.EnvironmentLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvironmentLogRepository extends JpaRepository<EnvironmentLog, Long> {
}