package com.canteen.hub.canteenhub.controller;

import com.canteen.hub.canteenhub.model.Post;
import com.canteen.hub.canteenhub.model.User;
import com.canteen.hub.canteenhub.repositories.PostDAO;
import com.canteen.hub.canteenhub.repositories.UserDAO;
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

    private static final String UPLOAD_DIR = "uploads/public/imgs/posts/";
    ;

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

                // Generate unique filename
                String filename = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();

                Path filePath = Paths.get(UPLOAD_DIR + filename);
                Files.write(filePath, imageFile.getBytes());

                // ✅ This URL works instantly, no restart required
                imageUrl = "/public/imgs/posts/" + filename;
            }

            // Save post in DB
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
