package com.buildenvironment.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a configuration change history item.
 */
@Entity
@Table(name = "configuration_history")
@EntityListeners(AuditingEntityListener.class)
public class ConfigurationHistoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "change_id")
    private UUID changeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "environment_id", nullable = false)
    private BuildEnvironment buildEnvironment;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false)
    private ChangeType changeType;

    @CreatedDate
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "changed_by", nullable = false)
    private String changedBy;

    @Column(name = "summary", nullable = false)
    private String summary;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details; // JSON string containing change details

    // Constructors
    public ConfigurationHistoryItem() {}

    public ConfigurationHistoryItem(BuildEnvironment buildEnvironment, ChangeType changeType, 
                                  String changedBy, String summary) {
        this.buildEnvironment = buildEnvironment;
        this.changeType = changeType;
        this.changedBy = changedBy;
        this.summary = summary;
    }

    // Getters and Setters
    public UUID getChangeId() {
        return changeId;
    }

    public void setChangeId(UUID changeId) {
        this.changeId = changeId;
    }

    public BuildEnvironment getBuildEnvironment() {
        return buildEnvironment;
    }

    public void setBuildEnvironment(BuildEnvironment buildEnvironment) {
        this.buildEnvironment = buildEnvironment;
    }

    public ChangeType getChangeType() {
        return changeType;
    }

    public void setChangeType(ChangeType changeType) {
        this.changeType = changeType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    // Enums
    public enum ChangeType {
        CREATE, UPDATE, DELETE, ROLLBACK
    }
}