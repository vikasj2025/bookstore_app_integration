Order Service - Java 21 Migration

- Java 21 target via maven-compiler-plugin release 21
- Spring Boot 3.2.x using Jakarta packages (jakarta.*)
- Maven Wrapper included to lock Maven 3.9.9
- Basic web controller and test to validate build on Java 21

Build
- ./mvnw clean verify

Run
- ./mvnw spring-boot:run
