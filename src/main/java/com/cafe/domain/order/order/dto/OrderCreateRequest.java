package com.cafe.domain.order.order.dto;

import jakarta.validation.constraints.*;

import java.util.List;

public record OrderCreateRequest(
        @Email @NotBlank String email,
        @NotBlank String address,
        @NotBlank @Pattern(regexp = "\\d{5}", message = "우편번호는 5자리여야 합니다.") String postalCode,
        @NotNull List<Item> items
) {
    public record Item(
            @NotNull Long productId,
            @Min(1) int quantity
    ) {}
}