package com.bookstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Size;

/**
 * Embeddable entity representing an address.
 * 
 * This class is used as an embedded component in User and Order entities
 * to store address information including street, city, state, zip code, and country.
 */
@Embeddable
public class Address {

    @Size(max = 255, message = "Street cannot exceed 255 characters")
    @Column(name = "street", length = 255)
    private String street;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    @Column(name = "city", length = 100)
    private String city;

    @Size(max = 100, message = "State cannot exceed 100 characters")
    @Column(name = "state", length = 100)
    private String state;

    @Size(max = 20, message = "Zip code cannot exceed 20 characters")
    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Size(max = 100, message = "Country cannot exceed 100 characters")
    @Column(name = "country", length = 100)
    private String country;

    // Constructors
    public Address() {}

    public Address(String street, String city, String state, String zipCode, String country) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
    }

    // Getters and Setters
    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    // Business methods
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (street != null && !street.trim().isEmpty()) {
            sb.append(street);
        }
        if (city != null && !city.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(city);
        }
        if (state != null && !state.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(state);
        }
        if (zipCode != null && !zipCode.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(zipCode);
        }
        if (country != null && !country.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(country);
        }
        return sb.toString();
    }

    public boolean isEmpty() {
        return (street == null || street.trim().isEmpty()) &&
               (city == null || city.trim().isEmpty()) &&
               (state == null || state.trim().isEmpty()) &&
               (zipCode == null || zipCode.trim().isEmpty()) &&
               (country == null || country.trim().isEmpty());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Address)) return false;
        Address address = (Address) o;
        return java.util.Objects.equals(street, address.street) &&
               java.util.Objects.equals(city, address.city) &&
               java.util.Objects.equals(state, address.state) &&
               java.util.Objects.equals(zipCode, address.zipCode) &&
               java.util.Objects.equals(country, address.country);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(street, city, state, zipCode, country);
    }

    @Override
    public String toString() {
        return "Address{" +
                "street='" + street + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", zipCode='" + zipCode + '\'' +
                ", country='" + country + '\'' +
                '}';
    }
}