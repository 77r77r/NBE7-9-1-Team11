package com.cafe.domain.product.product.controller;

import com.cafe.domain.product.product.dto.ProductDto;
import com.cafe.domain.product.product.dto.ProductResBody;
import com.cafe.domain.product.product.service.ProductService;
import com.cafe.global.rsData.RsData;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ApiV1ProductController {

    private final ProductService productService;
    private final StringHttpMessageConverter stringHttpMessageConverter;

    // 상품 가져오기
    @GetMapping("/product/list")
    @Transactional(readOnly = true)
    @ResponseBody
    public List<ProductDto> getItems() {
        return productService.findAll().stream()
                .map(ProductDto::new)
                .toList();
    }

    /**
     * 상품 단건 조회
     *
     * @param id
     * @return
     */
    @GetMapping("/admin/products/{id}")
    @Transactional(readOnly = true)
    @ResponseBody
    public RsData<ProductResBody> getItem(
            @PathVariable Long id
    ) {

        return productService.findById(id)
                .map(product -> new RsData<>(
                        String.valueOf(HttpStatus.OK.value()),
                        "조회되었습니다.",
                        new ProductResBody(
                                new ProductDto(product)
                        )
                ))
                .orElseGet(() -> new RsData<>(
                        String.valueOf(HttpStatus.NOT_FOUND.value()),
                        "존재하지 않는 상품입니다."
                ));
    }


    /**
     * 상품 생성 요청 바디
     *
     * @param name     상품명
     * @param origin   원산지
     * @param price    가격
     * @param stock    재고
     * @param imageUrl 이미지 URL
     */
    record ProductReqBody(
            @NotBlank
            String name,
            String origin,
            int price,
            int stock,
            String imageUrl
    ) {
    }

    /**
     * 상품 생성
     *
     * @param reqBody
     * @return
     */
    @PostMapping("/admin/products")
    @Transactional
    @ResponseBody
    @ResponseStatus(HttpStatus.CREATED)
    public RsData<ProductResBody> createItem(
            @RequestBody @Valid ProductReqBody reqBody
    ) {

        // 상품 등록 여부 확인
        if (productService.existsByProductName(reqBody.name)) {
            return new RsData<>(
                    "409",
                    "동일 상품 존재",
                    new ProductResBody(
                            new ProductDto(productService.findByProductName(reqBody.name).get())
                    )
            );
        }

        return new RsData<>(
                "201",
                "등록완료",
                new ProductResBody(
                        new ProductDto(productService.register(reqBody.name, reqBody.price, reqBody.origin, reqBody.stock, reqBody.imageUrl))
                )
        );
    }


    /**
     * 상품 삭제
     *
     * @param id
     * @return
     */
    @DeleteMapping("/admin/products/{id}")
    @Transactional
    @ResponseBody
    public RsData<ProductResBody> deleteItem(
            @PathVariable Long id
    ) {

        return productService.findById(id)
                .map(product -> {
                    productService.delete(product);
                    return new RsData<>(
                            String.valueOf(HttpStatus.OK.value()),
                            "삭제되었습니다.",
                            new ProductResBody(
                                    new ProductDto(product)
                            )
                    );
                })
                .orElseGet(() -> new RsData<>(
                        String.valueOf(HttpStatus.NOT_FOUND.value()),
                        "이미 삭제된 항목 입니다."
                ));
    }


    record ProductModifyReqBody(
            String name,
            String origin,
            int price,
            int stock,
            String imageUrl
    ) {
    }

    @PutMapping("/admin/products/{id}")
    @Transactional
    @ResponseBody
    public RsData<ProductResBody> modifyItem(
            @PathVariable Long id,
            @RequestBody ProductReqBody reqBody
    ) {

        productService.findById(id).ifPresentOrElse(
                product -> {
                    productService.moidfy(
                            product,
                            reqBody.name,
                            reqBody.price,
                            reqBody.origin,
                            reqBody.stock,
                            reqBody.imageUrl
                    );
                },
                () -> {

                }
        );

        return new RsData<>(
                String.valueOf(HttpStatus.OK.value()),
                "수정었습니다."
        );
    }

}
