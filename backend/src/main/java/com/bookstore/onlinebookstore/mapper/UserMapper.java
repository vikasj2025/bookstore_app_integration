package com.bookstore.onlinebookstore.mapper;

import com.bookstore.onlinebookstore.dto.AuthDto;
import com.bookstore.onlinebookstore.entity.User;
import org.mapstruct.*;

/**
 * MapStruct mapper for User entity and DTOs.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Convert User entity to UserProfileResponse DTO.
     * 
     * @param user the user entity
     * @return user profile response DTO
     */
    @Mapping(target = "id", source = "id", qualifiedByName = "uuidToString")
    @Mapping(target = "role", source = "role", qualifiedByName = "roleToString")
    AuthDto.UserProfileResponse toUserProfileResponse(User user);

    /**
     * Convert UserRegistrationRequest to User entity.
     * 
     * @param request the registration request
     * @return user entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true) // Password encoding handled in service
    @Mapping(target = "role", ignore = true) // Role set in service
    @Mapping(target = "enabled", ignore = true) // Enabled set in service
    @Mapping(target = "orders", ignore = true)
    @Mapping(target = "cart", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    User toUser(AuthDto.UserRegistrationRequest request);

    /**
     * Update User entity from UpdateUserProfileRequest.
     * 
     * @param request the update request
     * @param user the user entity to update
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "orders", ignore = true)
    @Mapping(target = "cart", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateUserFromRequest(AuthDto.UpdateUserProfileRequest request, @MappingTarget User user);

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
     * Convert Role enum to String.
     * 
     * @param role the role enum
     * @return string representation
     */
    @Named("roleToString")
    default String roleToString(User.Role role) {
        return role != null ? role.name() : null;
    }
}