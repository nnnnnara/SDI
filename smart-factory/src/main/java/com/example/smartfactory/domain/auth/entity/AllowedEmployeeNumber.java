package com.example.smartfactory.domain.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "allowed_employee_numbers")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AllowedEmployeeNumber {

    @Id
    @Column(name = "allowed_employee_no", length = 20, nullable = false)
    private String allowedEmployeeNo;

    @Column(name = "is_used", nullable = false)
    private boolean isUsed;

    @Builder
    public AllowedEmployeeNumber(String allowedEmployeeNo) {
        this.allowedEmployeeNo = allowedEmployeeNo;
        this.isUsed = false;
    }

    public void markUsed() {
        this.isUsed = true;
    }
}
