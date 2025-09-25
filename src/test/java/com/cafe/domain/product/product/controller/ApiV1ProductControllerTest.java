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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
                        get("/api/v1/products/list")
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
        String productName = "신규등록원두";    // 상품명
        int productPrice = 20000;  // 가격
        String productOrigin = "비밀"; // 원산지
        int productStock = 1; // 재고
        String imageUrl = "https://upload.wikimedia.org/wikipedia/commons/b/ba/Red_x.svg";


        ResultActions resultActions = mvc
                .perform(
                        post("/api/v1/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "name": "%s",
                                          "price": "%d",
                                          "origin": "%s",
                                          "stock": "%d",
                                          "imageUrl": "%s" 
                                        }""".formatted(productName, productPrice, productOrigin, productStock, imageUrl))

                )
                .andDo(print());


        resultActions
                .andExpect(handler().handlerType(ApiV1ProductController.class))
                .andExpect(handler().methodName("createItem"))
                .andExpect(status().isCreated());

        resultActions
                .andExpect(jsonPath("$.name").value(productName))
                .andExpect(jsonPath("$.price").value(productPrice))
                .andExpect(jsonPath("$.origin").value(productOrigin))
                .andExpect(jsonPath("$.stock").value(productStock))
                .andExpect(jsonPath("$.imageUrl").value(imageUrl));

    }
}
