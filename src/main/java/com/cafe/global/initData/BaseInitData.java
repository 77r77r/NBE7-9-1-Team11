package com.cafe.global.initData;

import com.cafe.domain.member.entity.Member;
import com.cafe.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

    @Autowired
    @Lazy
    private BaseInitData self;
    private final MemberService memberService;
    private static final String SYSTEM_EMAIL = "elon@musk.com";

    @Bean
    ApplicationRunner initDataRunner() {
        return args -> {
            self.work1();
        };
    }

    @Transactional
    public void work1() {
        if(memberService.findByEmail(SYSTEM_EMAIL).isPresent()) {
            return;
        }

        Member system = memberService.join(
                "elon@musk.com", "mars7911", "일론 머스크",
                "경기도 화성시", "12345"
        );
        system.grantAdmin();
    }

}
