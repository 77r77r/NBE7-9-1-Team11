package com.cafe.domain.member.member.controller;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class MemberControllerTest {

    @Autowired
    private MockMvc mvc;

    private String apiVersion = "v1";

    @Test
    @DisplayName("회원 가입")
    void t1() throws Exception {

        String email = "yuchan123@gmail.com";
        String password = "asdf1234!";
        String nickname = "이 유 찬";
        String address = "경기도 성남시 수정구 태평5동 123-4";
        String postalCode = "18572";

        ResultActions resultActions = mvc
                .perform(
                        post("/api/%s/members/join".formatted(apiVersion))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "email": "%s",
                                            "password": "%s",
                                            "nickname": "%s",
                                            "address": "%s",
                                            "postalCode": "%s"
                                        }
                                        """.formatted(email, password, nickname, address, postalCode)
                                )
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("join"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.resultCode").value("201-1"))
                .andExpect(jsonPath("$.msg").value("회원가입이 완료되었습니다. %s님 환영합니다!".formatted(nickname)))
                .andExpect(jsonPath("$.data.memberDto.id").value(3))
                .andExpect(jsonPath("$.data.memberDto.email").value(email))
                .andExpect(jsonPath("$.data.memberDto.name").value(nickname))
                .andExpect(jsonPath("$.data.memberDto.address").value(address))
                .andExpect(jsonPath("$.data.memberDto.postalCode").value(postalCode))
                .andExpect(jsonPath("$.data.memberDto.createDate").exists())
                .andExpect(jsonPath("$.data.memberDto.modifyDate").exists())
                .andExpect(jsonPath("$.data.memberDto.createDate").exists());
    }

    @Test
    @DisplayName("회원 가입, 이미 존재하는 이메일로 가입")
    void t2() throws Exception {

        String email = "gen@init.com";
        String password = "asdf1234!";
        String nickname = "이 유 찬";
        String address = "경기도 성남시 수정구 태평5동 123-4";
        String postalCode = "18572";

        ResultActions resultActions = mvc
                .perform(
                        post("/api/%s/members/join".formatted(apiVersion))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "email": "%s",
                                            "password": "%s",
                                            "nickname": "%s",
                                            "address": "%s",
                                            "postalCode": "%s"
                                        }
                                        """.formatted(email, password, nickname, address, postalCode)
                                )
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("join"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.resultCode").value("409-1"))
                .andExpect(jsonPath("$.msg").value("이미 가입된 이메일입니다."));
    }
}