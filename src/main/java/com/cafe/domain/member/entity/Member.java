package com.cafe.domain.member.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
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
    @Column(unique = true)
    private String apiKey;

    public Member(String email, String password, String nickname, String address, String postalCode) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.address = address;
        this.postalCode = postalCode;
        this.apiKey = UUID.randomUUID().toString();
    }

    public String getName() {
        return nickname;
    }

    public void updateApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

}