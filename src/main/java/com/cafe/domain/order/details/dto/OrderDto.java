package com.cafe.domain.order.details.dto;

import com.cafe.domain.order.order.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        Long orderId,
        LocalDateTime orderTime,
        String address,
        List<OrderItemDto> items
) {
    public OrderDto(Order order) {
        this(
                order.getId(),
                order.getCreatedAt(),
                order.getAddress(),
                order.getOrderItems().stream()
                        .map(OrderItemDto::new)
                        .toList()
        );
    }
}
