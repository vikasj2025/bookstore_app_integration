package com.bookstore.dto.order;

import java.util.UUID;

/**
 * Book information DTO for order items.
 */
public class BookInOrderDto {
    
    private UUID id;
    private String title;
    private String author;
    private String imageUrl;
    
    // Constructors
    public BookInOrderDto() {}
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}