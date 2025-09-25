package com.cafe.domain.product.product.dto;

import com.cafe.domain.product.product.entity.Product;

public record ProductDto(
        Long id,
        String name,
        String origin,
        int price,
        int stock,
        String imageUrl
) {
    public ProductDto(Product product) {
        this(
                product.getId(),
                product.getProductName(),
                product.getProductOrigin(),
                product.getProductPrice(),
                product.getProductStock(),
                product.getImageUrl()
        );
    }
}
