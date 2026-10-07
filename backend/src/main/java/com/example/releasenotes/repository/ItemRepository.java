package com.example.releasenotes.repository;

import com.example.releasenotes.domain.Item;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    // Fetch the application in the same query to avoid N+1 selects when listing.
    @Override
    @EntityGraph(attributePaths = "application")
    List<Item> findAll(Sort sort);
}
