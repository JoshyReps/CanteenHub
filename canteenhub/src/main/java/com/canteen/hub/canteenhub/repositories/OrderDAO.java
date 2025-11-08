package com.canteen.hub.canteenhub.repositories;

import com.canteen.hub.canteenhub.model.Order;
import com.canteen.hub.canteenhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Repository
public interface OrderDAO extends JpaRepository<Order, Long> {
    List<Order> findByUserId(User user);
}

