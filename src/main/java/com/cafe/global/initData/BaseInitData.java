package com.cafe.global.initData;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.member.member.service.MemberService;
import com.cafe.domain.product.product.service.ProductService;
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

    @Autowired
    private ProductService productService;

    @Bean
    ApplicationRunner initDataRunner() {
        return args -> {
            self.memberInitData();
            self.productInitData(); // 상품 초기 데이터 등록
        };
    }

    @Transactional
    public void memberInitData() {
        if(memberService.count() > 0) return;

        // 관리자 계정
        Member system = memberService.join(
                "elon@init.com", "mars7911", "일론 머스크",
                "경기도 화성시", "12345"
        );
        system.grantAdmin();

        // 일반 사용자 계정
        Member generalUser = memberService.join(
                "gen@init.com", "mars7911", "일반 사용자",
                "경기도 성남시 수정구 태평5동 123-4", "89425"
        );

    }

    /**
     * 상품 초기데이터 등록
     */
    @Transactional
    public void productInitData() {
        if (productService.count() > 0) return;

        productService.register("Colombia Nariño", 5100, "콜롬비아");
        productService.register("Colombia Quindío", 5600, "콜롬비아", 50);
        productService.register("Brazil Serra Do Caparaó", 6300, "브라질", 20);
        productService.register("Ethiopia Yirgacheffe", 6800, "에티오피아", 1);
    }

}
