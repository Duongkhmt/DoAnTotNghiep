package com.example.DoAn.security;

import com.example.DoAn.dto.LoginGoogleDTO;
import com.example.DoAn.dto.response.AuthenticationResponse;
import com.example.DoAn.service.AuthService;
import com.example.DoAn.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final AuthService authService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // 1. Map DTO
        LoginGoogleDTO loginGoogleDTO = LoginGoogleDTO.builder()
                .email((String) attributes.get("email"))
                .fullName((String) attributes.get("name"))
                .avatarUrl((String) attributes.get("picture"))
                .providerId((String) attributes.get("sub"))
                .createdAt(LocalDateTime.now())
                .build();

        // 2. Lưu User
        userService.createUserWithGoogle(loginGoogleDTO);

        // 3. Tạo Token
        AuthenticationResponse authResponse = authService.loginWithGoogle(loginGoogleDTO);
        String token = authResponse.getToken();
        if (request.getSession(false) != null) {
            request.getSession().invalidate();
        }

        // 4. Redirect về Frontend React (Khớp với useEffect trong Dashboard.jsx)
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .queryParam("accessToken", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}