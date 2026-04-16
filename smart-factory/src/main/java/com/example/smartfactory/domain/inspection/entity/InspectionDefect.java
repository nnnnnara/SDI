package com.example.smartfactory.domain.inspection.entity;

import com.example.smartfactory.global.entity.BaseEntity;
import com.example.smartfactory.domain.inspection.entity.enums.DefectType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "inspection_defects")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InspectionDefect extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "defect_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "defect_type", nullable = false, length = 20)
    private DefectType defectType;

    @Column(name = "bbox_x", nullable = false)
    private Integer bboxX;

    @Column(name = "bbox_y", nullable = false)
    private Integer bboxY;

    @Column(name = "bbox_w", nullable = false)
    private Integer bboxW;

    @Column(name = "bbox_h", nullable = false)
    private Integer bboxH;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false, foreignKey = @ForeignKey(name = "fk_inspection_defects_inspection_id"))
    private Inspection inspection;

    @Builder
    public InspectionDefect(
            Inspection inspection,
            DefectType defectType,
            Integer bboxX,
            Integer bboxY,
            Integer bboxW,
            Integer bboxH
    ) {
        this.inspection = inspection;
        this.defectType = defectType;
        this.bboxX = bboxX;
        this.bboxY = bboxY;
        this.bboxW = bboxW;
        this.bboxH = bboxH;
    }
}
