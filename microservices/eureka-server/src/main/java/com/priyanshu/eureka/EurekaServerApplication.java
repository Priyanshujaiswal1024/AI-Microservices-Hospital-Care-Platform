package com.priyanshu.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Eureka Service Discovery Server
 *
 * All HMS microservices register here on startup.
 * The API Gateway and Feign clients resolve service URLs
 * dynamically via Eureka instead of hardcoded hostnames.
 *
 * Dashboard: http://localhost:8761
 * Default credentials: admin / admin (set via env vars)
 */
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
