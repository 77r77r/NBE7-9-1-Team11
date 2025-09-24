package com.cafe.domain.order.order.dto;

import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        String email,
        String address,
        String zipcode,
        String status,
        Long totalPrice,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) { }
