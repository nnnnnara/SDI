package com.example.smartfactory.domain.process.repository;

import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.ProcessStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessRunRepository extends JpaRepository<ProcessRun, Long> {
    Optional<ProcessRun> findFirstByStatusOrderByStartedAtDesc(ProcessStatus status);
}