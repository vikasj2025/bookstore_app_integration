order-service (Java 21)

This service is configured to build and run with Java 21 using Maven Wrapper. After cloning the repository:

- Build: ./mvnw -q -V -B -e -DskipTests
- Run tests: ./mvnw test
- Package: ./mvnw -DskipTests package

Requirements are provisioned via Maven Wrapper automatically. No manual Maven install is required.
