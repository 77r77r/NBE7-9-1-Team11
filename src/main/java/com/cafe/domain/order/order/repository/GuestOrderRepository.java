package com.cafe.domain.order.order.repository;

import com.cafe.domain.order.order.entity.GuestOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GuestOrderRepository extends JpaRepository<GuestOrder, Long> {

    List<GuestOrder> findByEmail(String email);

    Optional<GuestOrder> findByEmailAndCreatedAtBetween(String email,
                                                        LocalDateTime start,
                                                        LocalDateTime end);
}
