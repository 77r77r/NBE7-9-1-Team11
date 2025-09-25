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

    @Autowired
    private ProductService productService;

    private final MemberService memberService;
    private static final String SYSTEM_EMAIL = "elon@musk.com";

    @Bean
    ApplicationRunner initDataRunner() {
        return args -> {
            self.memberInitData();  // 회원 초기 데이터 등록
            self.productInitData(); // 상품 초기 데이터 등록
        };
    }

    /**
     * 회원 초기 데이터 등록
     */
    @Transactional
    public void memberInitData() {
        if(memberService.findByEmail(SYSTEM_EMAIL).isPresent()) {
            return;
        }

        Member system = memberService.join(
                "elon@musk.com", "mars7911", "일론 머스크",
                "경기도 화성시", "12345"
        );
        system.grantAdmin();
    }

    /**
     * 상품 초기데이터 등록
     */
    @Transactional
    public void productInitData() {
        if (productService.count() > 0) return;

        productService.register("Colombia Nariño", 5100, "콜롬비아", 20, "https://www.coffeebeankorea.com//data/productImages/b/3/11110074.jpg");
        productService.register("Colombia Quindío", 5600, "콜롬비아", 70, "https://i.imgur.com/HKOFQYa.jpeg");
        productService.register("Brazil Serra Do Caparaó", 6300, "브라질", 20, "https://coffeehome.co.kr/web/product/big/202105/ec00ed618f115d512a46eba83e8fedb7.jpg");
        productService.register("Ethiopia Yirgacheffe", 6800, "에티오피아", 40, "https://oasisprodproduct.edge.naverncp.com/5737/detail/detail_5737_0_27ef8aaf-c7b8-47b8-94c8-16a78651d0f5.jpg");
    }

}