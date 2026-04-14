package com.example.smartfactory.domain.process.repository;

import com.example.smartfactory.domain.process.entity.ControlCommand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ControlCommandRepository extends JpaRepository<ControlCommand, Long> {
}