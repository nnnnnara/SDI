package com.example.smartfactory.domain.inspection.entity;

import com.example.smartfactory.domain.common.entity.BaseEntity;
import com.example.smartfactory.domain.inspection.entity.enums.InspectionResult;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "inspections",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_inspections_product_id", columnNames = "product_id")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inspection extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inspection_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false, length = 10)
    private InspectionResult result;

    @Column(name = "confidence", precision = 5, scale = 4)
    private BigDecimal confidence;

    @Column(name = "raw_image_url", length = 255)
    private String rawImageUrl;

    @Column(name = "result_image_url", length = 255)
    private String resultImageUrl;

    @Column(name = "inspected_at", nullable = false)
    private LocalDateTime inspectedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_inspections_product_id"))
    private Product product;

    @Builder
    public Inspection(
            Product product,
            InspectionResult result,
            BigDecimal confidence,
            String rawImageUrl,
            String resultImageUrl,
            LocalDateTime inspectedAt
    ) {
        this.product = product;
        this.result = result;
        this.confidence = confidence;
        this.rawImageUrl = rawImageUrl;
        this.resultImageUrl = resultImageUrl;
        this.inspectedAt = inspectedAt;
    }
}
