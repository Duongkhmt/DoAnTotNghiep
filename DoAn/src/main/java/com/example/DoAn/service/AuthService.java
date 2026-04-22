package com.example.DoAn.service;

import com.example.DoAn.dto.LoginGoogleDTO;
import com.example.DoAn.mapper.UserMapper;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.example.DoAn.dto.request.LoginRequest;
import com.example.DoAn.dto.request.RefreshTokenRequest;
import com.example.DoAn.dto.response.AuthenticationResponse;
import com.example.DoAn.entity.User;
import com.example.DoAn.exception.ApplicationException;
import com.example.DoAn.exception.ErrorCode;
import com.example.DoAn.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;
    private final UserService userService;
    private final UserMapper userMapper;// Để convert response

    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    @Value("${jwt.valid-duration}")
    private long VALID_DURATION;

    // --- LOGIN ---
    public AuthenticationResponse login(LoginRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApplicationException(ErrorCode.UNAUTHENTICATED);
        }

        var token = generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    // Trong AuthService.java

    public AuthenticationResponse loginWithGoogle(LoginGoogleDTO dto) {
        // Tìm user bằng Email (Khóa chính logic)
        var user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));

        // User tồn tại -> Tạo Token
        String token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .user(userMapper.toUserResponse(user))
                .build();
    }
    // LOGOUT
    public void logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return; // Không có token coi như đã đăng xuất, trả về OK cho Frontend luôn
        }

        String token = authHeader.substring(7);

        try {
            var signedJWT = verifyToken(token);

            String jti = signedJWT.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            long remainingTime = expiryTime.getTime() - System.currentTimeMillis();

            if (remainingTime > 0) {
                // Lưu vào Redis blacklist
                redisTemplate.opsForValue().set(jti, "LOGGED_OUT", remainingTime, TimeUnit.MILLISECONDS);
            }
        } catch (ApplicationException | ParseException | JOSEException e) {
            log.info("Token đã vô hiệu hóa từ trước lúc logout, cho qua.");
        }
    }


    // --- REFRESH ---
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken());

        // Hủy token cũ
        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        long remainingTime = expiryTime.getTime() - System.currentTimeMillis();
        if (remainingTime > 0) {
            redisTemplate.opsForValue().set(jit, "REFRESH_BLOCK", remainingTime, TimeUnit.MILLISECONDS);
        }

        // Tạo token mới
        var email = signedJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));

        var newToken = generateToken(user);
        return AuthenticationResponse.builder()
                .token(newToken)
                .authenticated(true)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    // --- UTILS ---
    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("DoAn-App")
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + VALID_DURATION * 1000))
                .jwtID(UUID.randomUUID().toString())
                .build();
        Payload payload = new Payload(claims.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    public SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        // 1. Check chữ ký & Hết hạn
        boolean verified = signedJWT.verify(verifier);
        boolean isExpired = signedJWT.getJWTClaimsSet().getExpirationTime().before(new Date());

        if (!verified || isExpired) throw new ApplicationException(ErrorCode.UNAUTHENTICATED);

        // 2. Check Redis Blacklist
        if (Boolean.TRUE.equals(redisTemplate.hasKey(signedJWT.getJWTClaimsSet().getJWTID()))) {
            throw new ApplicationException(ErrorCode.UNAUTHENTICATED);
        }
        return signedJWT;
    }
}
