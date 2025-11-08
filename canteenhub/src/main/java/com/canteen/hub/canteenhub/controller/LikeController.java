package com.canteen.hub.canteenhub.controller;

import com.canteen.hub.canteenhub.model.Item;
import com.canteen.hub.canteenhub.model.Like;
import com.canteen.hub.canteenhub.model.User;
import com.canteen.hub.canteenhub.repositories.ItemDAO;
import com.canteen.hub.canteenhub.repositories.LikesDAO;
import com.canteen.hub.canteenhub.repositories.UserDAO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/likes")
public class LikeController {

    private final UserDAO userDao;
    private final LikesDAO likesDao;
    private final ItemDAO itemDao;

    public LikeController (LikesDAO likesDao, UserDAO userDao, ItemDAO itemDao) {
        this.itemDao = itemDao;
        this.userDao = userDao;
        this.likesDao = likesDao;
    }

    @GetMapping("/top-items")
    public List<Item> getMostLikedItems() {
        return likesDao.findMostLikedItems();
    }

    @GetMapping("/user/{userId}")
    public List<Item> getLikedItemsByUser(@PathVariable Long userId) {
        return likesDao.findLikedItemsByUserId(userId);
    }


    @PostMapping("/toggle")
    public ResponseEntity<?> toggleLike(@RequestParam Long userId, @RequestParam Long itemId) {
        Optional<User> userOpt = userDao.findById(userId);
        Optional<Item> itemOpt = itemDao.findById(itemId);

        if (userOpt.isEmpty() || itemOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User or Item not found");
        }

        Optional<Like> existing = likesDao.findByUserIdAndItem(userOpt.get(), itemOpt.get());


        if (existing.isPresent()) {
            // Unlike (remove record)
            likesDao.delete(existing.get());
            return ResponseEntity.ok("Unliked");
        } else {
            // Like (create record)
            Like like = new Like();
            like.setUserId(userOpt.get());
            like.setItem(itemOpt.get());
            likesDao.save(like);
            return ResponseEntity.ok("Liked");
        }
    }

    @GetMapping("/count/{itemId}")
    public Long getLikesCount(@PathVariable Long itemId) {
        return likesDao.countByItemId(itemId);
    }
}
