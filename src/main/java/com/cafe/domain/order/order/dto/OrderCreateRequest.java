package com.cafe.domain.order.order.dto;

public class OrderCreateRequest {
    private String email;
    private String address;
    private String zipcode;

    public String getEmail() {
        return email;
    }

    public String getAddress() {
        return address;
    }

    public String getZipcode() {
        return zipcode;
    }
}
