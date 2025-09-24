package com.cafe.global.initData;

import com.cafe.domain.product.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

    @Autowired
    @Lazy
    private BaseInitData self;

    @Autowired
    private ProductService productService;

    @Bean
    ApplicationRunner initDataRunner() {
        return args -> {
            self.productInitData(); // 상품 초기 데이터 등록
        };
    }

    /**
     * 상품 초기데이터 등록
     */
    @Transactional
    public void productInitData() {
        if (productService.count() > 0) return;

        productService.register("Colombia Nariño", 5100, "콜롬비아");
        productService.register("Colombia Quindío", 5600, "콜롬비아", 50);
        productService.register("Brazil Serra Do Caparaó", 6300, "브라질", 20);
        productService.register("Ethiopia Yirgacheffe", 6800, "에티오피아", 1);
    }

}