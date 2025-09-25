package com.cafe.domain.product.product.controller;

import com.cafe.domain.product.product.dto.ProductDto;
import com.cafe.domain.product.product.entity.Product;
import com.cafe.domain.product.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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


    record ProductCreateReqBody(
            String name,
            String origin,
            int price,
            int stock,
            String imageUrl
    ) {}

    @PostMapping
    @Transactional
    @ResponseBody
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto createItem(
            @RequestBody ProductCreateReqBody reqBody
    ) {
        Product product = productService.register(reqBody.name, reqBody.price, reqBody.origin, reqBody.stock, reqBody.imageUrl);

        return new ProductDto(product);
    }

}
