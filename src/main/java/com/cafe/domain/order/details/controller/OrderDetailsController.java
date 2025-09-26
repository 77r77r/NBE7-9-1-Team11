package com.cafe.domain.order.details.controller;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.order.details.dto.AllOrderDto;
import com.cafe.domain.order.details.dto.OrderDto;
import com.cafe.domain.order.details.service.OrderDetailsService;
import com.cafe.global.rq.Rq;
import com.cafe.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/${app.api-version}/order")
public class OrderDetailsController {

    private final OrderDetailsService orderDetailsService;
    private final Rq rq;

    public record OrderDetailsResBody(
            List<OrderDto> orderDto
    ) {}

    @GetMapping("/member/details")
    public RsData<OrderDetailsResBody> getOrderDetails() {
        Member actor = rq.getMember();

        List<OrderDto> orders = orderDetailsService.getOrdersByApiKey(actor.getApiKey());

        if (orders.isEmpty()) {
            return new RsData<>(
                    "200-4", //204가 맞는데 204로 하면 스프링이 body 삭제함
                    "주문 내역이 존재하지 않습니다."
            );
        }

        return new RsData<>(
                "200-1",
                "주문 내역 조회 성공",
                new OrderDetailsResBody(orders)
        );
    }

    @GetMapping("/details")
    public RsData<OrderDetailsResBody> getOrderDetailsByEmail(@RequestParam String email) {
        List<OrderDto> orders = orderDetailsService.getOrdersByEmail(email);

        if (orders.isEmpty()) {
            return new RsData<>(
                    "200-5",
                    "해당 이메일의 주문 내역이 존재하지 않습니다."
            );
        }

        return new RsData<>(
                "200-2",
                "주문 내역 조회 성공",
                new OrderDetailsResBody(orders)
        );
    }



    public record AllOrdersResBody(List<AllOrderDto> orders) {}

    @GetMapping("/all")
    public RsData<AllOrdersResBody> getAllOrders() {
        List<AllOrderDto> orders = orderDetailsService.getAllOrders();

        if (orders.isEmpty()) {
            return new RsData<>(
                    "200-6",
                    "등록된 주문이 없습니다."
            );
        }



        return new RsData<>(
                "200-7",
                "모든 주문 조회 성공",
                new AllOrdersResBody(orders)
        );
    }


}