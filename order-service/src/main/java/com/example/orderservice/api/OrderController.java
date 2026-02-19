package com.example.orderservice.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final Map<String, String> store = new ConcurrentHashMap<>();

    @PostMapping
    public ResponseEntity<String> create(@RequestBody @Valid CreateOrderRequest request) {
        store.put(request.id(), request.description());
        return ResponseEntity.ok(request.id());
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> get(@PathVariable String id) {
        String desc = store.get(id);
        return desc == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(desc);
    }

    public static record CreateOrderRequest(@NotBlank String id, @NotBlank String description) {}
}
