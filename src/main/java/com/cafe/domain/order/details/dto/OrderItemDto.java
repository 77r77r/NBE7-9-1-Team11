package com.cafe.domain.order.details.dto;

import com.cafe.domain.order.order.entity.OrderItem;

public record OrderItemDto(
        String productName,
        int quantity,
        int price
) {
    public OrderItemDto(OrderItem orderItem) {
        this(
                orderItem.getProduct().getProductName(),
                orderItem.getQuantity(),
                orderItem.getProduct().getProductPrice()
        );
    }
}