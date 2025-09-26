package com.cafe.domain.product.product.controller;

import com.cafe.domain.product.product.dto.ProductDto;
import com.cafe.domain.product.product.entity.Product;
import com.cafe.domain.product.product.service.ProductService;
import com.cafe.global.rsData.RsData;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ApiV1ProductController {

    private final ProductService productService;

    // 상품 가져오기
    @GetMapping("/product/list")
    @Transactional(readOnly = true)
    @ResponseBody
    public List<ProductDto> getItems() {
        return productService.findAll().stream()
                .map(ProductDto::new)
                .toList();
    }


    record ProductReqBody(
            @NotBlank
            String name,
            String origin,
            int price,
            int stock,
            String imageUrl
    ) {
    }

    record ProductResBody(
            ProductDto productDto
    ) {
    }

    /**
     * 상품 생성
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

        Product product = new Product(reqBody.name, reqBody.price, reqBody.origin, reqBody.stock, reqBody.imageUrl);
        String rslt_cd = "999";
        String rslt_msg = "";

        if (productService.existsByProductName(reqBody.name)) {
            rslt_cd = "409";
            rslt_msg = "동일 상품 존재";
        } else {
            productService.register(product);
            rslt_cd = "201";
            rslt_msg = "등록완료";
        }

        return new RsData<>(
                rslt_cd,
                rslt_msg,
                new ProductResBody(
                        new ProductDto(product)
                )
        );
    }

    /**
     * 상품 삭제
     *
     * @param reqBody
     * @return
     */
    @DeleteMapping("/admin/products")
    @Transactional
    @ResponseBody
    public RsData<ProductResBody> deleteItem(
            @RequestBody @Valid ProductReqBody reqBody
    ) {

        if (productService.existsByProductName(reqBody.name)) {

            Product product = productService.findByProductName(reqBody.name).get();
            productService.deleteProduct(product);

            return new RsData<>(
                    "200",
                    "삭제되었습니다.",
                    new ProductResBody(
                            new ProductDto(product)
                    )
            );

        } else {
            return new RsData<>(
                    "204",
                    "해당 데이터 없음",
                    new ProductResBody(
                            null
                    )
            );
        }
    }
}
