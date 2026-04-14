package com.example.smartfactory.domain.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "allowed_employee_numbers")
public class AllowedEmployeeNumber {

    @Id
    @Column(name = "allowed_employee_no", length = 20, nullable = false)
    private String allowedEmployeeNo;

    @Column(name = "is_used", nullable = false)
    private boolean isUsed;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public AllowedEmployeeNumber(String allowedEmployeeNo, boolean isUsed) {
        this.allowedEmployeeNo = allowedEmployeeNo;
        this.isUsed = isUsed;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void markUsed() {
        this.isUsed = true;
    }
}