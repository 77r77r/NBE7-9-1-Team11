package com.cafe.domain.member.controller;

import com.cafe.domain.member.dto.MemberDto;
import com.cafe.domain.member.rsData.RsData;
import com.cafe.domain.member.service.MemberService;
import com.cafe.domain.member.entity.Member;
import com.cafe.global.exception.ServiceException;
import com.cafe.global.rq.Rq;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/members")
public class MemberController {

    private final MemberService memberService;
    private final Rq rq;

    record JoinReqBody(
            @NotBlank
            @Size(min = 6, max = 30)
            String email,

            @NotBlank
            @Size(min = 4, max = 20)
            String password,

            @NotBlank
            @Size(min = 2, max = 12)
            String nickname,

            @NotBlank
            @Size(min = 2, max = 30)
            String address,

            @NotBlank
            @Size(min = 2, max = 30)
            String postalCode
    ) {}

    record JoinResBody(
            MemberDto memberDto
    ) {}

    @PostMapping("/join")
    public RsData<MemberDto> join(
            @RequestBody @Valid JoinReqBody reqBody
    ) {
        Member member = memberService.join(reqBody.email, reqBody.password, reqBody.nickname, reqBody.address, reqBody.postalCode);

        return new RsData(
                "201-1",
                "회원가입이 완료되었습니다. %s님 환영합니다.".formatted(reqBody.nickname),
                new JoinResBody(
                        new MemberDto(member)
                )
        );
    }


    record LoginReqBody(
            @NotBlank
            @Size(min = 2, max = 30)
            String email,

            @NotBlank
            @Size(min = 2, max = 30)
            String password
    ) {}

    record LoginResBody(
            MemberDto memberDto,
            String apiKey
    ) {}

    @PostMapping("/login")
    public RsData<MemberDto> login(
            @RequestBody @Valid LoginReqBody reqBody
    ) {

        Member member = memberService.findByUsername(reqBody.email).orElseThrow(
                () -> new ServiceException("401-1", "존재하지 않는 이메일입니다.")
        );

        if (!member.getPassword().equals(reqBody.password)) {
            throw new ServiceException("401-2", "비밀번호가 일치하지 않습니다.");
        }

        rq.addCookie("apiKey", member.getApiKey());

        return new RsData(
                "200-1",
                "%s님 환영합니다.".formatted(reqBody.email),
                new LoginResBody(
                        new MemberDto(member),
                        member.getApiKey()
                )
        );
    }

    @DeleteMapping("/logout")
    public RsData<Void> logout() {

        rq.deleteCookie("apiKey");

        return new RsData<>(
                "200-1",
                "로그아웃 되었습니다."
        );
    }


    record MeResBody(
            MemberDto memberDto
    ) {
    }

    @GetMapping("/me")
    public RsData<MemberDto> me() {

        Member actor = rq.getActor();

        return new RsData(
                "200-1",
                "OK",
                new MeResBody(
                        new MemberDto(actor)
                )
        );
    }

}