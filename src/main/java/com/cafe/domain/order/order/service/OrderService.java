package com.cafe.domain.order.order.service;

import com.cafe.domain.order.order.dto.OrderCreateRequest;
import com.cafe.domain.order.order.dto.OrderResponse;
import com.cafe.domain.order.order.dto.OrderUpdateRequest;
import com.cafe.domain.order.order.entity.Order;
import com.cafe.domain.order.order.entity.OrderItem;
import com.cafe.domain.order.order.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;


    @Transactional
    public OrderResponse create(OrderCreateRequest req) {
        Order o = new Order();
        o.setEmail(req.getEmail());
        o.setAddress(req.getAddress());
        o.setZipcode(req.getZipcode());
        if (o.getStatus() == null) o.setStatus("PENDING");
        if (o.getTotalPrice() == null) o.setTotalPrice(0L);

        if (req.getItems() != null) {
            req.getItems().forEach(it ->
                    o.addItem(OrderItem.of(it.getProductId(), it.getQuantity()))
            );
        }

        return toResponse(orderRepository.save(o));
    }


    @Transactional
    public OrderResponse getOrder(Long id) {
        return toResponse(find(id));
    }


    @Transactional
    public List<OrderResponse> listOrders() {
        return orderRepository.findAll().stream().map(this::toResponse).toList();
    }


    public OrderResponse updateOrder(Long id, OrderUpdateRequest req) {
        Order o = find(id);

        if (req.getEmail() != null) o.setEmail(req.getEmail());
        if (req.getAddress() != null) o.setAddress(req.getAddress());
        if (req.getZipcode() != null) o.setZipcode(req.getZipcode());
        if (req.getStatus() != null) o.setStatus(req.getStatus());
        if (req.getTotalPrice() != null) o.setTotalPrice(req.getTotalPrice());

        return toResponse(o);
    }


    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) throw new NoSuchElementException("order " + id + " not found");
        orderRepository.deleteById(id);
    }


    private Order find(Long id){
        return orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("order " + id + " not found"));
    }


    private OrderResponse toResponse(Order o){
        return new OrderResponse(
                o.getId(), o.getEmail(), o.getAddress(), o.getZipcode(),
                o.getStatus(), o.getTotalPrice(), o.getCreatedAt(), o.getUpdatedAt()
        );
    }
}