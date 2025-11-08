package com.canteen.hub.canteenhub.repositories;

import com.canteen.hub.canteenhub.model.Item;
import com.canteen.hub.canteenhub.model.Like;
import com.canteen.hub.canteenhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LikesDAO extends JpaRepository<Like, Long> {

    @Query("SELECT l.item FROM Like l GROUP BY l.item ORDER BY COUNT(l.id) DESC")
    List<Item> findMostLikedItems();
    @Query("SELECT l.item FROM Like l WHERE l.userId.id = :userId")
    List<Item> findLikedItemsByUserId(@Param("userId") Long userId);
    List<Like> findByUserId(User user);
    Optional<Like> findByUserIdAndItem(User user, Item item);
    Long countByItemId(Long itemId);
}
