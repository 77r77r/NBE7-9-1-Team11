package com.cafe.domain.product.product.service;

import com.cafe.domain.product.product.entity.Product;
import com.cafe.domain.product.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;


    public Product register(String productName, int productPrice, String origin, int stock, String imgUrl) {
        return productRepository.save(new Product(productName, productPrice, origin, stock, imgUrl));
    }

    public Product register(Product product) {
        return productRepository.save(product);
    }


    public long count() {
        return productRepository.count();
    }


    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public boolean existsByProductName(String productName) {
        return productRepository.existsByProductName(productName);
    }

    public Optional<Product> findByProductName(String productName) {
        return productRepository.findByProductName(productName);
    }

    public void deleteProduct(Product product) {
        productRepository.delete(product);
    }

}
