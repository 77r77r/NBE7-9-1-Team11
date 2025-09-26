package com.cafe.global.initData;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.member.member.repository.MemberRepository;
import com.cafe.domain.member.member.service.MemberService;
import com.cafe.domain.order.order.dto.OrderCreateRequest;
import com.cafe.domain.order.order.repository.OrderRepository;
import com.cafe.domain.order.order.service.OrderService;
import com.cafe.domain.product.product.entity.Product;
import com.cafe.domain.product.product.repository.ProductRepository;
import com.cafe.domain.product.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

    @Autowired
    @Lazy
    private BaseInitData self;

    private final MemberService memberService;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final OrderService orderService;


    @Bean
    ApplicationRunner initDataRunner() {
        return args -> {
            self.memberInitData();  // 회원 초기 데이터 등록
            self.productInitData(); // 상품 초기 데이터 등록
            self.orderInitData();
        };
    }

    /**
     * 회원 초기 데이터 등록
     */
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


    @Transactional
    public void productInitData() {
        if (productService.count() > 0) return;

        productService.register("Colombia Nariño", 5100, "콜롬비아", 20, "https://www.coffeebeankorea.com//data/productImages/b/3/11110074.jpg");
        productService.register("Colombia Quindío", 5600, "콜롬비아", 70, "https://i.imgur.com/HKOFQYa.jpeg");
        productService.register("Brazil Serra Do Caparaó", 6300, "브라질", 20, "https://coffeehome.co.kr/web/product/big/202105/ec00ed618f115d512a46eba83e8fedb7.jpg");
        productService.register("Ethiopia Yirgacheffe", 6800, "에티오피아", 40, "https://oasisprodproduct.edge.naverncp.com/5737/detail/detail_5737_0_27ef8aaf-c7b8-47b8-94c8-16a78651d0f5.jpg");
    }

    @Transactional
    public void orderInitData() {
        if (orderRepository.count() > 0) return;

        List<Product> products = productRepository.findAll();
        Product product1 = products.get(0);
        Product product2 = products.get(1);
        Member member = memberRepository.findByEmail("gen@init.com")
                .orElseThrow(() -> new IllegalStateException("회원이 존재하지 않습니다."));

        // 회원 주문
        OrderCreateRequest memberOrderRequest = new OrderCreateRequest(
                "gen@init.com",
                "경기도 성남시",
                "89425",
                List.of(
                        new OrderCreateRequest.Item(product1.getId(), 2),
                        new OrderCreateRequest.Item(product2.getId(), 1)
                )
        );
        orderService.createOrder(memberOrderRequest, member.getApiKey());


        // 배송 상태 테스트용 주문 데이터 (회원)
        // 배송중: 오늘 13시 주문
        OrderCreateRequest before2PMOrder = new OrderCreateRequest(
                "gen@init.com",
                "경기도 성남시",
                "89425",
                List.of(new OrderCreateRequest.Item(product1.getId(), 2))
        );
        orderService.createOrder(before2PMOrder, member.getApiKey(),
                LocalDateTime.now().withHour(13).withMinute(0));

        // 배송준비중: 오늘 15시 주문
        OrderCreateRequest after2PMOrder = new OrderCreateRequest(
                "gen@init.com",
                "경기도 성남시",
                "89425",
                List.of(new OrderCreateRequest.Item(product2.getId(), 3))
        );
        orderService.createOrder(after2PMOrder, member.getApiKey(),
                LocalDateTime.now().withHour(15).withMinute(0));

        // 배송완료: 3일 전 주문
        OrderCreateRequest oldOrderReq = new OrderCreateRequest(
                "gen@init.com",
                "경기도 성남시",
                "89425",
                List.of(
                        new OrderCreateRequest.Item(product1.getId(), 1)
                )
        );
        orderService.createOrder(
                oldOrderReq,
                member.getApiKey(),
                LocalDateTime.now().minusDays(3).withHour(15).withMinute(0)
        );




        // 비회원 주문
        OrderCreateRequest guestOrderRequest = new OrderCreateRequest(
                "guest@init.com",
                "서울시 강남구",
                "12345",
                List.of(
                        new OrderCreateRequest.Item(product2.getId(), 3)
                )
        );
        orderService.createOrder(guestOrderRequest, null); // apiKey 없이 → 비회원 주문

        // 비회원 배송 상태 테스트
        // 배송중: 오늘 13시 주문
        OrderCreateRequest guestBefore2PM = new OrderCreateRequest(
                "guest@init.com",
                "서울시 강남구",
                "12345",
                List.of(new OrderCreateRequest.Item(product1.getId(), 1))
        );
        orderService.createOrder(guestBefore2PM, null,
                LocalDateTime.now().withHour(13).withMinute(0));

        // 배송준비중: 오늘 15시 주문
        OrderCreateRequest guestAfter2PM = new OrderCreateRequest(
                "guest@init.com",
                "서울시 강남구",
                "12345",
                List.of(new OrderCreateRequest.Item(product2.getId(), 2))
        );
        orderService.createOrder(guestAfter2PM, null,
                LocalDateTime.now().withHour(15).withMinute(0));

        // 배송완료: 3일 전 주문
        OrderCreateRequest guestOldOrderReq = new OrderCreateRequest(
                "guest@init.com",
                "서울시 강남구",
                "12345",
                List.of(new OrderCreateRequest.Item(product1.getId(), 1))
        );
        orderService.createOrder(
                guestOldOrderReq,
                null, // 비회원은 apiKey 없음
                LocalDateTime.now().minusDays(3).withHour(15).withMinute(0)
        );
    }

}

