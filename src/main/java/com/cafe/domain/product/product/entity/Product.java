package com.cafe.domain.product.product.entity;

import com.cafe.global.jpa.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {

    @Column(unique = true)
    private String productName;    // 상품명
    private int productPrice;  // 가격
    private String productOrigin; // 원산지
    private int productStock; // 재고
    private String imageUrl; // 이미지 URL


    @Override
    public String toString() {
        return "{상품명: " + this.productName + ", 가격: " + this.productPrice + "}";
    }

}
