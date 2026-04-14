package com.example.smartfactory.domain.log.repository;

import com.example.smartfactory.domain.log.entity.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
}