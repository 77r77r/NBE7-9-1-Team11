package com.cafe.domain.product.product.service;

import com.cafe.domain.product.product.entity.Product;
import com.cafe.domain.product.product.repository.ProductRepository;
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
    @DisplayName("상품수량확인")
    void t1() {
        long count = productService.count();
        long rpcount = productRepository.count();

        assertThat(count).isEqualTo(rpcount);
        System.out.println("count = " + count);
    }

    @Test
    @DisplayName("상품목록가져오기")
    void t2() {
        List<Product> products = productService.findAll();
        products.forEach(System.out::println);
        assertThat(products).isEqualTo(productRepository.findAll());
    }

    @Test
    @DisplayName("상품삭제하기")
    void t3() {
        Long id = 1L;
        Product product = productService.findById(id).orElse(null);
        assertThat(product).isNotNull();
        assertThat(product.isUseYn()).isTrue();

        productService.delete(product);

        Product deletedProduct = productService.findById(id).orElse(null);
        assertThat(deletedProduct).isNotNull();
        assertThat(deletedProduct.isUseYn()).isFalse();
    }

}