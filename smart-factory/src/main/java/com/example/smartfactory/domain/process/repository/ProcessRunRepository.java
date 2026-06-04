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

    @EntityGraph(attributePaths = "startedBy")
    Page<ProcessRun> findAllByStartedBy_Id(Long userId, Pageable pageable);

    Optional<ProcessRun> findByIdAndStartedBy_Id(Long runId, Long userId);

    Optional<ProcessRun> findFirstByStatusOrderByStartedAtDesc(ProcessStatus status);

    Optional<ProcessRun> findFirstByStatusAndStartedBy_IdOrderByStartedAtDesc(ProcessStatus status, Long userId);
}
