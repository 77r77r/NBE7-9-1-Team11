package com.cafe.domain.product.product.controller;

import com.cafe.domain.product.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class ApiV1ProductControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ProductRepository productRepository;


    @Test
    @DisplayName("상품목록가져오기")
    void t1() throws Exception {
        ResultActions resultActions = mvc
                .perform(
                        get("/api/v1/product/list")
                )
                .andDo(print());


        resultActions
                .andExpect(handler().handlerType(ApiV1ProductController.class))
                .andExpect(handler().methodName("getItems"))
                .andExpect(status().isOk());

        resultActions
                .andExpect(jsonPath("$.length()").value(productRepository.count()));

    }


    @Test
    @DisplayName("상품등록하기")
    void t2() throws Exception {
        Long id = 5L;
        String productName = "신규등록원두";    // 상품명
        int productPrice = 20000;  // 가격
        String productOrigin = "비밀"; // 원산지
        int productStock = 1; // 재고
        String imageUrl = "https://upload.wikimedia.org/wikipedia/commons/b/ba/Red_x.svg";


        ResultActions resultActions = mvc
                .perform(
                        post("/api/v1/admin/product")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "id": %d,
                                          "name": "%s",
                                          "price": "%d",
                                          "origin": "%s",
                                          "stock": "%d",
                                          "imageUrl": "%s" 
                                        }""".formatted(id, productName, productPrice, productOrigin, productStock, imageUrl))

                )
                .andDo(print());


        resultActions
                .andExpect(handler().handlerType(ApiV1ProductController.class))
                .andExpect(handler().methodName("createItem"))
                .andExpect(status().isCreated());

        resultActions
                .andExpect(jsonPath("$.data.productDto.id").value(id))
                .andExpect(jsonPath("$.data.productDto.name").value(productName))
                .andExpect(jsonPath("$.data.productDto.price").value(productPrice))
                .andExpect(jsonPath("$.data.productDto.origin").value(productOrigin))
                .andExpect(jsonPath("$.data.productDto.stock").value(productStock))
                .andExpect(jsonPath("$.data.productDto.imageUrl").value(imageUrl));

    }


    @Test
    @DisplayName("상품삭제하기")
    void t3() throws Exception {
        Long id = 3L;

        ResultActions resultActions = mvc
                .perform(
                        delete("/api/v1/admin/product/%d".formatted(id))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "id": %d
                                        }""".formatted(id))
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProductController.class))
                .andExpect(handler().methodName("deleteItem"))
                .andExpect(status().isOk());

        assertThat(productRepository.findById(id).get().isUseYn()).isFalse();

        // 관리자 전체 상품조회
        resultActions = mvc
                .perform(
                        get("/api/v1/admin/product/list")
                )
                .andDo(print());


        resultActions
                .andExpect(handler().handlerType(ApiV1ProductController.class))
                .andExpect(handler().methodName("getItemsAdmin"))
                .andExpect(status().isOk());

        resultActions
                .andExpect(jsonPath("$.length()").value(productRepository.count()));

        // 사용자 비활성화 제외 상품 목록
        resultActions = mvc
                .perform(
                        get("/api/v1/product/list")
                )
                .andDo(print());


        resultActions
                .andExpect(handler().handlerType(ApiV1ProductController.class))
                .andExpect(handler().methodName("getItems"))
                .andExpect(status().isOk());

        resultActions
                .andExpect(jsonPath("$.length()").value(3));

    }


    @Test
    @DisplayName("상품수정")
    void t4() throws Exception {
        Long id = 4L;
        String productName = "수정";    // 상품명
        int productPrice = 100;  // 가격
        String productOrigin = "뒷마당";
        int productStock = 5; // 재고
        String imageUrl = "";

        ResultActions resultActions = mvc
                .perform(
                        put("/api/v1/admin/product/%d".formatted(id))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "name": "%s",
                                          "origin": "%s",
                                          "price": "%d",                                          
                                          "stock": "%d",
                                          "imageUrl": "%s"
                                        }""".formatted(productName, productOrigin, productPrice, productStock, imageUrl))
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProductController.class))
                .andExpect(handler().methodName("modifyItem"))
                .andExpect(status().isOk());

        resultActions
                .andExpect(jsonPath("$.data.productDto.id").value(id))
//                .andExpect(jsonPath("$.data.productDto.name").value(productName))
//                .andExpect(jsonPath("$.data.productDto.price").value(productPrice))
//                .andExpect(jsonPath("$.data.productDto.origin").value(productOrigin))
//                .andExpect(jsonPath("$.data.productDto.stock").value(productStock))
//                .andExpect(jsonPath("$.data.productDto.imageUrl").value(imageUrl))
        ;
    }


}