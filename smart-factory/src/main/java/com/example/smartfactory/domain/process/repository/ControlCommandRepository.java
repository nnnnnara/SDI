package com.example.smartfactory.domain.process.repository;

import com.example.smartfactory.domain.process.entity.ControlCommand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ControlCommandRepository extends JpaRepository<ControlCommand, Long> {

    @EntityGraph(attributePaths = {"user", "processRun"})
    Page<ControlCommand> findAllByOrderByIssuedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "processRun"})
    Page<ControlCommand> findAllByUser_IdOrderByIssuedAtDesc(Long userId, Pageable pageable);
}
