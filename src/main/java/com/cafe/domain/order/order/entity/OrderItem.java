package com.cafe.domain.order.order.entity;

import com.cafe.domain.order.order.dto.OrderResponse;
import com.cafe.domain.product.product.entity.Product;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class OrderItem {

    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JsonIgnore
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private Product product;
    private int quantity;

    void setOrder(Order order) {
        this.order = order;
    }

    public OrderResponse.OrderItemResponse toDto() {
        return new OrderResponse.OrderItemResponse(
                product.getId(),
                product.getProductName(),
                product.getProductPrice(),
                quantity
        );
    }
}
