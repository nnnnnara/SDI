package com.example.smartfactory.domain.process.repository;

import com.example.smartfactory.domain.process.entity.ProcessRun;
import com.example.smartfactory.domain.process.entity.enums.ProcessStatus;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessRunRepository extends JpaRepository<ProcessRun, Long> {

    @EntityGraph(attributePaths = "startedBy")
    Page<ProcessRun> findAllWithStartedBy(Pageable pageable);

    Optional<ProcessRun> findFirstByStatusOrderByStartedAtDesc(ProcessStatus status);
}
