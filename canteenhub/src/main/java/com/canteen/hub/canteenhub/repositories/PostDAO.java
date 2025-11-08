package com.canteen.hub.canteenhub.repositories;

import com.canteen.hub.canteenhub.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostDAO extends JpaRepository<Post, Long> {

}
