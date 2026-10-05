package group.backend.services;

import group.backend.models.ToDoItem;
import group.backend.repositories.ToDoItemRepository;
import group.backend.websockets.NotificationDispatcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ToDoItemService {
    private final ToDoItemRepository toDoItemRepository;
    private final NotificationDispatcher notificationDispatcher;

    @Autowired
    public ToDoItemService(ToDoItemRepository toDoItemRepository, NotificationDispatcher notificationDispatcher) {
        this.toDoItemRepository = toDoItemRepository;
        this.notificationDispatcher = notificationDispatcher;
    }

    public List<ToDoItem> getAllToDoItems() {
        return toDoItemRepository.findAll();
    }

    public ToDoItem getToDoItemById(Long id) {
        return toDoItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ToDo item not found"));
    }

    public ToDoItem saveToDoItem(ToDoItem toDoItem) {
        ToDoItem savedItem = toDoItemRepository.save(toDoItem);
        notificationDispatcher.broadcast("CREATED", savedItem);
        return savedItem;
    }

    public ToDoItem updateToDoItem(Long id, ToDoItem toDoItem) {
        ToDoItem existing = getToDoItemById(id);
        existing.setTitle(toDoItem.getTitle());
        existing.setPriority(toDoItem.getPriority());
        existing.setDueDate(toDoItem.getDueDate());
        existing.setIsCompleted(toDoItem.getIsCompleted());

        ToDoItem updatedItem = toDoItemRepository.save(existing);
        notificationDispatcher.broadcast("UPDATED", updatedItem);
        return updatedItem;
    }

    public void deleteToDoItem(Long id) {
        ToDoItem existing = getToDoItemById(id);
        toDoItemRepository.delete(existing);
        notificationDispatcher.broadcast("DELETED", id);
    }
}