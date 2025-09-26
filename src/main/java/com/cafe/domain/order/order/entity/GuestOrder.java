package com.cafe.domain.order.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class GuestOrder {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String address;

    @Column(length = 5, nullable = false)
    private String postalCode;

    private String status;

    @CreatedDate
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "guestOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GuestOrderItem> items = new ArrayList<>();

    public void addItem(GuestOrderItem item) {
        item.setGuestOrder(this);
        items.add(item);
    }
}
