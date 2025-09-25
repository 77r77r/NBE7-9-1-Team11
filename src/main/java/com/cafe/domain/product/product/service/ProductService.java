package com.cafe.domain.product.product.service;

import com.cafe.domain.product.product.entity.Product;
import com.cafe.domain.product.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;


    public Product register(String productName, int productPrice, String origin, int stock, String imgUrl) {
        return productRepository.save(new Product(productName, productPrice, origin, stock, imgUrl));
    }


    public long count() {
        return productRepository.count();
    }


    public List<Product> findAll() {
        return productRepository.findAll();
    }
}
