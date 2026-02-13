package com.buildenvironment.dto;

/**
 * DTO for repository credentials.
 */
public class RepositoryCredentialsDto {

    private String username;
    private String password;
    private String token;
    private String sshPrivateKey;
    private String sshPassphrase;

    // Constructors
    public RepositoryCredentialsDto() {}

    public RepositoryCredentialsDto(String username, String password) {
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

    public String getSshPrivateKey() {
        return sshPrivateKey;
    }

    public void setSshPrivateKey(String sshPrivateKey) {
        this.sshPrivateKey = sshPrivateKey;
    }

    public String getSshPassphrase() {
        return sshPassphrase;
    }

    public void setSshPassphrase(String sshPassphrase) {
        this.sshPassphrase = sshPassphrase;
    }

    @Override
    public String toString() {
        return "RepositoryCredentialsDto{" +
                "username='" + username + '\'' +
                ", password='[PROTECTED]'" +
                ", token='[PROTECTED]'" +
                ", sshPrivateKey='[PROTECTED]'" +
                ", sshPassphrase='[PROTECTED]'" +
                '}';
    }
}