package com.cafe.global.globalExceptionHandler;

import com.cafe.global.exception.ServiceException;
import com.cafe.global.rsData.RsData;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Comparator;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ServiceException.class)
    @ResponseBody
    public RsData<Void> handleException(ServiceException e) {
        return new RsData<Void>(
                e.getResultCode(),
                e.getMsg()
        );
    }

}