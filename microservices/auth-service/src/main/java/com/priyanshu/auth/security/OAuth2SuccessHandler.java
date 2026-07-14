package com.priyanshu.auth.security;

import com.priyanshu.auth.entity.User;
import com.priyanshu.auth.entity.type.RoleType;
import com.priyanshu.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JWTService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");

        // Find or create the user
        User user = userRepository.findByUsername(email).orElseGet(() -> {
            User newUser = User.builder()
                    .username(email)
                    .fullName(name)
                    .emailVerified(true)
                    .authProvider("GOOGLE")
                    .roles(Set.of(RoleType.PATIENT))
                    .build();
            return userRepository.save(newUser);
        });

        // Generate JWT
        String token = jwtService.generateToken(user);

        // Redirect frontend with the token in the URL (frontend reads it)
        String redirectUrl = "http://localhost:5173/oauth/callback?token=" + token
                + "&userId=" + user.getId()
                + "&role=" + user.getRoles().iterator().next().name();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
