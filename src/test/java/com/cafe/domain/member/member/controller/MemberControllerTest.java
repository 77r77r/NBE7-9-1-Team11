package com.cafe.domain.member.member.controller;

import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.member.member.repository.MemberRepository;
import com.cafe.domain.order.order.entity.Order;
import jakarta.servlet.http.Cookie;
import org.hamcrest.Matchers;
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

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class MemberControllerTest {

    @Autowired
    private MockMvc mvc;
    @Autowired
    private MemberRepository memberRepository;
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
                .andExpect(jsonPath("$.data.memberDto.createDate").exists())
                .andExpect(jsonPath("$.data.memberDto.modifyDate").exists())
                .andExpect(jsonPath("$.data.memberDto.email").value(email))
                .andExpect(jsonPath("$.data.memberDto.name").value(nickname))
                .andExpect(jsonPath("$.data.memberDto.address").value(address))
                .andExpect(jsonPath("$.data.memberDto.postalCode").value(postalCode));
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

    @Test
    @DisplayName("로그인")
    void t3() throws Exception {

        String email = "gen@init.com";
        String password = "mars7911";

        ResultActions resultActions = mvc
                .perform(
                        post("/api/%s/members/login".formatted(apiVersion))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "email": "%s",
                                            "password": "%s"
                                        }
                                        """.formatted(email, password)
                                )
                )
                .andDo(print());

        Member member = memberRepository.findByEmail(email).get();
        List<Order> orders = new ArrayList<>(member.getOrders()); // orders Lazy 초기화
        member.getOrders().size(); // orders Lazy 초기화

        resultActions
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("login"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("%s님 환영합니다!".formatted(member.getName())))
                .andExpect(jsonPath("$.data.apiKey").exists())
                .andExpect(jsonPath("$.data.memberDto.id").value(member.getId()))
                .andExpect(jsonPath("$.data.memberDto.createDate").value(Matchers.startsWith(member.getCreateDate().toString().substring(0, 20))))
                .andExpect(jsonPath("$.data.memberDto.modifyDate").value(Matchers.startsWith(member.getModifyDate().toString().substring(0, 20))))
                .andExpect(jsonPath("$.data.memberDto.email").value(member.getEmail()))
                .andExpect(jsonPath("$.data.memberDto.name").value(member.getName()))
                .andExpect(jsonPath("$.data.memberDto.address").value(member.getAddress()))
                .andExpect(jsonPath("$.data.memberDto.postalCode").value(member.getPostalCode()))
                .andExpect(jsonPath("$.data.memberDto.orders").value(orders))
                .andExpect(jsonPath("$.data.memberDto.authority").value(member.getAuthority()));

        resultActions.andExpect(
                result -> {
                    Cookie apiKeyCookie = result.getResponse().getCookie("apiKey");
                    assertThat(apiKeyCookie).isNotNull();

                    assertThat(apiKeyCookie.getPath()).isEqualTo("/");
                    assertThat(apiKeyCookie.getDomain()).isEqualTo("localhost");
                    assertThat(apiKeyCookie.isHttpOnly()).isEqualTo(true);

                    if (apiKeyCookie != null) {
                        assertThat(apiKeyCookie.getValue()).isNotBlank();
                    }
                }
        );

    }

    @Test
    @DisplayName("로그아웃")
    void t4() throws Exception {
        ResultActions resultActions = mvc
                .perform(
                        delete("/api/%s/members/logout".formatted(apiVersion))
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("로그아웃 되었습니다."))
                .andExpect(result -> {
                    Cookie apiKeyCookie = result.getResponse().getCookie("apiKey");

                    assertThat(apiKeyCookie.getValue()).isEmpty();
                    assertThat(apiKeyCookie.getMaxAge()).isEqualTo(0);
                    assertThat(apiKeyCookie.getPath()).isEqualTo("/");
                    assertThat(apiKeyCookie.isHttpOnly()).isTrue();

                });
    }

    @Test
    @DisplayName("내 정보")
    void t5() throws Exception {
        Member actor = memberRepository.findByEmail("gen@init.com").get();
        String actorApiKey = actor.getApiKey();

        ResultActions resultActions = mvc
                .perform(
                        get("/api/%s/members/mypage".formatted(apiVersion))
                                .header("Authorization", "Bearer " + actorApiKey)
                )
                .andDo(print());

        Member member = actor;
        List<Order> orders = new ArrayList<>(member.getOrders()); // orders Lazy 초기화
        member.getOrders().size(); // orders Lazy 초기화

        resultActions
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("mypage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("OK"))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.memberDto.id").value(member.getId()))
                .andExpect(jsonPath("$.data.memberDto.createDate").value(Matchers.startsWith(member.getCreateDate().toString().substring(0, 20))))
                .andExpect(jsonPath("$.data.memberDto.modifyDate").value(Matchers.startsWith(member.getModifyDate().toString().substring(0, 20))))
                .andExpect(jsonPath("$.data.memberDto.email").value(member.getEmail()))
                .andExpect(jsonPath("$.data.memberDto.name").value(member.getName()))
                .andExpect(jsonPath("$.data.memberDto.address").value(member.getAddress()))
                .andExpect(jsonPath("$.data.memberDto.postalCode").value(member.getPostalCode()))
                .andExpect(jsonPath("$.data.memberDto.orders").value(orders))
                .andExpect(jsonPath("$.data.memberDto.authority").value(member.getAuthority()));
    }
    
    @Test
    @DisplayName("내 정보 수정 - 비밀번호, 닉네임만 수정")
    void t6() throws Exception {
        Member actor = memberRepository.findByEmail("gen@init.com").get();
        String actorApiKey = actor.getApiKey();
        Member originalMember = actor;
        String originalPassword = originalMember.getPassword();
        String originalNickname = originalMember.getName();
        String originalAddress = originalMember.getAddress();
        String originalPostalCode = originalMember.getPostalCode();
        String newPassword = "newPW123";
        String newNickname = "newName";

        ResultActions resultActions = mvc
                .perform(
                        patch("/api/%s/members/mypage".formatted(apiVersion))
                                .header("Authorization", "Bearer " + actorApiKey)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                {
                                    "password": "%s",
                                    "nickname": "%s"
                                }
                                """.formatted(newPassword, newNickname))
                )
                .andDo(print());

        Member updatedMember = memberRepository.findByEmail(actor.getEmail()).get();

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("회원정보가 수정되었습니다."))
                .andExpect(jsonPath("$.data.password").value(newPassword))
                .andExpect(jsonPath("$.data.memberDto.name").value(newNickname))
                .andExpect(jsonPath("$.data.memberDto.address").value(originalAddress))
                .andExpect(jsonPath("$.data.memberDto.postalCode").value(originalPostalCode));

        // 실제 DB 반영 확인
        assertThat(updatedMember.getPassword()).isNotEqualTo(originalPassword);
        assertThat(updatedMember.getName()).isNotEqualTo(originalNickname);
        assertThat(updatedMember.getPassword()).isEqualTo(newPassword);
        assertThat(updatedMember.getName()).isEqualTo(newNickname);
        assertThat(updatedMember.getAddress()).isEqualTo(originalAddress);
        assertThat(updatedMember.getPostalCode()).isEqualTo(originalPostalCode);
    }

    @Test
    @DisplayName("내 정보 수정 - 모두 수정")
    void t7() throws Exception {
        Member actor = memberRepository.findByEmail("gen@init.com").get();
        String actorApiKey = actor.getApiKey();
        Member originalMember = actor;
        String originalPassword = originalMember.getPassword();
        String originalNickname = originalMember.getName();
        String originalAddress = originalMember.getAddress();
        String originalPostalCode = originalMember.getPostalCode();
        String newPassword = "newPW123";
        String newNickname = "newName";
        String newAddress = "새로운 주소 123-45";
        String newPostalCode = "09876";

        ResultActions resultActions = mvc
                .perform(
                        patch("/api/%s/members/mypage".formatted(apiVersion))
                                .header("Authorization", "Bearer " + actorApiKey)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                {
                                    "password": "%s",
                                    "nickname": "%s",
                                    "address": "%s",
                                    "postalCode": "%s"
                                }
                                """.formatted(newPassword, newNickname, newAddress, newPostalCode))
                )
                .andDo(print());

        Member updatedMember = memberRepository.findByEmail(actor.getEmail()).get();

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("회원정보가 수정되었습니다."))
                .andExpect(jsonPath("$.data.password").value(newPassword))
                .andExpect(jsonPath("$.data.memberDto.name").value(newNickname))
                .andExpect(jsonPath("$.data.memberDto.address").value(newAddress))
                .andExpect(jsonPath("$.data.memberDto.postalCode").value(newPostalCode));

        // 실제 DB 반영 확인
        assertThat(updatedMember.getPassword()).isNotEqualTo(originalPassword);
        assertThat(updatedMember.getName()).isNotEqualTo(originalNickname);
        assertThat(updatedMember.getAddress()).isNotEqualTo(originalAddress);
        assertThat(updatedMember.getPostalCode()).isNotEqualTo(originalPostalCode);
        assertThat(updatedMember.getPassword()).isEqualTo(newPassword);
        assertThat(updatedMember.getName()).isEqualTo(newNickname);
        assertThat(updatedMember.getAddress()).isEqualTo(newAddress);
        assertThat(updatedMember.getPostalCode()).isEqualTo(newPostalCode);
    }
    
}

