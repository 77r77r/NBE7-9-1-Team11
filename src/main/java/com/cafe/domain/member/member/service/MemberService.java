package com.cafe.domain.member.member.service;

import com.cafe.domain.member.member.repository.MemberRepository;
import com.cafe.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import com.cafe.domain.member.member.entity.Member;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    public long count() {
        return memberRepository.count();
    }

    public Member join(String email, String password, String nickname, String address, String postalCode) {

        memberRepository.findByEmail(email)
                .ifPresent(m -> {
                    throw new ServiceException("409-1", "이미 가입된 이메일입니다.");
                });

        Member member = new Member(email, password, nickname, address, postalCode);
        return memberRepository.save(member);
    }

    public Optional<Member> findByEmail(String email) {
        return memberRepository.findByEmail(email);
    }

    public Optional<Member> findByApiKey(String apiKey) {
        return memberRepository.findByApiKey(apiKey);
    }

    public void ModifyMemberInfo(
            Member member, String password, String nickname,
            String address, String postalCode
    ) {
        // 수정할 필드만 업데이트
        if (password != null) {
            member.modifyPassword(password);
        }

        if (nickname != null) {
            member.modifyNickname(nickname);
        }

        if (address != null) {
            member.modifyAddress(address);
        }

        if (postalCode != null) {
            member.modifyPostalCode(postalCode);
        }

    }
}