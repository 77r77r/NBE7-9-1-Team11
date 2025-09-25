package com.cafe.domain.order.order.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class OrderCreateRequest {
    @Email @NotBlank
    private String email;
    @NotBlank
    private String address;
    @NotBlank
    private String zipcode;

    @NotNull
    private List<Item> items; // 상품 + 수량

    public static class Item {
        @NotNull
        private Long productId;
        @Min(0)
        private int quantity;


        public Long getProductId() {
            return productId;
        }

        public int getQuantity() {
            return quantity;
        }
    }


    public String getEmail() {
        return email;
    }
    public String getAddress() {
        return address;
    }
    public String getZipcode() {
        return zipcode;
    }
    public List<Item> getItems() {
        return items;
    }

}