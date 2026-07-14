package com.priyanshu.doctor.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class GatewayHeaderAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String userIdHeader = request.getHeader("X-User-Id");
        String rolesHeader = request.getHeader("X-User-Roles");

        if (userIdHeader != null) {
            try {
                Long userId = Long.valueOf(userIdHeader);
                List<SimpleGrantedAuthority> authorities = Collections.emptyList();

                if (rolesHeader != null && !rolesHeader.trim().isEmpty()) {
                    authorities = Arrays.stream(rolesHeader.split(","))
                            .map(String::trim)
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                }

                // Ingest into request attributes
                request.setAttribute("userId", userId);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (NumberFormatException e) {
                // Ignore invalid header format
            }
        }

        filterChain.doFilter(request, response);
    }
}
