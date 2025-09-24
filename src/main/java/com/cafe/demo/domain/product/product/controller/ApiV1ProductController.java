package com.cafe.demo.domain.product.product.controller;

import com.cafe.demo.domain.product.product.entity.Product;
import com.cafe.demo.domain.product.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    // 상품 가져오기
    @GetMapping("/")
    @Transactional(readOnly = true)
    public List<Product> getItems() {
        return productService.findAll().stream()
                .toList();
    }

}
