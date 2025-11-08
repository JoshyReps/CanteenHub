package hub.canteen.corp.canteenhubapplication.repositories;

import hub.canteen.corp.canteenhubapplication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserDAO extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
