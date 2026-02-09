package com.bookstore.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Book entity representing a book in the catalog.
 */
@Entity
@Table(name = "books", indexes = {
    @Index(name = "idx_book_title", columnList = "title"),
    @Index(name = "idx_book_author", columnList = "author"),
    @Index(name = "idx_book_category", columnList = "category_id"),
    @Index(name = "idx_book_isbn", columnList = "isbn", unique = true),
    @Index(name = "idx_book_price", columnList = "price"),
    @Index(name = "idx_book_rating", columnList = "rating")
})
@EntityListeners(AuditingEntityListener.class)
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;
    
    @Column(nullable = false)
    @NotBlank(message = "Author is required")
    @Size(max = 255)
    private String author;
    
    @Column(columnDefinition = "TEXT")
    @Size(max = 2000)
    private String description;
    
    @Column(unique = true)
    @Size(max = 20)
    private String isbn;
    
    @Column(name = "published_date")
    private LocalDate publishedDate;
    
    @Size(max = 255)
    private String publisher;
    
    @Column(name = "page_count")
    @Min(value = 1, message = "Page count must be positive")
    private Integer pageCount;
    
    @Size(max = 10)
    private String language = "English";
    
    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be positive")
    private BigDecimal price;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @NotNull(message = "Category is required")
    private Category category;
    
    @Column(precision = 3, scale = 2)
    @DecimalMin(value = "0.0", message = "Rating must be non-negative")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    private BigDecimal rating = BigDecimal.ZERO;
    
    @Column(name = "review_count")
    @Min(value = 0, message = "Review count must be non-negative")
    private Integer reviewCount = 0;
    
    @Column(name = "cover_image_url")
    @Size(max = 500)
    private String coverImageUrl;
    
    @Column(name = "stock_quantity", nullable = false)
    @Min(value = 0, message = "Stock quantity must be non-negative")
    private Integer stockQuantity = 0;
    
    @Column(name = "in_stock", nullable = false)
    private Boolean inStock = true;
    
    // Book dimensions
    @Column(name = "height_cm", precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Height must be positive")
    private BigDecimal heightCm;
    
    @Column(name = "width_cm", precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Width must be positive")
    private BigDecimal widthCm;
    
    @Column(name = "thickness_cm", precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Thickness must be positive")
    private BigDecimal thicknessCm;
    
    @Column(name = "weight_grams")
    @Min(value = 0, message = "Weight must be non-negative")
    private Integer weightGrams;
    
    @Column(name = "featured")
    private Boolean featured = false;
    
    @Column(name = "active")
    private Boolean active = true;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Book() {}
    
    public Book(String title, String author, BigDecimal price, Category category) {
        this.title = title;
        this.author = author;
        this.price = price;
        this.category = category;
    }
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    
    public LocalDate getPublishedDate() { return publishedDate; }
    public void setPublishedDate(LocalDate publishedDate) { this.publishedDate = publishedDate; }
    
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    
    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    
    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { 
        this.stockQuantity = stockQuantity;
        this.inStock = stockQuantity > 0;
    }
    
    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }
    
    public BigDecimal getHeightCm() { return heightCm; }
    public void setHeightCm(BigDecimal heightCm) { this.heightCm = heightCm; }
    
    public BigDecimal getWidthCm() { return widthCm; }
    public void setWidthCm(BigDecimal widthCm) { this.widthCm = widthCm; }
    
    public BigDecimal getThicknessCm() { return thicknessCm; }
    public void setThicknessCm(BigDecimal thicknessCm) { this.thicknessCm = thicknessCm; }
    
    public Integer getWeightGrams() { return weightGrams; }
    public void setWeightGrams(Integer weightGrams) { this.weightGrams = weightGrams; }
    
    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Helper methods
    public boolean isAvailable() {
        return active && inStock && stockQuantity > 0;
    }
    
    public void decreaseStock(int quantity) {
        if (stockQuantity >= quantity) {
            stockQuantity -= quantity;
            inStock = stockQuantity > 0;
        } else {
            throw new IllegalArgumentException("Insufficient stock");
        }
    }
    
    public void increaseStock(int quantity) {
        stockQuantity += quantity;
        inStock = stockQuantity > 0;
    }
    
    public void updateRating(BigDecimal newRating, int newReviewCount) {
        this.rating = newRating;
        this.reviewCount = newReviewCount;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Book book = (Book) o;
        return Objects.equals(id, book.id) && Objects.equals(isbn, book.isbn);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, isbn);
    }
    
    @Override
    public String toString() {
        return "Book{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", isbn='" + isbn + '\'' +
                ", price=" + price +
                ", stockQuantity=" + stockQuantity +
                '}';
    }
}
