package com.bookstore.dto.response;

/**
 * Response DTO for user login.
 * 
 * This class represents the response returned after successful user authentication,
 * including JWT tokens and user information.
 */
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Integer expiresIn;
    private UserResponse user;

    // Constructors
    public LoginResponse() {}

    public LoginResponse(String accessToken, String refreshToken, String tokenType, 
                        Integer expiresIn, UserResponse user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    // Builder pattern
    public static LoginResponseBuilder builder() {
        return new LoginResponseBuilder();
    }

    // Getters and Setters
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Integer getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Integer expiresIn) {
        this.expiresIn = expiresIn;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    @Override
    public String toString() {
        return "LoginResponse{" +
                "accessToken='[PROTECTED]'" +
                ", refreshToken='[PROTECTED]'" +
                ", tokenType='" + tokenType + '\'' +
                ", expiresIn=" + expiresIn +
                ", user=" + user +
                '}';
    }

    /**
     * Builder class for LoginResponse.
     */
    public static class LoginResponseBuilder {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private Integer expiresIn;
        private UserResponse user;

        public LoginResponseBuilder accessToken(String accessToken) {
            this.accessToken = accessToken;
            return this;
        }

        public LoginResponseBuilder refreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
            return this;
        }

        public LoginResponseBuilder tokenType(String tokenType) {
            this.tokenType = tokenType;
            return this;
        }

        public LoginResponseBuilder expiresIn(Integer expiresIn) {
            this.expiresIn = expiresIn;
            return this;
        }

        public LoginResponseBuilder user(UserResponse user) {
            this.user = user;
            return this;
        }

        public LoginResponse build() {
            return new LoginResponse(accessToken, refreshToken, tokenType, expiresIn, user);
        }
    }
}