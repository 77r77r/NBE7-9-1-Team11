package com.cafe.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer cors() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry reg) {
                reg.addMapping("/**")
                        .allowedOrigins("http://localhost:3000") // 정확히 지정
                        .allowedMethods("GET","POST","PUT","PATCH","DELETE")
                        .allowedHeaders("*")
                        .allowCredentials(true); // 중요
            }
        };
    }

}
