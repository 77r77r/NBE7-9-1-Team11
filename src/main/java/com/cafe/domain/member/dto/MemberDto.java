package com.cafe.domain.member.dto;

import java.time.LocalDateTime;
import com.cafe.domain.member.entity.Member;

public record MemberDto(
        Long id,
        LocalDateTime createDate,
        LocalDateTime modifyDate,
        String name
) {
    public MemberDto(Member member) {
        this(
                member.getId(),
                member.getCreateDate(),
                member.getModifyDate(),
                member.getName()
        );
    }
}