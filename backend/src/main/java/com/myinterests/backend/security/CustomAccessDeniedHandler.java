package com.myinterests.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                      AccessDeniedException accessDeniedException) throws IOException, ServletException {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String uri = request.getRequestURI();
        
        log.warn("Access denied for URI: {} - Authentication: {}", uri, 
                authentication != null ? authentication.getName() : "none");
        
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setHeader("Content-Type", "application/json");
        
        // Check if the user has UNREGISTERED_USER role
        if (authentication != null && authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_UNREGISTERED_USER".equals(auth.getAuthority()))) {
            // User has valid JWT but doesn't exist in database
            log.info("Access denied for unregistered user: {}", authentication.getName());
            response.setHeader("x-error-type", "USER_NOT_REGISTERED");
            response.getWriter().write("{\"error\":\"User not found in database\",\"code\":\"USER_NOT_REGISTERED\"}");
        } else if (authentication == null || authentication.getAuthorities().isEmpty()) {
            // No authentication at all
            response.setHeader("x-error-type", "INSUFFICIENT_ROLES");
            response.getWriter().write("{\"error\":\"No authentication\",\"code\":\"INSUFFICIENT_ROLES\"}");
        } else {
            // Other access denied reasons
            response.setHeader("x-error-type", "INSUFFICIENT_ROLES");
            response.getWriter().write("{\"error\":\"Insufficient permissions\",\"code\":\"INSUFFICIENT_ROLES\"}");
        }
    }
}