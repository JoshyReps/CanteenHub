package hub.canteen.corp.canteenhubapplication.repositories;

import hub.canteen.corp.canteenhubapplication.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostDAO extends JpaRepository<Post, Long> {

}
