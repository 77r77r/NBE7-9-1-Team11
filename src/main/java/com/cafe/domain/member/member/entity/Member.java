package com.cafe.domain.member.member.entity;

import com.cafe.domain.order.order.entity.Orders;
import com.cafe.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@NoArgsConstructor
@Getter
@Entity
public class Member extends BaseEntity {

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
    private List<Orders> ordersList = new ArrayList<>();

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
    public void addOrder(Orders order) {
        ordersList.add(order);
        order.setMember(this);
    }

    public void modifyPassword(String password) { this.password = password; }

    public void modifyNickname(String nickname) { this.nickname = nickname; }

    public void modifyAddress(String address) { this.address = address; }

    public void modifyPostalCode(String postalCode) { this.postalCode = postalCode; }
}