package com.cafe.domain.member.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cafe.domain.member.member.entity.Member;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);

    Optional<Member> findByApiKey(String apiKey);
}
