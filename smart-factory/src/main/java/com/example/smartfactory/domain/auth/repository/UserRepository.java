package com.example.smartfactory.domain.auth.repository;

import com.example.smartfactory.domain.auth.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByLoginId(String loginId);
    boolean existsByEmployeeNo(String employeeNo);
    Optional<User> findByLoginId(String loginId);
}
