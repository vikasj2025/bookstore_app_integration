package com.buildenvironment.dto;

/**
 * DTO for registry credentials.
 */
public class RegistryCredentialsDto {

    private String username;
    private String password;
    private String token;

    // Constructors
    public RegistryCredentialsDto() {}

    public RegistryCredentialsDto(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    @Override
    public String toString() {
        return "RegistryCredentialsDto{" +
                "username='" + username + '\'' +
                ", password='[PROTECTED]'" +
                ", token='[PROTECTED]'" +
                '}';
    }
}