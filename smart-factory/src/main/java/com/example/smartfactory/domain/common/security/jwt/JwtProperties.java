package com.example.smartfactory.domain.common.security.jwt;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
        @NotBlank
        String secret,
        @NotNull
        Duration accessTokenTtl,
        @NotBlank
        String header,
        @NotBlank
        String prefix
) {}
