package com.example.smartfactory.domain.auth.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.example.smartfactory.domain.common.entity.BaseEntity;

@Getter
@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_login_id", columnNames = "login_id"),
                @UniqueConstraint(name = "uk_users_employee_no", columnNames = "employee_no")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "login_id", nullable = false, length = 50)
    private String loginId;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "employee_no", nullable = false, length = 20)
    private String employeeNo;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    @Builder
    public User(String loginId, String password, String name, String employeeNo, UserRole role) {
        this.loginId = loginId;
        this.password = password;
        this.name = name;
        this.employeeNo = employeeNo;
        this.role = role;
    }

    public static User create(String loginId, String encodedPassword, String name, String employeeNo) {
        return User.builder()
                .loginId(loginId)
                .password(encodedPassword)
                .name(name)
                .employeeNo(employeeNo)
                .role(UserRole.ROLE_USER)
                .build();
    }
}
