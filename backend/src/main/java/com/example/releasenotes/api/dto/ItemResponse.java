package com.example.releasenotes.api.dto;

import com.example.releasenotes.domain.Item;
import com.example.releasenotes.domain.Status;

import java.time.Instant;

public record ItemResponse(
        Long id,
        Long applicationId,
        String applicationName,
        String title,
        String description,
        String version,
        Status status,
        Instant createdAt,
        Instant updatedAt) {

    public static ItemResponse from(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getApplication().getId(),
                item.getApplication().getName(),
                item.getTitle(),
                item.getDescription(),
                item.getVersion(),
                item.getStatus(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }
}
