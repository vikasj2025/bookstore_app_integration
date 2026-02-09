package com.bookstore.controller;

import com.bookstore.dto.book.BookDetailsDto;
import com.bookstore.dto.book.BookDto;
import com.bookstore.dto.common.PagedResponse;
import com.bookstore.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for book catalog operations.
 */
@RestController
@RequestMapping("/books")
@Tag(name = "Book Catalog", description = "Book catalog management endpoints")
public class BookController {
    
    private static final Logger logger = LoggerFactory.getLogger(BookController.class);
    
    @Autowired
    private BookService bookService;
    
    /**
     * Get books with pagination and filtering.
     */
    @GetMapping
    @Operation(summary = "Get books with pagination and filtering", 
              description = "Retrieve paginated list of books with optional filtering and sorting")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Books retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid query parameters")
    })
    public ResponseEntity<PagedResponse<BookDto>> getBooks(
            @Parameter(description = "Page number (0-based)") 
            @RequestParam(defaultValue = "0") Integer page,
            
            @Parameter(description = "Number of items per page")
            @RequestParam(defaultValue = "20") Integer size,
            
            @Parameter(description = "Sort field and direction (e.g., title,asc or price,desc)")
            @RequestParam(defaultValue = "title,asc") String sort,
            
            @Parameter(description = "Filter by category")
            @RequestParam(required = false) String category,
            
            @Parameter(description = "Filter by author name")
            @RequestParam(required = false) String author,
            
            @Parameter(description = "Search in title and description")
            @RequestParam(required = false) String search,
            
            @Parameter(description = "Minimum price filter")
            @RequestParam(required = false) BigDecimal minPrice,
            
            @Parameter(description = "Maximum price filter")
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        logger.debug("Getting books - page: {}, size: {}, filters: category={}, author={}, search={}", 
                    page, size, category, author, search);
        
        PagedResponse<BookDto> response = bookService.getBooks(
            page, size, sort, category, author, search, minPrice, maxPrice
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get book details by ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get book by ID", description = "Retrieve detailed information about a specific book")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Book details retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Book not found")
    })
    public ResponseEntity<BookDetailsDto> getBookById(
            @Parameter(description = "Book ID") 
            @PathVariable UUID id
    ) {
        logger.debug("Getting book details for ID: {}", id);
        
        BookDetailsDto book = bookService.getBookById(id);
        return ResponseEntity.ok(book);
    }
    
    /**
     * Get all book categories.
     */
    @GetMapping("/categories")
    @Operation(summary = "Get all book categories", description = "Retrieve list of all available book categories")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Categories retrieved successfully")
    })
    public ResponseEntity<Map<String, List<String>>> getCategories() {
        logger.debug("Getting all book categories");
        
        List<String> categories = bookService.getCategories();
        return ResponseEntity.ok(Map.of("categories", categories));
    }
}