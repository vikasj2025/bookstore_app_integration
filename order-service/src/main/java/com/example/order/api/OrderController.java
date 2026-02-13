package com.example.order.api;

import com.example.order.model.Order;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final Map<Long, Order> store = new ConcurrentHashMap<>();

    @PostMapping
    public ResponseEntity<Order> create(@Valid @RequestBody Order order) {
        store.put(order.getId(), order);
        return ResponseEntity.created(URI.create("/api/orders/" + order.getId())).body(order);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> get(@PathVariable long id) {
        Order o = store.get(id);
        return o == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(o);
    }
}
