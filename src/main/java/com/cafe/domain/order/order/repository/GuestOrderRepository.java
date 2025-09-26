package com.cafe.domain.order.order.repository;

import com.cafe.domain.order.order.entity.GuestOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuestOrderRepository extends JpaRepository<GuestOrder, Long> {
    List<GuestOrder> findByEmail(String email);
}
