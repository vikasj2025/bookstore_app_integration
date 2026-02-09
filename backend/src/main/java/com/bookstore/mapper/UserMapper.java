package com.bookstore.mapper;

import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for User entity and DTOs.
 * 
 * This mapper provides automatic mapping between User entities and DTOs,
 * handling the conversion of data between different layers of the application.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {

    /**
     * Convert User entity to UserResponse DTO.
     * 
     * @param user User entity
     * @return UserResponse DTO
     */
    UserResponse toUserResponse(User user);

    /**
     * Convert User entity to UserResponse DTO (alternative method name).
     * 
     * @param user User entity
     * @return UserResponse DTO
     */
    default UserResponse entityToResponse(User user) {
        return toUserResponse(user);
    }
}