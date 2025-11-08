package com.canteen.hub.canteenhub.controller;

import com.canteen.hub.canteenhub.model.Order;
import com.canteen.hub.canteenhub.model.User;
import com.canteen.hub.canteenhub.repositories.ItemDAO;
import com.canteen.hub.canteenhub.repositories.OrderDAO;
import com.canteen.hub.canteenhub.repositories.UserDAO;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.sql.Timestamp;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderDAO orderDao;
    private final UserDAO userDao;
    private final ItemDAO itemDao;


    public OrderController(OrderDAO orderDao, UserDAO userDao, ItemDAO itemDao) {
        this.orderDao = orderDao;
        this.userDao = userDao;
        this.itemDao = itemDao;
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderDao.findAll();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/myOrders")
    public ResponseEntity<?> getMyOrders(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in");
        }

        List<Order> orders = orderDao.findByUserId(user);
        return ResponseEntity.ok(orders);
    }


    @PostMapping("/add")
    public ResponseEntity<?> addOrders(@RequestBody OrderRequestBody body) {
        var user = userDao.findById(body.userId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        body.items().forEach(i -> {
            var item = itemDao.findById(i.itemId()).orElse(null);
            if (item == null) return;

            Order order = new Order();
            order.setUserId(user);
            order.setItemId(item);
            order.setQuantity(i.quantity());
            order.setCost(i.price() * i.quantity());
            order.setStatus(Order.Status.pending);
            order.setTime(new Timestamp(System.currentTimeMillis()));

            orderDao.save(order);
        });

        return ResponseEntity.ok("Orders added successfully");
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam("status") String status
    ) {
        Optional<Order> optionalOrder = orderDao.findById(id);

        if (optionalOrder.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Order with ID " + id + " not found");
        }

        Order order = optionalOrder.get();

        try {
            order.setStatus(Order.Status.valueOf(status.toLowerCase())); // or uppercase, see below
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid status: " + status);
        }

        orderDao.save(order);
        return ResponseEntity.ok(order);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        if (!orderDao.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Order with ID " + id + " not found");
        }

        orderDao.deleteById(id);
        return ResponseEntity.ok("Order deleted successfully");
    }


    public record OrderRequestBody(Long userId, List<OrderItem> items) {}
    public record OrderItem(Integer itemId, int quantity, double price) {}
}
