package hub.canteen.corp.canteenhubapplication.model;

import jakarta.persistence.*;

@Entity
@Table(name="likes")
public class Like {

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
    private Item item;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUserId() {
        return userId;
    }

    public void setUserId(User userIdd) {
        this.userId = userIdd;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    @Override
    public String toString() {
        return "Like{" +
                "id=" + id +
                ", userIdd=" + userId +
                ", item=" + item +
                '}';
    }
}
