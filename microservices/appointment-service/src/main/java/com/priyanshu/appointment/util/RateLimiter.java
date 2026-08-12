package com.priyanshu.appointment.util;

import lombok.extern.slf4j.Slf4j;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe Token Bucket rate limiter for appointment booking protection.
 *
 * Algorithm: Token Bucket
 *  - Each key (userId) gets a bucket with maxTokens capacity.
 *  - Tokens refill continuously: 1 token every refillRateMs milliseconds.
 *  - Each request consumes 1 token. No tokens left → request rejected.
 *
 * Advantage over Fixed Window Counter (previous implementation):
 *  Fixed Window allows a boundary burst (2× traffic at window edges).
 *  Token Bucket refills steadily — no burst possible at any point in time.
 *  This is the algorithm used by AWS API Gateway, Stripe, and Nginx.
 *
 * Example: new RateLimiter(3, 100000) → 3 tokens max, 1 token per 100s → 3 req/5min
 */
@Slf4j
public class RateLimiter {

    private final double maxTokens;
    private final double refillRatePerMs;
    private final ConcurrentHashMap<String, Bucket> bucketMap = new ConcurrentHashMap<>();

    /**
     * @param maxTokens    Maximum tokens in the bucket (burst capacity).
     * @param refillRateMs Time in milliseconds to generate ONE token.
     *                     Formula: refillRateMs = windowMs / maxRequests
     */
    public RateLimiter(int maxTokens, long refillRateMs) {
        this.maxTokens = maxTokens;
        this.refillRatePerMs = 1.0 / refillRateMs;
    }

    public boolean tryAcquire(String key) {
        long now = System.currentTimeMillis();
        Bucket bucket = bucketMap.computeIfAbsent(key, k -> new Bucket(maxTokens, now));

        synchronized (bucket) {
            long elapsed = now - bucket.lastRefillTime;
            double tokensToAdd = elapsed * refillRatePerMs;
            bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
            bucket.lastRefillTime = now;

            if (bucket.tokens >= 1.0) {
                bucket.tokens -= 1.0;
                return true;
            }

            log.warn("[Token Bucket] Key '{}' throttled. Remaining tokens: {:.2f}", key, bucket.tokens);
            return false;
        }
    }

    private static class Bucket {
        double tokens;
        long lastRefillTime;

        Bucket(double initialTokens, long now) {
            this.tokens = initialTokens;
            this.lastRefillTime = now;
        }
    }
}
