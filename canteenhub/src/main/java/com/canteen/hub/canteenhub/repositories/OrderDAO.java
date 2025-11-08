package hub.canteen.corp.canteenhubapplication.repositories;

import hub.canteen.corp.canteenhubapplication.model.Order;
import hub.canteen.corp.canteenhubapplication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Repository
public interface OrderDAO extends JpaRepository<Order, Long> {
    List<Order> findByUserId(User user);
}

