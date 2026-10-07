package com.example.releasenotes.api;

import com.example.releasenotes.api.dto.ApplicationResponse;
import com.example.releasenotes.api.dto.CreateItemRequest;
import com.example.releasenotes.api.dto.ItemResponse;
import com.example.releasenotes.api.dto.UpdateStatusRequest;
import com.example.releasenotes.service.ReleaseNotesService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReleaseNotesController {

    private final ReleaseNotesService service;

    public ReleaseNotesController(ReleaseNotesService service) {
        this.service = service;
    }

    @GetMapping("/applications")
    public List<ApplicationResponse> getApplications() {
        return service.findAllApplications();
    }

    @GetMapping("/items")
    public List<ItemResponse> getItems() {
        return service.findAllItems();
    }

    @PostMapping("/items")
    public ResponseEntity<ItemResponse> createItem(@Valid @RequestBody CreateItemRequest request) {
        ItemResponse created = service.createItem(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PatchMapping("/items/{id}/status")
    public ItemResponse changeStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest request) {
        return service.changeStatus(id, request.status());
    }
}
