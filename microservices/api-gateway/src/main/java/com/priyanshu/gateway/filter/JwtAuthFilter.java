package com.priyanshu.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Gateway-level JWT validation filter.
 * Validates the Bearer token and injects userId + roles as downstream headers.
 * Downstream services receive X-User-Id and X-User-Roles headers.
 */
@Slf4j
@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    @Value("${jwt.secretKey}")
    private String secretKey;

    public JwtAuthFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return unauthorized(exchange, "Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);

            try {
                SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                if (claims.getExpiration().before(new Date())) {
                    return unauthorized(exchange, "Token expired");
                }

                Long userId  = claims.get("userId", Long.class);
                String roles = claims.get("roles", String.class);

                // Mutate request: add userId and roles as headers for downstream services
                ServerWebExchange mutatedExchange = exchange.mutate()
                        .request(r -> r
                                .header("X-User-Id", String.valueOf(userId))
                                .header("X-User-Roles", roles != null ? roles : "")
                        )
                        .build();

                log.debug("[Gateway] JWT valid: userId={}, roles={}", userId, roles);
                return chain.filter(mutatedExchange);

            } catch (Exception e) {
                log.warn("[Gateway] JWT validation failed: {}", e.getMessage());
                return unauthorized(exchange, "Invalid token");
            }
        };
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String reason) {
        log.warn("[Gateway] Unauthorized: {}", reason);
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        // No config fields needed for now
    }
}
