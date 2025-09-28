package com.cafe.domain.order.details.dto;

import com.cafe.domain.order.order.entity.GuestOrder;
import com.cafe.domain.order.order.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

public record AllOrderDto(
        String email,
        String address,
        String postalCode,
        LocalDateTime orderTime,
        String status,
        List<OrderItemDto> items
) {
    // 회원 주문
    public AllOrderDto(Order order, String status) {
        this(
                order.getMember() != null ? order.getMember().getEmail() : "",
                order.getMember() != null ? order.getMember().getAddress() : "",
                order.getMember() != null ? order.getMember().getPostalCode() : "",
                order.getCreatedAt(),
                status,
                order.getOrderItems().stream()
                        .map(OrderItemDto::new)
                        .toList()
        );
    }

    // 비회원 주문
    public AllOrderDto(GuestOrder guestOrder, String status) {
        this(
                guestOrder.getEmail(),
                guestOrder.getAddress(),
                guestOrder.getPostalCode(),
                guestOrder.getCreatedAt(),
                status,
                guestOrder.getItems().stream()
                        .map(OrderItemDto::new)
                        .toList()
        );
    }
}