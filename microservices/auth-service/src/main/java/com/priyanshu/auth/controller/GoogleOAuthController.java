package com.priyanshu.auth.controller;

import com.priyanshu.auth.dto.LoginResponseDto;
import com.priyanshu.auth.entity.User;
import com.priyanshu.auth.entity.type.RoleType;
import com.priyanshu.auth.repository.UserRepository;
import com.priyanshu.auth.security.JWTService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Set;

/**
 * Handles Google OAuth2 "frontend flow":
 * Frontend sends the authorization code + redirect URI, we exchange it for
 * user info and return a JWT — no server-side redirect required.
 *
 * GET /api/v1/auth/oauth2/google/exchange?code=...&redirectUri=...
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth/oauth2")
@RequiredArgsConstructor
public class GoogleOAuthController {

    private final UserRepository userRepository;
    private final JWTService jwtService;
    private final RestTemplate restTemplate;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    /**
     * Exchange Google authorization code for JWT token.
     * Called by frontend after Google redirects back with ?code=...
     */
    @GetMapping("/google/exchange")
    public ResponseEntity<?> exchangeGoogleCode(
            @RequestParam String code,
            @RequestParam String redirectUri
    ) {
        try {
            // ── Step 1: Exchange code for access_token ──────────────────────
            String tokenUrl = "https://oauth2.googleapis.com/token";

            HttpHeaders tokenHeaders = new HttpHeaders();
            tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> tokenBody = new LinkedMultiValueMap<>();
            tokenBody.add("code", code);
            tokenBody.add("client_id", clientId);
            tokenBody.add("client_secret", clientSecret);
            tokenBody.add("redirect_uri", redirectUri);
            tokenBody.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(tokenBody, tokenHeaders);
            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, tokenRequest, Map.class);

            if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
                log.error("Failed to exchange code with Google: {}", tokenResponse.getStatusCode());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Failed to exchange authorization code with Google");
            }

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            // ── Step 2: Fetch user info from Google ─────────────────────────
            String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);

            ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
                    userInfoUrl, HttpMethod.GET, userRequest, Map.class);

            if (!userInfoResponse.getStatusCode().is2xxSuccessful() || userInfoResponse.getBody() == null) {
                log.error("Failed to fetch user info from Google");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to get user info from Google");
            }

            Map<String, Object> userInfo = userInfoResponse.getBody();
            String email      = (String) userInfo.get("email");
            String name       = (String) userInfo.get("name");
            Boolean verified  = (Boolean) userInfo.getOrDefault("verified_email", false);

            if (email == null || !verified) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Google account email is not verified");
            }

            // ── Step 3: Find or create user ─────────────────────────────────
            User user = userRepository.findByUsername(email).orElseGet(() -> {
                User newUser = User.builder()
                        .username(email)
                        .fullName(name != null ? name : email)
                        .emailVerified(true)
                        .authProvider("GOOGLE")
                        .roles(Set.of(RoleType.PATIENT))
                        .build();
                return userRepository.save(newUser);
            });

            // ── Step 4: Generate JWT and return ─────────────────────────────
            String token = jwtService.generateToken(user);
            String role  = user.getRoles().iterator().next().name();

            log.info("Google OAuth exchange successful for user: {}", email);
            return ResponseEntity.ok(new LoginResponseDto(token, user.getId(), role));

        } catch (Exception ex) {
            log.error("Google OAuth exchange error: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("OAuth exchange failed: " + ex.getMessage());
        }
    }
}
