package hub.canteen.corp.canteenhubapplication.controller;

import hub.canteen.corp.canteenhubapplication.model.Post;
import hub.canteen.corp.canteenhubapplication.model.User;
import hub.canteen.corp.canteenhubapplication.repositories.PostDAO;
import hub.canteen.corp.canteenhubapplication.repositories.UserDAO;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("api/posts")
public class PostController {

    private PostDAO postDao;
    private UserDAO userDao;

    public PostController (PostDAO postDao, UserDAO userDao) {
        this.postDao = postDao;
        this.userDao = userDao;
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postDao.findAll();
    }

    private static final String UPLOAD_DIR = "uploads/public/imgs/posts/";;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPost(
            @RequestParam("title") String title,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            User user = userDao.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            String imageUrl = null;

            if (imageFile != null && !imageFile.isEmpty()) {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) uploadDir.mkdirs();

                String filename = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();

                Path filePath = Paths.get(UPLOAD_DIR + filename);
                Files.write(filePath, imageFile.getBytes());

                imageUrl = "/public/imgs/posts/" + filename;
            }

            Post post = new Post();
            post.setTitle(title);
            post.setImgUrl(imageUrl);
            post.setUserId(user);
            postDao.save(post);

            return ResponseEntity.ok("Post uploaded successfully!");

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving file");
        }
    }
}
