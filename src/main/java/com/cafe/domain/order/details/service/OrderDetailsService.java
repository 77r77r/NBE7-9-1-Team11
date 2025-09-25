package com.cafe.domain.order.details.service;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.member.member.repository.MemberRepository;
import com.cafe.domain.order.details.dto.OrderDto;
import com.cafe.domain.order.order.entity.Order;
import com.cafe.domain.order.order.repository.GuestOrderRepository;
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
    private final GuestOrderRepository guestOrderRepository;

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

    // 이메일 기반 조회 - 회원, 비회원 구분
    public List<OrderDto> getOrdersByEmail(String email) {
        return memberRepository.findByEmail(email)
                // 회원이면 Order에서 가져오기
                .map(member -> orderRepository.findByMemberEmail(member.getEmail())
                        .stream()
                        .map(OrderDto::new)
                        .toList()
                )
                // 비회원이면 GuestOrder에서 가져오기
                .orElseGet(() -> guestOrderRepository.findByEmail(email)
                        .stream()
                        .map(OrderDto::new)
                        .toList()
                );
    }
}