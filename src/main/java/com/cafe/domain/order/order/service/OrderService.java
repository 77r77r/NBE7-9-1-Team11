package com.cafe.domain.order.order.service;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.member.member.repository.MemberRepository;
import com.cafe.domain.order.order.dto.OrderCreateRequest;
import com.cafe.domain.order.order.dto.OrderResponse;
import com.cafe.domain.order.order.entity.GuestOrder;
import com.cafe.domain.order.order.entity.GuestOrderItem;
import com.cafe.domain.order.order.entity.Order;
import com.cafe.domain.order.order.entity.OrderItem;
import com.cafe.domain.order.order.repository.GuestOrderRepository;
import com.cafe.domain.order.order.repository.OrderRepository;
import com.cafe.domain.product.product.entity.Product;
import com.cafe.domain.product.product.repository.ProductRepository;
import com.cafe.global.exception.ServiceException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final GuestOrderRepository guestOrderRepository;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;

    public OrderResponse createOrder(OrderCreateRequest req, String apiKey) {
        if (apiKey != null && !apiKey.isBlank()) {
            // 회원 주문
            Member member = memberRepository.findByApiKey(apiKey)
                    .orElseThrow(() -> new ServiceException("401-1", "유효하지 않은 API Key입니다."));

            if (!member.getEmail().equals(req.email())) {
                throw new ServiceException("403-1", "요청한 이메일과 로그인된 회원의 이메일이 일치하지 않습니다.");
            }

            Order order = new Order();
            order.setStatus("배송준비중");
            order.setCreatedAt(LocalDateTime.now());
            order.setMember(member);

            req.items().forEach(it -> {
                Product product = productRepository.findById(it.productId())
                        .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다: " + it.productId()));
                OrderItem item = new OrderItem();
                item.setProduct(product);
                item.setQuantity(it.quantity());
                order.addItem(item);
            });

            Order saved = orderRepository.save(order);

            return toResponse(saved, req.email(), req.address(), req.postalCode());
        } else {
            // 비회원 주문
            GuestOrder guestOrder = new GuestOrder();
            guestOrder.setStatus("배송준비중");
            guestOrder.setCreatedAt(LocalDateTime.now());
            guestOrder.setEmail(req.email());
            guestOrder.setAddress(req.address());
            guestOrder.setPostalCode(req.postalCode());

            req.items().forEach(it -> {
                Product product = productRepository.findById(it.productId())
                        .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다: " + it.productId()));
                GuestOrderItem item = new GuestOrderItem();
                item.setProduct(product);
                item.setQuantity(it.quantity());
                guestOrder.addItem(item);
            });

            GuestOrder saved = guestOrderRepository.save(guestOrder);

            return toResponse(saved);
        }
    }

    private OrderResponse toResponse(Order order, String email, String address, String postalCode) {
        return new OrderResponse(
                order.getId(),
                email,
                address,
                postalCode,
                order.getStatus(),
                order.getCreatedAt(),
                order.getOrderItems().stream().map(oi ->
                        new OrderResponse.OrderItemResponse(
                                oi.getProduct().getId(),
                                oi.getProduct().getProductName(),
                                oi.getProduct().getProductPrice(),
                                oi.getQuantity()
                        )
                ).toList()
        );
    }

    private OrderResponse toResponse(GuestOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getEmail(),
                order.getAddress(),
                order.getPostalCode(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getItems().stream().map(oi ->
                        new OrderResponse.OrderItemResponse(
                                oi.getProduct().getId(),
                                oi.getProduct().getProductName(),
                                oi.getProduct().getProductPrice(),
                                oi.getQuantity()
                        )
                ).toList()
        );
    }
}

//@Transactional
//public OrderResponse getOrder(Long id) {
//    return toResponse(find(id));
//}
//
//
//@Transactional
//public List<OrderResponse> listOrders() {
//    return orderRepository.findAll().stream().map(this::toResponse).toList();
//}
//
//
//public OrderResponse updateOrder(Long id, OrderUpdateRequest req) {
//    Order o = find(id);
//
//    if (req.getEmail() != null) o.setEmail(req.getEmail());
//    if (req.getAddress() != null) o.setAddress(req.getAddress());
//    if (req.getZipcode() != null) o.setZipcode(req.getZipcode());
//    if (req.getStatus() != null) o.setStatus(req.getStatus());
//    if (req.getTotalPrice() != null) o.setTotalPrice(req.getTotalPrice());
//
//    return toResponse(o);
//}
//
//
//public void deleteOrder(Long id) {
//    if (!orderRepository.existsById(id)) throw new NoSuchElementException("order " + id + " not found");
//    orderRepository.deleteById(id);
//}
//
//
//private Order find(Long id){
//    return orderRepository.findById(id)
//            .orElseThrow(() -> new NoSuchElementException("order " + id + " not found"));
//}