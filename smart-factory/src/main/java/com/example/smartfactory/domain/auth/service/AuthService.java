package com.example.smartfactory.domain.auth.service;

import com.example.smartfactory.domain.auth.dto.request.LoginRequest;
import com.example.smartfactory.domain.auth.dto.request.SignupRequest;
import com.example.smartfactory.domain.auth.dto.response.SignupResponse;
import com.example.smartfactory.domain.auth.dto.response.TokenResponse;
import com.example.smartfactory.domain.auth.entity.AllowedEmployeeNumber;
import com.example.smartfactory.domain.auth.entity.User;
import com.example.smartfactory.domain.auth.repository.AllowedEmployeeNumberRepository;
import com.example.smartfactory.domain.auth.repository.UserRepository;
import com.example.smartfactory.global.exception.BusinessException;
import com.example.smartfactory.global.exception.ErrorCode;
import com.example.smartfactory.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AllowedEmployeeNumberRepository allowedEmployeeNumberRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public SignupResponse signup(SignupRequest req) {
        if (userRepository.existsByLoginId(req.loginId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        if (userRepository.existsByEmployeeNo(req.employeeNo())) {
            throw new BusinessException(ErrorCode.DUPLICATE_USER);
        }

        AllowedEmployeeNumber allowedEmployeeNumber = allowedEmployeeNumberRepository.findById(req.employeeNo())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_EMPLOYEE_NO));

        if (allowedEmployeeNumber.isUsed()) {
            throw new BusinessException(ErrorCode.ALREADY_USED_EMPLOYEE_NO);
        }

        String encodedPassword = passwordEncoder.encode(req.password());

        User user = User.create(
                req.loginId(),
                encodedPassword,
                req.name(),
                req.employeeNo()
        );

        userRepository.save(user);
        allowedEmployeeNumber.markUsed();

        return SignupResponse.of(user.getId());
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest req) {
        User user = userRepository.findByLoginId(req.loginId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getRole().name());

        return TokenResponse.of(user.getId(), accessToken);
    }
}
