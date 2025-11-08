package hub.canteen.corp.canteenhubapplication.repositories;

import hub.canteen.corp.canteenhubapplication.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemDAO extends JpaRepository<Item, Integer> {
    @Query("SELECT i FROM Item i")
    List<Item> getAllItems();
    List<Item> findByType(Item.Type type);
    Optional<Item> findById(Long id);
    List<Item> findByStatus(Item.Status status);
    List<Item> findByNameContainingIgnoreCase(String name);
}
