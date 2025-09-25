package com.cafe.domain.member.member.controller;

import com.cafe.domain.member.member.dto.MemberDto;
import com.cafe.global.rsData.RsData;
import com.cafe.domain.member.member.service.MemberService;
import com.cafe.domain.member.member.entity.Member;
import com.cafe.global.exception.ServiceException;
import com.cafe.global.rq.Rq;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/${app.api-version}/members")
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
            @Size(min = 5, max = 5)
            String postalCode
    ) {}

    record JoinResBody(
            MemberDto memberDto
    ) {}

    // 회원가입
    @PostMapping("/join")
    public RsData<MemberDto> join(
            @RequestBody @Valid JoinReqBody reqBody
    ) {
        Member member = memberService.join(reqBody.email, reqBody.password, reqBody.nickname, reqBody.address, reqBody.postalCode);

        return new RsData(
                "201-1",
                "회원가입이 완료되었습니다. %s님 환영합니다!".formatted(reqBody.nickname),
                new JoinResBody(
                        new MemberDto(member)
                )
        );
    }


    record LoginReqBody(
            @NotBlank
            @Size(min = 6, max = 30)
            String email,

            @NotBlank
            @Size(min = 4, max = 20)
            String password
    ) {}

    record LoginResBody(
            MemberDto memberDto,
            String apiKey
    ) {}

    // 로그인
    @PostMapping("/login")
    public RsData<MemberDto> login(
            @RequestBody @Valid LoginReqBody reqBody
    ) {

        Member member = memberService.findByEmail(reqBody.email).orElseThrow(
                () -> new ServiceException("401-1", "이메일이 존재하지 않습니다.")
        );

        if (!member.getPassword().equals(reqBody.password)) {
            throw new ServiceException("401-2", "비밀번호가 일치하지 않습니다.");
        }

        rq.addCookie("apiKey", member.getApiKey());

        return new RsData(
                "200-1",
                "%s님 환영합니다!".formatted(member.getName()),
                new LoginResBody(
                        new MemberDto(member),
                        member.getApiKey()
                )
        );
    }

    // 로그아웃
    @DeleteMapping("/logout")
    public RsData<Void> logout() {

        rq.deleteCookie("apiKey");

        return new RsData<>(
                "200-1",
                "로그아웃 되었습니다."
        );
    }


    record MypageResBody(
            MemberDto memberDto
    ) {}

    // 마이페이지
    @GetMapping("/mypage")
    public RsData<MemberDto> mypage() {

        Member member = rq.getMember();

        return new RsData(
                "200-1",
                "OK",
                new MypageResBody(
                        new MemberDto(member)
                )
        );
    }

    record ModifyMemberInfoReqBody(
            @Size(min = 4, max = 20)
            String password,

            @Size(min = 2, max = 12)
            String nickname,

            @Size(min = 2, max = 30)
            String address,

            @Size(min = 5, max = 5)
            String postalCode
    ) {}

    record ModifyMemberInfoResBody(
            MemberDto memberDto,
            String password
    ) {}

    // 회원정보 수정, Patch라서 수정할 정보만 넘겨줘도 됨
    @PatchMapping("/mypage")
    public RsData<MemberDto> modifyMemberInfo(
            @RequestBody @Valid ModifyMemberInfoReqBody reqBody
    ) {
        Member member = rq.getMember();

        memberService.ModifyMemberInfo(member, reqBody.password, reqBody.nickname, reqBody.address, reqBody.postalCode);

        return new RsData(
                "200-1",
                "회원정보가 수정되었습니다.",
                new ModifyMemberInfoResBody(
                        new MemberDto(member),
                        member.getPassword()
                )
        );
    }
}