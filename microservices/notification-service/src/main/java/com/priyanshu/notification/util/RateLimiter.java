package com.priyanshu.notification.util;

import lombok.extern.slf4j.Slf4j;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thread-safe sliding window rate limiter for email dispatch throttling.
 */
@Slf4j
public class RateLimiter {

    private final int maxRequests;
    private final long windowMs;
    private final ConcurrentHashMap<String, UserRateLimit> limitMap = new ConcurrentHashMap<>();

    public RateLimiter(int maxRequests, long windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    public boolean tryAcquire(String key) {
        long now = System.currentTimeMillis();
        UserRateLimit rateLimit = limitMap.computeIfAbsent(key, k -> new UserRateLimit(now));

        // Clean up expired window
        if (now - rateLimit.windowStart.get() > windowMs) {
            synchronized (rateLimit) {
                if (now - rateLimit.windowStart.get() > windowMs) {
                    rateLimit.windowStart.set(now);
                    rateLimit.requestCount.set(0);
                }
            }
        }

        int currentCount = rateLimit.requestCount.incrementAndGet();
        if (currentCount > maxRequests) {
            log.warn("[Rate Limit] Key '{}' exceeded limit! ({} requests in current window)", key, currentCount);
            return false;
        }
        return true;
    }

    private static class UserRateLimit {
        final AtomicLong windowStart;
        final AtomicInteger requestCount = new AtomicInteger(0);

        UserRateLimit(long start) {
            this.windowStart = new AtomicLong(start);
        }
    }
}
