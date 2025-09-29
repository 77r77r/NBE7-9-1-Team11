package com.cafe.domain.product.product.controller;

import com.cafe.domain.product.product.dto.ProductDto;
import com.cafe.domain.product.product.dto.ProductResBody;
import com.cafe.domain.product.product.entity.Product;
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

    // 상품 목록 가져오기 - 사용자
    @GetMapping("/product/list")
    @Transactional(readOnly = true)
    @ResponseBody
    public List<ProductDto> getItems() {
        return productService.findAll().stream()
                .filter(Product::isUseYn)
                .map(ProductDto::new)
                .toList();
    }

    // 상품 목록 가져오기 - 관리자
    @GetMapping("/admin/product")
    @Transactional(readOnly = true)
    @ResponseBody
    public List<ProductDto> getItemsAdmin() {
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
    @GetMapping("/admin/product/{id}")
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
    @PostMapping("/admin/product")
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
     * 상품 삭제(비활성화)
     *
     * @param id
     * @return
     */
    @DeleteMapping("/admin/product/{id}")
    @Transactional
    @ResponseBody
    public RsData<ProductResBody> deleteItem(
            @PathVariable Long id
    ) {

        return productService.findById(id)
                .map(product -> {
                    productService.change(product);
                    if (!product.isUseYn()) {
                        return new RsData<>(
                                String.valueOf(HttpStatus.OK.value()),
                                "비활성화 되었습니다.",
                                new ProductResBody(
                                        new ProductDto(product)
                                )
                        );
                    }
                    else {
                        return new RsData<>(
                                String.valueOf(HttpStatus.OK.value()),
                                "활성화 되었습니다.",
                                new ProductResBody(
                                        new ProductDto(product)
                                )
                        );
                    }
                })
                .orElseGet(() -> new RsData<>(
                        String.valueOf(HttpStatus.NOT_FOUND.value()),
                        "존재하지 않는 상품입니다."
                ));
    }

    /**
     * 상품 수정
     *
     * @param id
     * @param reqBody
     * @return
     */
    @PutMapping("/admin/product/{id}")
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
                    throw new RuntimeException("존재하지 않는 상품입니다.");
                }
        );

        return new RsData<>(
                String.valueOf(HttpStatus.OK.value()),
                "수정되었습니다.",
                new ProductResBody(
                        new ProductDto(productService.findById(id).get())
                )
        );
    }

}
