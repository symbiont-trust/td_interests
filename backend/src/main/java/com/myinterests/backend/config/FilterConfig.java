package com.myinterests.backend.config;

import com.myinterests.backend.filter.NotificationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

@Configuration
@RequiredArgsConstructor
public class FilterConfig {
    
    private final NotificationFilter notificationFilter;
    
    @Bean
    public FilterRegistrationBean<NotificationFilter> notificationFilterRegistration() {
        FilterRegistrationBean<NotificationFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(notificationFilter);
        registration.addUrlPatterns("/api/*"); // Apply to all API endpoints
        registration.setOrder(Ordered.LOWEST_PRECEDENCE); // Run after authentication
        registration.setName("NotificationFilter");
        return registration;
    }
}