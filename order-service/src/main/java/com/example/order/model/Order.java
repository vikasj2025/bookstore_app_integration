package com.example.order.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class Order {
    @NotNull
    private Long id;

    @NotBlank
    private String item;

    @Min(1)
    private int quantity;

    public Order() {}

    public Order(Long id, String item, int quantity) {
        this.id = id;
        this.item = item;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
