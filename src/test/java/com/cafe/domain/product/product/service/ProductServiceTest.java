package com.cafe.domain.product.product.service;

import com.cafe.demo.domain.product.product.entity.Product;
import com.cafe.demo.domain.product.product.repository.ProductRepository;
import com.cafe.demo.domain.product.product.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ProductServiceTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

    @Test
    @DisplayName("상품")
    void t1() {
        Product product = new Product("테스트상품", 1000);
        System.out.println("product = " + product.toString());
    }

    @Test
    @DisplayName("상품등록")
    void t2() {
        String pname = "테스트상품";
        int pprice = 1000;

        Product product = productService.register(pname, pprice);

        assertThat(product.getProductName()).isEqualTo(pname);
        assertThat(product.getProductPrice()).isEqualTo(pprice);
    }

    @Test
    @DisplayName("상품수량확인")
    void t3() {
        long count = productService.count();
        long rpcount = productRepository.count();

        assertThat(count).isEqualTo(rpcount);
        System.out.println("count = " + count);
    }

    @Test
    @DisplayName("상품목록가져오기")
    void t4() {
        List<Product> products = productService.findAll();
        products.forEach(System.out::println);
        assertThat(products).isEqualTo(productRepository.findAll());
    }
}
