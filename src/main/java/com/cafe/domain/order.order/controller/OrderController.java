package com.cafe.domain.order.order.controller;

import com.cafe.domain.order.order.dto.OrderCreateRequest;
import com.cafe.domain.order.order.dto.OrderResponse;
import com.cafe.domain.order.order.dto.OrderUpdateRequest;
import com.cafe.domain.order.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/order")
public class OrderController {

    private final OrderService orderService;

    // 이메일/주소/우편번호를 받아 주문 생성
    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderCreateRequest req) {
        return ResponseEntity.ok(orderService.createOrder(req.getEmail(), req.getAddress(), req.getZipcode()));
    }

    // 단건
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    // 다건
    @GetMapping
    public ResponseEntity<List<OrderResponse>> list() {
        return ResponseEntity.ok(orderService.listOrders());
    }

    // 일부/전체 갱신
    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> update(@PathVariable Long id, @RequestBody OrderUpdateRequest req) {
        return ResponseEntity.ok(orderService.updateOrder(id, req));
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}