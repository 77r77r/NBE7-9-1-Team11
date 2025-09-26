package com.cafe.domain.order.details.service;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.member.member.repository.MemberRepository;
import com.cafe.domain.order.details.dto.AllOrderDto;
import com.cafe.domain.order.details.dto.OrderDto;
import com.cafe.domain.order.order.entity.Order;
import com.cafe.domain.order.order.repository.GuestOrderRepository;
import com.cafe.domain.order.order.repository.OrderRepository;
import com.cafe.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
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

        return orderRepository.findByMember(member).stream()
                .map(order -> new OrderDto(order, calculateStatus(order.getCreatedAt())))
                .toList();
    }

    // 이메일 기반 조회 - 회원, 비회원 구분
    public List<OrderDto> getOrdersByEmail(String email) {
        return memberRepository.findByEmail(email)
                // 회원이면 Order에서 가져오기
                .map(member -> orderRepository.findByMemberEmail(member.getEmail()).stream()
                        .map(order -> new OrderDto(order, calculateStatus(order.getCreatedAt())))
                        .toList()
                )
                // 비회원이면 GuestOrder에서 가져오기
                .orElseGet(() -> guestOrderRepository.findByEmail(email).stream()
                        .map(order -> new OrderDto(order, calculateStatus(order.getCreatedAt())))
                        .toList()
                );
    }

    public String calculateStatus(LocalDateTime orderTime) {
        LocalDateTime now = LocalDateTime.now();

        // 주문 후 3일 경과 → 배송완료
        if (now.isAfter(orderTime.plusDays(3))) {
            return "배송완료";
        }

        // 오늘 14시 이전 주문 + 현재 시각이 14시 이후 → 배송중
        boolean isTodayOrder = orderTime.toLocalDate().equals(LocalDate.now());
        boolean isBefore14 = orderTime.toLocalTime().isBefore(LocalTime.of(14, 0));
        boolean nowAfter14 = now.toLocalTime().isAfter(LocalTime.of(14, 0));

        if (isTodayOrder && isBefore14 && nowAfter14) {
            return "배송중";
        }

        return "배송준비중";
    }

    @Transactional(readOnly = true)
    public List<AllOrderDto> getAllOrders() {
        List<AllOrderDto> all = new ArrayList<>();

        // 회원 주문
        orderRepository.findAll().forEach(order -> {
            String status = calculateStatus(order.getCreatedAt());
            all.add(new AllOrderDto(order, status));
        });

        // 비회원 주문
        guestOrderRepository.findAll().forEach(go -> {
            String status = calculateStatus(go.getCreatedAt());
            all.add(new AllOrderDto(go, status));
        });

        return all;
    }

}