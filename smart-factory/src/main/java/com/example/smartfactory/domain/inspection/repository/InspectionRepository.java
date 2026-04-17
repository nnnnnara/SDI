package com.example.smartfactory.domain.inspection.repository;

import com.example.smartfactory.domain.inspection.entity.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {

    @Query("""
                select distinct i
                from Inspection i
                join fetch i.product p
                left join fetch i.defects d
                where p.processRun.id = :runId
                order by i.inspectedAt asc
            """)
    List<Inspection> findAllWithDefectsByRunId(Long runId);
}
