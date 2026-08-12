package com.priyanshu.billing.util;

import lombok.extern.slf4j.Slf4j;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe Token Bucket rate limiter for billing operations.
 * Protects CPU-heavy operations like PDF invoice generation from abuse.
 *
 * Algorithm: Token Bucket
 *  - Each key (userId) gets a bucket with maxTokens capacity.
 *  - Tokens refill continuously: 1 token every refillRateMs milliseconds.
 *  - Each request consumes 1 token. No tokens left → request rejected.
 *
 * Example: new RateLimiter(10, 6000) → 10 tokens max, 1 token per 6s → 10 req/min
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
