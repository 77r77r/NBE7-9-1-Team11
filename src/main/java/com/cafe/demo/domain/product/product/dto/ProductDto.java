package com.cafe.demo.domain.product.product.dto;

import com.cafe.demo.domain.product.product.entity.Product;

public record ProductDto(
        Long id,
        String name,
        String origin,
        int price,
        int stock
) {
    public ProductDto(Product product) {
        this(
                product.getId(),
                product.getProductName(),
                product.getProductOrigin(),
                product.getProductPrice(),
                product.getProductStock()
        );
    }
}
