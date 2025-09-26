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
import java.time.LocalTime;
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
        LocalDateTime now = LocalDateTime.now();

        // 전날 14:00 ~ 오늘 14:00 or 오늘 14:00 ~ 다음날 14:00
        LocalDateTime start = now.toLocalTime().isBefore(LocalTime.of(14, 0))
                ? now.toLocalDate().minusDays(1).atTime(14, 0)
                : now.toLocalDate().atTime(14, 0);

        LocalDateTime end = start.plusDays(1);

        if (apiKey != null && !apiKey.isBlank()) {
            // 로그인 상태 - 회원 주문
            Member member = memberRepository.findByApiKey(apiKey)
                    .orElseThrow(() -> new ServiceException("401-1", "유효하지 않은 API Key입니다."));

            if (!member.getEmail().equals(req.email())) {
                throw new ServiceException("403-1", "요청한 이메일과 로그인된 회원의 이메일이 일치하지 않습니다.");
            }

            // 기존 주문 있으면 병합, 없으면 새 주문
            return orderRepository.findByMemberAndCreatedAtBetween(member, start, end)
                    .map(order -> mergeMemberOrder(order, req, now))
                    .orElseGet(() -> {
                        Order newOrder = buildMemberOrder(member, req, now);
                        return orderRepository.save(newOrder)
                                .toDto(req.email(), req.address(), req.postalCode());
                    });

        } else {
            // 로그아웃 상태 - 회원 이메일인지 확인
            return memberRepository.findByEmail(req.email())
                    .map(member -> orderRepository.findByMemberAndCreatedAtBetween(member, start, end)
                            .map(order -> mergeMemberOrder(order, req, now))
                            .orElseGet(() -> {
                                Order newOrder = buildMemberOrder(member, req, now);
                                return orderRepository.save(newOrder)
                                        .toDto(req.email(), req.address(), req.postalCode());
                            })
                    )
                    .orElseGet(() -> guestOrderRepository.findByEmailAndCreatedAtBetween(req.email(), start, end)
                            .map(order -> mergeGuestOrder(order, req, now))
                            .orElseGet(() -> {
                                GuestOrder newOrder = buildGuestOrder(req, now);
                                return guestOrderRepository.save(newOrder).toDto();
                            })
                    );
        }
    }

    // 회원 주문 생성
    private Order buildMemberOrder(Member member, OrderCreateRequest req, LocalDateTime now) {
        Order order = new Order();
        order.setStatus("배송준비중");
        order.setCreatedAt(now);
        order.setMember(member);

        req.items().forEach(it -> {
            Product product = productRepository.findById(it.productId())
                    .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다: " + it.productId()));
            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(it.quantity());
            order.addItem(item);
        });

        return order;
    }

    // 비회원 주문 생성
    private GuestOrder buildGuestOrder(OrderCreateRequest req, LocalDateTime now) {
        GuestOrder guestOrder = new GuestOrder();
        guestOrder.setStatus("배송준비중");
        guestOrder.setCreatedAt(now);
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

        return guestOrder;
    }

    // 회원 주문 병합
    private OrderResponse mergeMemberOrder(Order order, OrderCreateRequest req, LocalDateTime now) {
        order.setCreatedAt(now);
        req.items().forEach(it -> {
            Product product = productRepository.findById(it.productId())
                    .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다: " + it.productId()));

            // 같은 상품이 있으면 수량만 증가
            order.getOrderItems().stream()
                    .filter(oi -> oi.getProduct().getId().equals(product.getId()))
                    .findFirst()
                    .ifPresentOrElse(
                            oi -> oi.setQuantity(oi.getQuantity() + it.quantity()),
                            () -> {
                                OrderItem newItem = new OrderItem();
                                newItem.setProduct(product);
                                newItem.setQuantity(it.quantity());
                                order.addItem(newItem);
                            }
                    );
        });

        return orderRepository.save(order)
                .toDto(req.email(), req.address(), req.postalCode());
    }

    // 비회원 주문 병합
    private OrderResponse mergeGuestOrder(GuestOrder order, OrderCreateRequest req, LocalDateTime now) {
        order.setCreatedAt(now);
        req.items().forEach(it -> {
            Product product = productRepository.findById(it.productId())
                    .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다: " + it.productId()));

            // 같은 상품이 있으면 수량만 증가
            order.getItems().stream()
                    .filter(gi -> gi.getProduct().getId().equals(product.getId()))
                    .findFirst()
                    .ifPresentOrElse(
                            gi -> gi.setQuantity(gi.getQuantity() + it.quantity()),
                            () -> {
                                GuestOrderItem newItem = new GuestOrderItem();
                                newItem.setProduct(product);
                                newItem.setQuantity(it.quantity());
                                order.addItem(newItem);
                            }
                    );
        });

        return guestOrderRepository.save(order).toDto();
    }
}