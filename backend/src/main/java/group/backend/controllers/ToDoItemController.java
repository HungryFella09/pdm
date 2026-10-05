package group.backend.controllers;

import group.backend.models.ToDoItem;
import group.backend.services.ToDoItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping(path = "api/todos")
public class ToDoItemController {
    private final ToDoItemService toDoService;

    @Autowired
    public ToDoItemController(ToDoItemService toDoService) {
        this.toDoService = toDoService;
    }

    @GetMapping
    public List<ToDoItem> getAllToDoItems() {
        return toDoService.getAllToDoItems();
    }

    @GetMapping("/{id}")
    public ToDoItem getToDoItemById(@PathVariable long id) {
        return toDoService.getToDoItemById(id);
    }

    @PostMapping
    public ToDoItem createToDoItem(@RequestBody ToDoItem toDoItem) {
        return toDoService.saveToDoItem(toDoItem);
    }

    @PutMapping("/{id}")
    public ToDoItem updateToDoItem(@PathVariable long id, @RequestBody ToDoItem toDoItem) {
        return toDoService.updateToDoItem(id, toDoItem);
    }

    @DeleteMapping("/{id}")
    public void deleteToDoItem(@PathVariable long id) {
        toDoService.deleteToDoItem(id);
    }
}