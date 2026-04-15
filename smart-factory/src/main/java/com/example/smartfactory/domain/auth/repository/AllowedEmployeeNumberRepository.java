package com.example.smartfactory.domain.auth.repository;

import com.example.smartfactory.domain.auth.entity.AllowedEmployeeNumber;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AllowedEmployeeNumberRepository extends JpaRepository<AllowedEmployeeNumber, String> {
}
