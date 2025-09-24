package com.cafe.domain.product.product.entity;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Product extends com.cafe.global.jpa.entity.BaseEntity {

    private String productName;    // 상품명
    private int productPrice;  // 가격
    private String productOrigin; // 원산지
    private int productStock; // 재고


    @Override
    public String toString() {
        return "{상품명: " + this.productName + ", 가격: " + this.productPrice + "}";
    }

}
