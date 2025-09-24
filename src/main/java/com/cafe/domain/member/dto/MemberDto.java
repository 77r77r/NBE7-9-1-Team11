package com.cafe.domain.member.dto;

import com.cafe.domain.member.entity.Member;
import com.cafe.domain.order.order.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

public record MemberDto(
        Long id,
        String email,
        String name,
        String address,
        String postalCode,
        List<Order> orders,
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
                member.getOrders(),
                member.getCreateDate(),
                member.getModifyDate()
        );
    }
}