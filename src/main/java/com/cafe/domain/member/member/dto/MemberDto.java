package com.cafe.domain.member.member.dto;

import com.cafe.domain.member.member.entity.Member;
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
        String authority,
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
                member.getAuthority(),
                member.getCreateDate(),
                member.getModifyDate()
        );
    }
}