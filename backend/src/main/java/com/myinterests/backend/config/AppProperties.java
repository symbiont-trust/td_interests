package com.myinterests.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    
    private Signature signature = new Signature();
    private Admin admin = new Admin();
    
    @Data
    public static class Signature {
        private String privateKey;
    }
    
    @Data
    public static class Admin {
        private String email;
    }
}