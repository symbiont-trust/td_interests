package com.myinterests.backend.security;

import com.myinterests.backend.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        log.debug("JWT Filter: Processing request to {}", request.getRequestURI());
        final String authHeader = request.getHeader("Authorization");
        log.debug("JWT Filter: Authorization header: {}", authHeader != null ? "present" : "missing");
        final String jwt;
        final String walletAddress;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            // Check if this is a profile API token
            if (jwtUtil.validateProfileApiToken(jwt)) {
                String clientId = jwtUtil.extractSubject(jwt);
                
                if (clientId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Create authentication token for API client
                    List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_API_CLIENT")
                    );

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        clientId,
                        null,
                        authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    // Set client ID as request attribute for easy access
                    request.setAttribute("clientId", clientId);
                }
            } else {
                // Handle regular user token
                walletAddress = jwtUtil.extractWalletAddress(jwt);

                if (walletAddress != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    log.debug("JWT Filter: Checking authentication for wallet address: {}", walletAddress);
                    
                    if (jwtUtil.validateToken(jwt, walletAddress)) {
                        log.debug("JWT Filter: Token is valid for wallet address: {}", walletAddress);
                        var user = userService.getUserByWalletAddress(walletAddress);
                        log.debug("JWT Filter: User lookup result: {}", user != null ? "found" : "not found");
                        
                        if (user != null) {
                            log.debug("JWT Filter: User found and token valid, granting ROLE_USER");
                            // Create authentication token with user roles
                            List<SimpleGrantedAuthority> authorities = List.of(
                                new SimpleGrantedAuthority("ROLE_USER")
                            );

                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                walletAddress,
                                null,
                                authorities
                            );
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);

                            // Set wallet address as request attribute for easy access
                            request.setAttribute("walletAddress", walletAddress);
                        } else {
                            log.warn("JWT Filter: Valid token but user not found in database for wallet: {}. Setting UNREGISTERED_USER role.", walletAddress);
                            // Set authentication with special UNREGISTERED_USER role
                            List<SimpleGrantedAuthority> authorities = List.of(
                                new SimpleGrantedAuthority("ROLE_UNREGISTERED_USER")
                            );

                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                walletAddress,
                                null,
                                authorities
                            );
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    } else {
                        log.warn("JWT Filter: Invalid token for wallet address: {}", walletAddress);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage(), e);
        }
        

        filterChain.doFilter(request, response);
    }
}