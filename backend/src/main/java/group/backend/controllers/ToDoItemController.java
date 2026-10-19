package group.backend.controllers;

import group.backend.models.ToDoItem;
import group.backend.models.User;
import group.backend.repositories.ToDoItemRepository;
import group.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/todos")
public class ToDoItemController {

    private final ToDoItemRepository toDoItemRepository;
    private final UserRepository userRepository;

    @Autowired
    public ToDoItemController(ToDoItemRepository toDoItemRepository, UserRepository userRepository) {
        this.toDoItemRepository = toDoItemRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<ToDoItem>> getAllItems(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(toDoItemRepository.findByUserId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<ToDoItem> createItem(@RequestBody ToDoItem item, Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        // Link the item to the authenticated user
        item.setUser(user);

        ToDoItem savedItem = toDoItemRepository.save(item);
        return ResponseEntity.ok(savedItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ToDoItem> updateItem(@PathVariable Long id, @RequestBody ToDoItem item, Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        item.setUser(user);
        item.setId(id);
        ToDoItem updatedItem = toDoItemRepository.save(item);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        toDoItemRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}