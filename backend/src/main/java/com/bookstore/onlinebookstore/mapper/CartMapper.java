package com.bookstore.onlinebookstore.mapper;

import com.bookstore.onlinebookstore.dto.CartDto;
import com.bookstore.onlinebookstore.entity.Cart;
import com.bookstore.onlinebookstore.entity.CartItem;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for Cart and CartItem entities and DTOs.
 */
@Mapper(componentModel = "spring", uses = {BookMapper.class})
public interface CartMapper {

    /**
     * Convert Cart entity to CartResponse DTO.
     * 
     * @param cart the cart entity
     * @return cart response DTO
     */
    @Mapping(target = "id", source = "id", qualifiedByName = "uuidToString")
    @Mapping(target = "userId", source = "user.id", qualifiedByName = "uuidToString")
    @Mapping(target = "items", source = "items")
    @Mapping(target = "totalItems", expression = "java(cart.getTotalItems())")
    @Mapping(target = "totalAmount", expression = "java(cart.getTotalAmount())")
    CartDto.CartResponse toCartResponse(Cart cart);

    /**
     * Convert CartItem entity to CartItemResponse DTO.
     * 
     * @param cartItem the cart item entity
     * @return cart item response DTO
     */
    @Mapping(target = "id", source = "id", qualifiedByName = "uuidToString")
    @Mapping(target = "book", source = "book")
    @Mapping(target = "totalPrice", expression = "java(cartItem.getTotalPrice())")
    @Mapping(target = "addedAt", source = "createdAt")
    CartDto.CartItemResponse toCartItemResponse(CartItem cartItem);

    /**
     * Convert list of CartItem entities to list of CartItemResponse DTOs.
     * 
     * @param cartItems the cart item entities
     * @return list of cart item response DTOs
     */
    List<CartDto.CartItemResponse> toCartItemResponseList(List<CartItem> cartItems);

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