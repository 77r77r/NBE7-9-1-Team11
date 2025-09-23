package com.cafe.domain.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cafe.domain.member.entity.Member;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByUsername(String username);

    Optional<Member> findByApiKey(String apiKey);
}
