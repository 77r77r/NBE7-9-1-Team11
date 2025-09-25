package com.cafe.domain.order.details.service;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.member.member.repository.MemberRepository;
import com.cafe.domain.order.details.dto.OrderDto;
import com.cafe.domain.order.order.entity.Order;
import com.cafe.domain.order.order.repository.OrderRepository;
import com.cafe.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderDetailsService {

    private final MemberRepository memberRepository;
    private final OrderRepository orderRepository;

    public List<OrderDto> getOrdersByApiKey(String apiKey) {
        Member member = memberRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new ServiceException("401-1", "유효하지 않은 API Key입니다."));

        List<Order> orders = orderRepository.findByMember(member);

        if (orders.isEmpty()) {
            return List.of();
        }

        return orders.stream()
                .map(OrderDto::new)
                .toList();
    }

    public List<OrderDto> getOrdersByEmail(String email) {
        return memberRepository.findByEmail(email)
                .map(member -> orderRepository.findByMember(member))
                .orElseGet(() -> orderRepository.findByEmail(email))
                .stream()
                .map(OrderDto::new)
                .toList();
    }
}