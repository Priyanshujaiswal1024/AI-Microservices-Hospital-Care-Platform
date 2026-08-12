package com.priyanshu.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ══════════════════════════════════════════════════════════════════
 * GlobalRateLimitFilter — Token Bucket, IP-Based, API Gateway Level
 * ══════════════════════════════════════════════════════════════════
 *
 * This is the FIRST line of defense against bots, scrapers, and DDoS.
 *
 * Runs on EVERY request before routing to any microservice.
 * Keyed by client IP address (respects X-Forwarded-For for proxies).
 * Allows 100 requests per minute per IP (1 token refills every 600ms).
 *
 * Algorithm: Token Bucket
 *  - Bucket holds up to 100 tokens per IP
 *  - 1 new token added every 600ms (= 100 tokens/min)
 *  - Each request consumes 1 token
 *  - If bucket is empty → 429 Too Many Requests (blocked here, before any service runs)
 *
 * Why Token Bucket (not Fixed Window)?
 *  Fixed Window allows bursts at window boundary (10 requests in 2 seconds).
 *  Token Bucket refills continuously — no boundary burst possible.
 *
 * Why at the Gateway (not inside each service)?
 *  In-service limiters don't protect against unauthenticated traffic.
 *  A bot can hammer /api/v1/auth/signup (no JWT required) endlessly.
 *  This filter blocks it at the edge, before touching any DB or service.
 * ══════════════════════════════════════════════════════════════════
 */
@Slf4j
@Component
public class GlobalRateLimitFilter implements GlobalFilter, Ordered {

    // Token Bucket config: 100 requests per minute per IP
    private static final int MAX_TOKENS = 100;
    private static final long REFILL_RATE_MS = 600L; // 1 token per 600ms → 100/min

    private final ConcurrentHashMap<String, Bucket> bucketMap = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientIp = resolveClientIp(exchange);

        if (!tryAcquire(clientIp)) {
            log.warn("[GlobalRateLimit ✗] IP '{}' throttled — 429 Too Many Requests", clientIp);
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return exchange.getResponse().setComplete();
        }

        log.debug("[GlobalRateLimit ✓] IP '{}' allowed", clientIp);
        return chain.filter(exchange);
    }

    private boolean tryAcquire(String key) {
        long now = System.currentTimeMillis();
        Bucket bucket = bucketMap.computeIfAbsent(key, k -> new Bucket(MAX_TOKENS, now));

        synchronized (bucket) {
            // Refill: calculate tokens earned since last request
            long elapsed = now - bucket.lastRefillTime;
            double tokensToAdd = (double) elapsed / REFILL_RATE_MS;
            bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + tokensToAdd);
            bucket.lastRefillTime = now;

            if (bucket.tokens >= 1.0) {
                bucket.tokens -= 1.0;
                return true;   // allowed
            }
            return false;      // rejected
        }
    }

    /**
     * Resolves client IP.
     * Checks X-Forwarded-For first (set by load balancers/proxies like Nginx/AWS ALB).
     * Falls back to direct remote address.
     */
    private String resolveClientIp(ServerWebExchange exchange) {
        String forwarded = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
        return remoteAddress != null ? remoteAddress.getAddress().getHostAddress() : "unknown";
    }

    /**
     * Order = -1 ensures this runs BEFORE JwtAuthFilter (default order = 0).
     * Blocked IPs never reach JWT validation.
     */
    @Override
    public int getOrder() {
        return -1;
    }

    // ── Per-IP Token Bucket State ─────────────────────────────────────────────

    private static class Bucket {
        double tokens;
        long lastRefillTime;

        Bucket(double initialTokens, long now) {
            this.tokens = initialTokens;
            this.lastRefillTime = now;
        }
    }
}
