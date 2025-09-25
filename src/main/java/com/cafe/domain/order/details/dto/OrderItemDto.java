package com.cafe.domain.order.details.dto;

import com.cafe.domain.order.order.entity.GuestOrderItem;
import com.cafe.domain.order.order.entity.OrderItem;

public record OrderItemDto(
        String productName,
        int quantity,
        int price
) {
    // 회원 주문 아이템 변환
    public OrderItemDto(OrderItem orderItem) {
        this(
                orderItem.getProduct().getProductName(),
                orderItem.getQuantity(),
                orderItem.getProduct().getProductPrice() * orderItem.getQuantity()
        );
    }

    // 비회원 주문 아이템 변환
    public OrderItemDto(GuestOrderItem guestOrderItem) {
        this(
                guestOrderItem.getProduct().getProductName(),
                guestOrderItem.getQuantity(),
                guestOrderItem.getProduct().getProductPrice() * guestOrderItem.getQuantity()
        );
    }
}