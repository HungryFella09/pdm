package group.backend.controllers;

import group.backend.models.ToDoItem;
import group.backend.models.User;
import group.backend.repositories.UserRepository;
import group.backend.services.ToDoItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/todos")
public class ToDoItemController {

    private final ToDoItemService toDoItemService;
    private final UserRepository userRepository;

    @Autowired
    public ToDoItemController(ToDoItemService toDoItemService, UserRepository userRepository) {
        this.toDoItemService = toDoItemService;
        this.userRepository = userRepository;
    }

    private User currentUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping
    public ResponseEntity<List<ToDoItem>> getAllItems(Principal principal) {
        return ResponseEntity.ok(toDoItemService.getItemsByUserId(currentUser(principal).getId()));
    }

    @PostMapping
    public ResponseEntity<ToDoItem> createItem(@RequestBody ToDoItem item, Principal principal) {
        item.setId(null);
        item.setUser(currentUser(principal));
        return ResponseEntity.ok(toDoItemService.saveToDoItem(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ToDoItem> updateItem(@PathVariable Long id, @RequestBody ToDoItem item, Principal principal) {
        return ResponseEntity.ok(toDoItemService.updateToDoItem(id, item, currentUser(principal)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id, Principal principal) {
        toDoItemService.deleteToDoItem(id, currentUser(principal));
        return ResponseEntity.ok().build();
    }
}