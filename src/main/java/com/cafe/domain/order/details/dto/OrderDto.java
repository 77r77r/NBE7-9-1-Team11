package com.cafe.domain.order.details.dto;

import com.cafe.domain.order.order.entity.GuestOrder;
import com.cafe.domain.order.order.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        Long orderId,
        LocalDateTime orderTime,
        String status,
        List<OrderItemDto> items
) {
    // 회원 주문 생성자
    public OrderDto(Order order, String status) {
        this(
                order.getId(),
                order.getCreatedAt(),
                status,
                order.getOrderItems().stream()
                        .map(OrderItemDto::new)
                        .toList()
        );
    }

    // 비회원 주문 생성자
    public OrderDto(GuestOrder guestOrder, String status) {
        this(
                guestOrder.getId(),
                guestOrder.getCreatedAt(),
                status,
                guestOrder.getItems().stream()
                        .map(OrderItemDto::new)
                        .toList()
        );
    }
}
