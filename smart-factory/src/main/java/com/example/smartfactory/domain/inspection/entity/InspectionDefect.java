package com.example.smartfactory.domain.inspection.entity;

import com.example.smartfactory.global.entity.BaseEntity;
import com.example.smartfactory.domain.inspection.entity.enums.DefectType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

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

    @Column(name = "confidence", precision = 5, scale = 4)
    private BigDecimal confidence;

    @Column(name = "bbox_x")
    private Integer bboxX;

    @Column(name = "bbox_y")
    private Integer bboxY;

    @Column(name = "bbox_w")
    private Integer bboxW;

    @Column(name = "bbox_h")
    private Integer bboxH;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false, foreignKey = @ForeignKey(name = "fk_inspection_defects_inspection_id"))
    private Inspection inspection;

    @Builder
    public InspectionDefect(
            Inspection inspection,
            DefectType defectType,
            BigDecimal confidence,
            Integer bboxX,
            Integer bboxY,
            Integer bboxW,
            Integer bboxH
    ) {
        this.inspection = inspection;
        this.defectType = defectType;
        this.confidence = confidence;
        this.bboxX = bboxX;
        this.bboxY = bboxY;
        this.bboxW = bboxW;
        this.bboxH = bboxH;
    }
}
