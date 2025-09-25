package com.cafe.domain.order.order.entity;

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
    @JoinColumn(name = "order_id")
    private Order order;

    private Long productId;
    private int quantity;

    public static OrderItem of(Long productId, int quantity) {
        OrderItem oi = new OrderItem();
        oi.productId = productId;
        oi.quantity = quantity;
        return oi;
    }

    public void setOrder(Order order) {
        this.order = order;
    }
}
