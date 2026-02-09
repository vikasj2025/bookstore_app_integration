package com.bookstore.onlinebookstore.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for book-related operations.
 */
public class BookDto {

    /**
     * Request DTO for creating a new book.
     */
    public static class CreateBookRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        private String title;

        @NotBlank(message = "Author is required")
        @Size(max = 100, message = "Author must not exceed 100 characters")
        private String author;

        @NotBlank(message = "ISBN is required")
        @Pattern(regexp = "^(978|979)[0-9]{10}$", message = "ISBN must be in ISBN-13 format")
        private String isbn;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        @Digits(integer = 8, fraction = 2, message = "Price format is invalid")
        private BigDecimal price;

        @NotBlank(message = "Category is required")
        @Size(max = 50, message = "Category must not exceed 50 characters")
        private String category;

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        private String description;

        @Min(value = 1000, message = "Publish year must be at least 1000")
        @Max(value = 9999, message = "Publish year must not exceed 9999")
        private Integer publishYear;

        @Size(max = 100, message = "Publisher must not exceed 100 characters")
        private String publisher;

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity must be non-negative")
        private Integer stockQuantity;

        private String imageUrl;

        // Constructors
        public CreateBookRequest() {}

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        public String getIsbn() { return isbn; }
        public void setIsbn(String isbn) { this.isbn = isbn; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getPublishYear() { return publishYear; }
        public void setPublishYear(Integer publishYear) { this.publishYear = publishYear; }
        public String getPublisher() { return publisher; }
        public void setPublisher(String publisher) { this.publisher = publisher; }
        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    /**
     * Request DTO for updating a book.
     */
    public static class UpdateBookRequest {
        @Size(max = 200, message = "Title must not exceed 200 characters")
        private String title;

        @Size(max = 100, message = "Author must not exceed 100 characters")
        private String author;

        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        @Digits(integer = 8, fraction = 2, message = "Price format is invalid")
        private BigDecimal price;

        @Size(max = 50, message = "Category must not exceed 50 characters")
        private String category;

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        private String description;

        @Min(value = 1000, message = "Publish year must be at least 1000")
        @Max(value = 9999, message = "Publish year must not exceed 9999")
        private Integer publishYear;

        @Size(max = 100, message = "Publisher must not exceed 100 characters")
        private String publisher;

        private String imageUrl;

        // Constructors
        public UpdateBookRequest() {}

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getPublishYear() { return publishYear; }
        public void setPublishYear(Integer publishYear) { this.publishYear = publishYear; }
        public String getPublisher() { return publisher; }
        public void setPublisher(String publisher) { this.publisher = publisher; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    /**
     * Response DTO for book information.
     */
    public static class BookResponse {
        private String id;
        private String title;
        private String author;
        private String isbn;
        private BigDecimal price;
        private String category;
        private String description;
        private Integer publishYear;
        private String publisher;
        private Integer stockQuantity;
        private String imageUrl;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;

        // Constructors
        public BookResponse() {}

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        public String getIsbn() { return isbn; }
        public void setIsbn(String isbn) { this.isbn = isbn; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getPublishYear() { return publishYear; }
        public void setPublishYear(Integer publishYear) { this.publishYear = publishYear; }
        public String getPublisher() { return publisher; }
        public void setPublisher(String publisher) { this.publisher = publisher; }
        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    /**
     * Response DTO for paginated book results.
     */
    public static class BookPageResponse {
        private List<BookResponse> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;

        // Constructors
        public BookPageResponse() {}

        // Getters and Setters
        public List<BookResponse> getContent() { return content; }
        public void setContent(List<BookResponse> content) { this.content = content; }
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
        public boolean isFirst() { return first; }
        public void setFirst(boolean first) { this.first = first; }
        public boolean isLast() { return last; }
        public void setLast(boolean last) { this.last = last; }
    }
}