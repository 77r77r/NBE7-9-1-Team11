package com.cafe.domain.order.order.entity;

import com.cafe.domain.product.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class GuestOrderItem {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private GuestOrder guestOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Product product;

    private int quantity;

    public static GuestOrderItem of(Product product, int quantity) {
        GuestOrderItem item = new GuestOrderItem();
        item.product = product;
        item.quantity = quantity;
        return item;
    }

    void setGuestOrder(GuestOrder guestOrder) {
        this.guestOrder = guestOrder;
    }
}
