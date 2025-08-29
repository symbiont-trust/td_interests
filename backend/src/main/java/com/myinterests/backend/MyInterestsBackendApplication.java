package com.myinterests.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class MyInterestsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyInterestsBackendApplication.class, args);
    }
}