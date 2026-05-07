package com.example.smartfactory.domain.inspection.repository;

import com.example.smartfactory.domain.inspection.entity.Inspection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

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

    @Query("""
                select distinct i
                from Inspection i
                join fetch i.product p
                left join fetch i.defects d
                where i.id = :inspectionId
                and p.processRun.startedBy.id = :userId
            """)
    Optional<Inspection> findDetailByIdAndUserId(Long inspectionId, Long userId);

    @Query("""
                select distinct i
                from Inspection i
                join fetch i.product p
                left join fetch i.defects d
                where p.processRun.startedBy.id = :userId
                order by i.inspectedAt desc
            """)
    List<Inspection> findRecentInspectionsByUserId(Long userId, Pageable pageable);

    @Query(
            value = """
                    select distinct i
                    from Inspection i
                    join i.product p
                    left join fetch i.defects d
                    where p.processRun.startedBy.id = :userId
                    """,
            countQuery = """
                    select count(i)
                    from Inspection i
                    join i.product p
                    where p.processRun.startedBy.id = :userId
                    """
    )
    Page<Inspection> findAllByUserId(Long userId, Pageable pageable);
}
