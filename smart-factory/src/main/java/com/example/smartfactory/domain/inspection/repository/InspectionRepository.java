package com.example.smartfactory.domain.inspection.repository;

import com.example.smartfactory.domain.inspection.entity.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {
}
