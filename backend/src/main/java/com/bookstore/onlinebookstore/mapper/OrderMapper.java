package com.bookstore.onlinebookstore.mapper;

import com.bookstore.onlinebookstore.dto.OrderDto;
import com.bookstore.onlinebookstore.entity.Address;
import com.bookstore.onlinebookstore.entity.Order;
import com.bookstore.onlinebookstore.entity.OrderItem;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * MapStruct mapper for Order and OrderItem entities and DTOs.
 */
@Mapper(componentModel = "spring", uses = {BookMapper.class})
public interface OrderMapper {

    /**
     * Convert Order entity to OrderResponse DTO.
     * 
     * @param order the order entity
     * @return order response DTO
     */
    @Mapping(target = "id", source = "id", qualifiedByName = "uuidToString")
    @Mapping(target = "userId", source = "user.id", qualifiedByName = "uuidToString")
    @Mapping(target = "status", source = "status", qualifiedByName = "orderStatusToDto")
    @Mapping(target = "paymentMethod", source = "paymentMethod", qualifiedByName = "paymentMethodToDto")
    OrderDto.OrderResponse toOrderResponse(Order order);

    /**
     * Convert list of Order entities to list of OrderResponse DTOs.
     * 
     * @param orders the order entities
     * @return list of order response DTOs
     */
    List<OrderDto.OrderResponse> toOrderResponseList(List<Order> orders);

    /**
     * Convert Page of Order entities to OrderPageResponse DTO.
     * 
     * @param orderPage the order page
     * @return order page response DTO
     */
    default OrderDto.OrderPageResponse toOrderPageResponse(Page<Order> orderPage) {
        OrderDto.OrderPageResponse response = new OrderDto.OrderPageResponse();
        response.setContent(toOrderResponseList(orderPage.getContent()));
        response.setPage(orderPage.getNumber());
        response.setSize(orderPage.getSize());
        response.setTotalElements(orderPage.getTotalElements());
        response.setTotalPages(orderPage.getTotalPages());
        response.setFirst(orderPage.isFirst());
        response.setLast(orderPage.isLast());
        return response;
    }

    /**
     * Convert OrderItem entity to OrderItemResponse DTO.
     * 
     * @param orderItem the order item entity
     * @return order item response DTO
     */
    @Mapping(target = "id", source = "id", qualifiedByName = "uuidToString")
    @Mapping(target = "book", source = "book")
    @Mapping(target = "totalPrice", expression = "java(orderItem.getTotalPrice())")
    OrderDto.OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    /**
     * Convert list of OrderItem entities to list of OrderItemResponse DTOs.
     * 
     * @param orderItems the order item entities
     * @return list of order item response DTOs
     */
    List<OrderDto.OrderItemResponse> toOrderItemResponseList(List<OrderItem> orderItems);

    /**
     * Convert Address entity to AddressResponse DTO.
     * 
     * @param address the address entity
     * @return address response DTO
     */
    OrderDto.AddressResponse toAddressResponse(Address address);

    /**
     * Convert AddressRequest DTO to Address entity.
     * 
     * @param request the address request DTO
     * @return address entity
     */
    Address toAddress(OrderDto.AddressRequest request);

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

    /**
     * Convert Order.OrderStatus to OrderDto.OrderStatus.
     * 
     * @param status the entity order status
     * @return DTO order status
     */
    @Named("orderStatusToDto")
    default OrderDto.OrderStatus orderStatusToDto(Order.OrderStatus status) {
        if (status == null) {
            return null;
        }
        return OrderDto.OrderStatus.valueOf(status.name());
    }

    /**
     * Convert Order.PaymentMethod to OrderDto.PaymentMethod.
     * 
     * @param paymentMethod the entity payment method
     * @return DTO payment method
     */
    @Named("paymentMethodToDto")
    default OrderDto.PaymentMethod paymentMethodToDto(Order.PaymentMethod paymentMethod) {
        if (paymentMethod == null) {
            return null;
        }
        return OrderDto.PaymentMethod.valueOf(paymentMethod.name());
    }
}