package com.example.releasenotes.service;

import com.example.releasenotes.api.dto.ApplicationResponse;
import com.example.releasenotes.api.dto.CreateItemRequest;
import com.example.releasenotes.api.dto.ItemResponse;
import com.example.releasenotes.domain.Application;
import com.example.releasenotes.domain.Item;
import com.example.releasenotes.domain.Status;
import com.example.releasenotes.repository.ApplicationRepository;
import com.example.releasenotes.repository.ItemRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReleaseNotesService {

    private final ApplicationRepository applicationRepository;
    private final ItemRepository itemRepository;

    public ReleaseNotesService(ApplicationRepository applicationRepository, ItemRepository itemRepository) {
        this.applicationRepository = applicationRepository;
        this.itemRepository = itemRepository;
    }

    public List<ApplicationResponse> findAllApplications() {
        return applicationRepository.findAll(Sort.by("name")).stream()
                .map(ApplicationResponse::from)
                .toList();
    }

    public List<ItemResponse> findAllItems() {
        return itemRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(ItemResponse::from)
                .toList();
    }

    @Transactional
    public ItemResponse createItem(CreateItemRequest request) {
        Application application = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new NotFoundException("Application " + request.applicationId() + " not found"));

        Item item = new Item(
                application,
                request.title().trim(),
                trimToNull(request.description()),
                trimToNull(request.version()));

        return ItemResponse.from(itemRepository.save(item));
    }

    @Transactional
    public ItemResponse changeStatus(Long itemId, Status status) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Item " + itemId + " not found"));
        item.changeStatus(status);
        // Flush so @PreUpdate runs and the response carries the new updatedAt.
        itemRepository.flush();
        return ItemResponse.from(item);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
