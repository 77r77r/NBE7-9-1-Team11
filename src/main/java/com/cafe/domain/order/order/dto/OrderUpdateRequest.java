package com.cafe.domain.order.order.dto;

public class OrderUpdateRequest {
    private String email;
    private String address;
    private String zipcode;
    private String status;
    private Long totalPrice;

    public String getEmail() {
        return email;
    }

    public String getAddress() {
        return address;
    }

    public String getZipcode() {
        return zipcode;
    }

    public String getStatus() {
        return status;
    }

    public Long getTotalPrice() {
        return totalPrice;
    }
}
