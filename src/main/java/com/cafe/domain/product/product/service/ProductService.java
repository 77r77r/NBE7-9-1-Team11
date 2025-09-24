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


    public Product register(String productName, int productPrice, String origin, int stock) {
        return productRepository.save(new Product(productName, productPrice, origin, stock));
    }

    public Product register(String productName, int productPrice, String origin) {
        return productRepository.save(new Product(productName, productPrice, origin, 0));
    }


    public long count() {
        return productRepository.count();
    }


    public List<Product> findAll() {
        return productRepository.findAll();
    }
}
