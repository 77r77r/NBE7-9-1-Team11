package com.cafe.domain.order.order.controller;

import com.cafe.domain.order.order.dto.OrderCreateRequest;
import com.cafe.domain.order.order.dto.OrderResponse;
import com.cafe.domain.order.order.service.OrderService;
import com.cafe.global.rq.Rq;
import com.cafe.global.rsData.RsData;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/${app.api-version}/order")
public class OrderController {

    private final OrderService orderService;
    private final Rq rq;

    @PostMapping
    public RsData<OrderResponse> createOrder(@RequestBody @Valid OrderCreateRequest req) {
        String apiKey = rq.getApiKeyOrNull();

        OrderResponse response = orderService.createOrder(req, apiKey);

        return new RsData<>(
                "201-1",
                "주문이 생성되었습니다.",
                response
        );
    }
}