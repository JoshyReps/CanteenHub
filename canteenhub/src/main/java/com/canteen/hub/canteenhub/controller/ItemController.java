package com.canteen.hub.canteenhub.controller;

import com.canteen.hub.canteenhub.model.Item;
import com.canteen.hub.canteenhub.repositories.ItemDAO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemDAO itemDao;

    public ItemController(ItemDAO itemDao) {
        this.itemDao = itemDao;
    }

    @GetMapping
    public List<Item> getAllItems() {
        return itemDao.findAll();
    }

    @GetMapping("/type/{type}")
    public List<Item> getItemByType(@PathVariable Item.Type type) {
        return itemDao.findByType(type);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Integer id) {
        Optional<Item> item = itemDao.findById(id);

        if (item.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Item with ID " + id + " not found");
        }

        System.out.println("Fetched Item: " + item.get());
        return ResponseEntity.ok(item.get());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateItemStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Optional<Item> itemOpt = itemDao.findById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Item with ID " + id + " not found");
        }

        Item item = itemOpt.get();
        String newStatus = body.get("status");

        try {
            Item.Status statusEnum = Item.Status.valueOf(newStatus);
            item.setStatus(statusEnum);
            itemDao.save(item);
            return ResponseEntity.ok(item);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid status value: " + newStatus);
        }
    }
}
