package com.cafe.domain.product.product.dto;

import jakarta.validation.constraints.NotBlank;

/**
 *
 * @param name 상품명
 * @param origin 원산지
 * @param price 가격
 * @param stock 재고
 * @param imageUrl 상품이미지url
 */
public record ProductReqBody(
        @NotBlank
        String name,
        String origin,
        @NotBlank
        int price,
        int stock,
        String imageUrl
) {
}
