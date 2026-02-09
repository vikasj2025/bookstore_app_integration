package com.bookstore.onlinebookstore.mapper;

import com.bookstore.onlinebookstore.dto.BookDto;
import com.bookstore.onlinebookstore.dto.CommonDto;
import com.bookstore.onlinebookstore.entity.Book;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * MapStruct mapper for Book entity and DTOs.
 */
@Mapper(componentModel = "spring")
public interface BookMapper {

    /**
     * Convert Book entity to BookResponse DTO.
     * 
     * @param book the book entity
     * @return book response DTO
     */
    @Mapping(target = "id", source = "id", qualifiedByName = "uuidToString")
    BookDto.BookResponse toBookResponse(Book book);

    /**
     * Convert list of Book entities to list of BookResponse DTOs.
     * 
     * @param books the book entities
     * @return list of book response DTOs
     */
    List<BookDto.BookResponse> toBookResponseList(List<Book> books);

    /**
     * Convert Page of Book entities to BookPageResponse DTO.
     * 
     * @param bookPage the book page
     * @return book page response DTO
     */
    default BookDto.BookPageResponse toBookPageResponse(Page<Book> bookPage) {
        BookDto.BookPageResponse response = new BookDto.BookPageResponse();
        response.setContent(toBookResponseList(bookPage.getContent()));
        response.setPage(bookPage.getNumber());
        response.setSize(bookPage.getSize());
        response.setTotalElements(bookPage.getTotalElements());
        response.setTotalPages(bookPage.getTotalPages());
        response.setFirst(bookPage.isFirst());
        response.setLast(bookPage.isLast());
        return response;
    }

    /**
     * Convert CreateBookRequest to Book entity.
     * 
     * @param request the create book request
     * @return book entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "reservedQuantity", constant = "0")
    @Mapping(target = "cartItems", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    Book toBook(BookDto.CreateBookRequest request);

    /**
     * Update Book entity from UpdateBookRequest.
     * 
     * @param request the update request
     * @param book the book entity to update
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isbn", ignore = true) // ISBN should not be updated
    @Mapping(target = "stockQuantity", ignore = true) // Stock updated separately
    @Mapping(target = "reservedQuantity", ignore = true)
    @Mapping(target = "cartItems", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateBookFromRequest(BookDto.UpdateBookRequest request, @MappingTarget Book book);

    /**
     * Convert Book entity to InventoryResponse DTO.
     * 
     * @param book the book entity
     * @return inventory response DTO
     */
    @Mapping(target = "bookId", source = "id", qualifiedByName = "uuidToString")
    @Mapping(target = "availableQuantity", expression = "java(book.getAvailableQuantity())")
    @Mapping(target = "lastUpdated", source = "updatedAt")
    CommonDto.InventoryResponse toInventoryResponse(Book book);

    /**
     * Convert UUID to String.
     * 
     * @param uuid the UUID
     * @return string representation
     */
    @Named("uuidToString")
    default String uuidToString(java.util.UUID uuid) {
        return uuid != null ? uuid.toString() : null;
    }
}