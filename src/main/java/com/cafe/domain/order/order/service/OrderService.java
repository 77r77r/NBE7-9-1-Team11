package com.cafe.domain.order.order.service;

import com.cafe.domain.order.order.entity.Order;
import com.cafe.domain.order.order.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;

    public Order createOrder(String email, String address, String zipCode) {
        Order order = new Order();
        order.setEmail(email);
        order.setAddress(address);
        order.setZipcode(zipCode);

        return orderRepository.save(order);
    }
}
