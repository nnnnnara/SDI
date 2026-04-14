package com.example.smartfactory.domain.inspection.repository;

import com.example.smartfactory.domain.inspection.entity.Product;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySerialNo(String serialNo);
}