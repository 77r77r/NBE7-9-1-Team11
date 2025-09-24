package com.cafe.demo.domain.product.product.service.ProductTest;

import com.cafe.demo.domain.product.product.entity.Product;
import com.cafe.demo.domain.product.product.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ProductServiceTest {

    @Test
    void 상품() {
        Product product = new Product("테스트상품", 1000);
        System.out.println("product = " + product.toString());
    }

    @Test
    void 상품등록() {
        ProductService productService = new ProductService();

        String pname = "테스트상품";
        int pprice = 1000;

        Product product = productService.register(pname, pprice);

        assertThat(product.getProductName()).isEqualTo(pname);
        assertThat(product.getProductPrice()).isEqualTo(pname);

    }
}
