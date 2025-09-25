package com.cafe.global.initData;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.member.member.repository.MemberRepository;
import com.cafe.domain.member.member.service.MemberService;
import com.cafe.domain.order.order.entity.Order;
import com.cafe.domain.order.order.entity.OrderItem;
import com.cafe.domain.order.order.repository.OrderRepository;
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

    private static final String SYSTEM_EMAIL = "elon@musk.com";

    @Autowired
    private ProductService productService;

    @Bean
    ApplicationRunner initDataRunner() {
        return args -> {
            self.work1();
            self.productInitData(); // 상품 초기 데이터 등록
            self.orderInitData();
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


    @Transactional
    public void productInitData() {
        if (productService.count() > 0) return;

        productService.register("Colombia Nariño", 5100, "콜롬비아");
        productService.register("Colombia Quindío", 5600, "콜롬비아", 50);
        productService.register("Brazil Serra Do Caparaó", 6300, "브라질", 20);
        productService.register("Ethiopia Yirgacheffe", 6800, "에티오피아", 1);
    }

    @Transactional
    public void orderInitData() {
        if (orderRepository.count() > 0) return;

        Member member = memberRepository.findByEmail("elon@musk.com").get();
        List<Product> products = productRepository.findAll();

        Product product1 = products.get(0);
        Product product2 = products.get(1);

        Order order = new Order();
        order.setAddress(member.getAddress());
        order.setMember(member);
        order.setStatus("배송준비중");
        order.setCreatedAt(LocalDateTime.now());

        OrderItem item1 = new OrderItem();
        item1.setOrder(order);
        item1.setProduct(product1);
        item1.setQuantity(2);

        OrderItem item2 = new OrderItem();
        item2.setOrder(order);
        item2.setProduct(product2);
        item2.setQuantity(1);

        order.setOrderItems(List.of(item1, item2));



        orderRepository.save(order);
        }
}
