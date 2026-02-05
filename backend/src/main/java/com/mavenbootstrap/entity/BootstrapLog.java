package com.mavenbootstrap.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing a log entry for a bootstrap operation.
 */
@Entity
@Table(name = "bootstrap_logs")
public class BootstrapLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bootstrap_id", nullable = false)
    @JsonBackReference
    private BootstrapOperation bootstrapOperation;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private LogLevel level;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    // Constructors
    public BootstrapLog() {}

    public BootstrapLog(LogLevel level, String message) {
        this.level = level;
        this.message = message;
    }

    public BootstrapLog(BootstrapOperation bootstrapOperation, LogLevel level, String message) {
        this.bootstrapOperation = bootstrapOperation;
        this.level = level;
        this.message = message;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public BootstrapOperation getBootstrapOperation() {
        return bootstrapOperation;
    }

    public void setBootstrapOperation(BootstrapOperation bootstrapOperation) {
        this.bootstrapOperation = bootstrapOperation;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public LogLevel getLevel() {
        return level;
    }

    public void setLevel(LogLevel level) {
        this.level = level;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public enum LogLevel {
        DEBUG,
        INFO,
        WARN,
        ERROR
    }
}