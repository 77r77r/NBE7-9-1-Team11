package com.cafe.domain.member.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

@NoArgsConstructor
@Getter
@Entity
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @CreatedDate
    private LocalDateTime createDate;
    @LastModifiedDate
    private LocalDateTime modifyDate;

    @Column(unique = true)
    private String email;
    private String password;
    private String nickname;
    private String address;
    private String postalCode;
    private String authority;
    @Column(unique = true)
    private String apiKey;
    // Member - Order (1:N) 양방향 매핑
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    public Member(String email, String password, String nickname, String address, String postalCode) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.address = address;
        this.postalCode = postalCode;
        this.authority = "USER";
        this.apiKey = UUID.randomUUID().toString();
    }

    public String getName() {
        return nickname;
    }

    public void grantAdmin() {
        this.authority = "ADMIN";
    }

    // 주문내역 추가, 주문 발생 시 member.addOrder(order)로 호출
    public void addOrder(Order order) {
        orders.add(order);
        order.setMember(this);
    }
}