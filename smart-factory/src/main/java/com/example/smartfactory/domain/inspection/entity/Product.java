package com.example.smartfactory.domain.inspection.entity;

import com.example.smartfactory.domain.common.entity.BaseEntity;
import com.example.smartfactory.domain.process.entity.ProcessRun;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "products",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_products_serial_no", columnNames = "serial_no")
        }
)
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id", nullable = false, foreignKey = @ForeignKey(name = "fk_products_run_id"))
    private ProcessRun processRun;

    @Column(name = "serial_no", nullable = false, length = 100)
    private String serialNo;

    @Column(name = "input_at", nullable = false)
    private LocalDateTime inputAt;

    @Builder
    public Product(ProcessRun processRun, String serialNo, LocalDateTime inputAt) {
        this.processRun = processRun;
        this.serialNo = serialNo;
        this.inputAt = inputAt;
    }
}