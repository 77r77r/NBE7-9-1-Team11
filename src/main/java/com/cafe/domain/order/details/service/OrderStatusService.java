package com.cafe.domain.order.details.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class OrderStatusService {
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
}
