package com.example.releasenotes.api.dto;

import com.example.releasenotes.domain.Status;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull Status status) {
}
