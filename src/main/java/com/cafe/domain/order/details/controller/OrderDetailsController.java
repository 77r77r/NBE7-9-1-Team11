package com.cafe.domain.order.details.controller;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.order.details.dto.OrderDto;
import com.cafe.domain.order.details.service.OrderDetailsService;
import com.cafe.global.rq.Rq;
import com.cafe.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/${app.api-version}/order")
public class OrderDetailsController {

    private final OrderDetailsService orderDetailsService;
    private final Rq rq;

    @GetMapping("/details")
    public RsData<?> getOrderDetails() {
        Member actor = rq.getMember();

        List<OrderDto> orders = orderDetailsService.getOrdersByApiKey(actor.getApiKey());

        if (orders.isEmpty()) {
            return new RsData<>(
                    "204-1",
                    "주문 내역이 존재하지 않습니다."
            );
        }

        return new RsData<>(
                "200-1",
                "주문 내역 조회 성공",
                orders
        );
    }


}