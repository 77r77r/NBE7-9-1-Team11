package com.cafe.domain.member.member.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.order.order.entity.Orders;

public record MemberDto(
        Long id,
        String email,
        String name,
        String address,
        String postalCode,
        List<Orders> orders,
        LocalDateTime createDate,
        LocalDateTime modifyDate

) {
    public MemberDto(Member member) {
        this(
                member.getId(),
                member.getEmail(),
                member.getName(),
                member.getAddress(),
                member.getPostalCode(),
                member.getOrdersList(),
                member.getCreateDate(),
                member.getModifyDate()
        );
    }
}