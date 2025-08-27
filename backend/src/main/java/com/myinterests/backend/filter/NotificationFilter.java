package com.myinterests.backend.filter;

import com.myinterests.backend.service.NotificationService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationFilter implements Filter {
    
    private final NotificationService notificationService;
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Continue with the request processing first
        chain.doFilter(request, response);
        
        // After processing, check if user is authenticated and inject notification header
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() 
                && !"anonymousUser".equals(authentication.getName())) {
                
                String walletAddress = authentication.getName();
                boolean hasNotifications = notificationService.hasNotifications(walletAddress);
                
                // Inject the hasNotifications header
                httpResponse.setHeader("hasNotifications", String.valueOf(hasNotifications));
                
                log.debug("Added hasNotifications header: {} for user: {}", hasNotifications, walletAddress);
            }
        } catch (Exception e) {
            // Don't fail the request if notification check fails
            log.warn("Failed to check notifications for user", e);
        }
    }
}