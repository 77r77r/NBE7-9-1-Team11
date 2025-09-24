package com.cafe.global.exception;

import lombok.Getter;

@Getter
public class ServiceException extends RuntimeException {

    private String resultCode;
    private String msg;

    public ServiceException(String resultCode, String msg) {
        super("%s : %s".formatted(resultCode, msg));
        this.resultCode = resultCode;
        this.msg = msg;
    }

}