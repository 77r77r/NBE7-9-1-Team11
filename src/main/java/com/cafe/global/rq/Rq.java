package com.cafe.global.rq;


import com.cafe.domain.member.member.entity.Member;
import com.cafe.domain.member.member.service.MemberService;
import com.cafe.global.exception.ServiceException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class Rq {

    private final MemberService memberService;
    private final HttpServletRequest request;
    private final HttpServletResponse response;

    public Member getMember() {

        String apiKey = null;
        String authorization = request.getHeader("Authorization");

        if(authorization != null && !authorization.isEmpty()) {

            if (!authorization.startsWith("Bearer ")) {
                throw new ServiceException("401-2", "헤더의 인증 정보 형식이 올바르지 않습니다.");
            }

            apiKey = authorization.replace("Bearer ", "");

        } else {

            Cookie[] cookies = request.getCookies();

            if(cookies == null) {
                throw new ServiceException("401-1", "인증 정보가 없습니다.");
            }

            for(Cookie cookie : cookies) {
                if(cookie.getName().equals("apiKey")) {
                    apiKey = cookie.getValue();
                    break;
                }
            }
        }

        Member actor = memberService.findByApiKey(apiKey)
                .orElseThrow(() -> new ServiceException("401-3", "API 키가 올바르지 않습니다."));

        return actor;
    }

    public void addCookie(String name, String value) {

        Cookie cookie = new Cookie(name, value);
        cookie.setDomain("localhost");
        cookie.setPath("/");
        cookie.setHttpOnly(true);

        response.addCookie(cookie);

    }

    public void deleteCookie(String name) {

        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setDomain("localhost");
        cookie.setPath("/");
        cookie.setMaxAge(0);

        response.addCookie(cookie);

    }
}