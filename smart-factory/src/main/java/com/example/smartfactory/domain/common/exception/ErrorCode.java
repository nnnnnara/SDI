package com.example.smartfactory.domain.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // =========================
    // 1000: COMMON
    // =========================
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, 1000, "잘못된 요청입니다."),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, 1001, "입력값이 올바르지 않습니다."),

    // =========================
    // 2000: AUTH
    // =========================
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, 2000, "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, 2001, "접근 권한이 없습니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, 2002, "토큰이 만료되었습니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, 2003, "아이디 또는 비밀번호가 올바르지 않습니다."),
    REFRESH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, 2004, "리프레시 토큰이 유효하지 않습니다."),
    REFRESH_TOKEN_REVOKED(HttpStatus.UNAUTHORIZED, 2005, "리프레시 토큰이 만료되었거나 폐기되었습니다."),

    // =========================
    // 3000: USER
    // =========================
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, 3000, "존재하지 않는 사용자입니다."),
    DUPLICATE_USER(HttpStatus.CONFLICT, 3001, "이미 존재하는 사용자입니다."),
    DUPLICATE_LOGIN_ID(HttpStatus.CONFLICT, 3002, "이미 사용 중인 로그인 ID입니다."),
    INVALID_EMPLOYEE_NO(HttpStatus.BAD_REQUEST, 3003, "유효하지 않은 사번입니다."),
    ALREADY_USED_EMPLOYEE_NO(HttpStatus.CONFLICT, 3004, "이미 사용된 사번입니다."),

    // =========================
    // 9000: SERVER
    // =========================
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 9000, "서버 오류가 발생했습니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}
