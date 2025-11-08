package com.canteen.hub.canteenhub.model;

import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name="orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
//    @Column(name="user_id")
    private User userId;

    @ManyToOne
    @JoinColumn(name = "item_id")
//    @Column(name="item_id")
    private Item itemId;

    @Column(name="quantity")
    private int quantity;

    @Column(name="cost")
    private double cost;

    @Column(name="time")
    private Timestamp time;

    @Enumerated(EnumType.STRING)
    @Column(name="status")
    private Status status;

    public enum Status {
        pending, done
    }

    public Item getItemId() {
        return itemId;
    }

    public void setItemId(Item itemId) {
        this.itemId = itemId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUserId() {
        return userId;
    }

    public void setUserId(User userId) {
        this.userId = userId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getCost() {
        return cost;
    }

    public void setCost(double cost) {
        this.cost = cost;
    }

    public Timestamp getTime() {
        return time;
    }

    public void setTime(Timestamp time) {
        this.time = time;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", userId=" + userId +
                ", itemId=" + itemId +
                ", quantity=" + quantity +
                ", cost=" + cost +
                ", time=" + time +
                ", status=" + status +
                '}';
    }
}
