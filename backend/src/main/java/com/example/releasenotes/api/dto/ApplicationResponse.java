package com.example.releasenotes.api.dto;

import com.example.releasenotes.domain.Application;

public record ApplicationResponse(Long id, String name) {

    public static ApplicationResponse from(Application application) {
        return new ApplicationResponse(application.getId(), application.getName());
    }
}
