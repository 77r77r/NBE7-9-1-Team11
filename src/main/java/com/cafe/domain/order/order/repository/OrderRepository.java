package com.cafe.domain.order.order.repository;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.order.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByMember(Member member);

    List<Order> findByMemberEmail(String email);

    Optional<Order> findByMemberAndCreatedAtBetween(Member member,
                                                    LocalDateTime start,
                                                    LocalDateTime end);
}
