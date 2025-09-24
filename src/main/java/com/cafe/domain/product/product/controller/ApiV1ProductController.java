package com.cafe.domain.product.product.controller;

import com.cafe.domain.product.product.dto.ProductDto;
import com.cafe.domain.product.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/product")
public class ApiV1ProductController {

    private final ProductService productService;

    // 상품 가져오기
    @GetMapping("/list")
    @Transactional(readOnly = true)
    @ResponseBody
    public List<ProductDto> getItems() {
        return productService.findAll().stream()
                .map(ProductDto::new)
                .toList();
    }

}
