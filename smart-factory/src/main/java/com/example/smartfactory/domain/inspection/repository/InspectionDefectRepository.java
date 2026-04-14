package com.example.smartfactory.domain.inspection.repository;

import com.example.smartfactory.domain.inspection.entity.InspectionDefect;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionDefectRepository extends JpaRepository<InspectionDefect, Long> {
}