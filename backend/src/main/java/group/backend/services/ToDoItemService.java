package group.backend.services;

import group.backend.models.ToDoItem;
import group.backend.models.User;
import group.backend.repositories.ToDoItemRepository;
import group.backend.websockets.NotificationDispatcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.Objects;

@Service
public class ToDoItemService {
    private final ToDoItemRepository toDoItemRepository;
    private final NotificationDispatcher notificationDispatcher;
    private final String uploadDir = "uploads/photos/";

    @Autowired
    public ToDoItemService(ToDoItemRepository toDoItemRepository, NotificationDispatcher notificationDispatcher) {
        this.toDoItemRepository = toDoItemRepository;
        this.notificationDispatcher = notificationDispatcher;
    }

    public List<ToDoItem> getItemsByUserId(Long userId) {
        return toDoItemRepository.findByUserId(userId);
    }

    public ToDoItem saveToDoItem(ToDoItem toDoItem) {
        ToDoItem savedItem = toDoItemRepository.save(toDoItem);
        notificationDispatcher.broadcastToUser(savedItem.getUser().getUsername(), "created", savedItem);
        return savedItem;
    }

    public ToDoItem updateToDoItem(Long id, ToDoItem toDoItem, User user) {
        ToDoItem existing = getOwnedItem(id, user);

        existing.setTitle(toDoItem.getTitle());
        existing.setPriority(toDoItem.getPriority());
        existing.setDueDate(toDoItem.getDueDate());
        existing.setIsCompleted(toDoItem.getIsCompleted());
        existing.setPhotoPath(toDoItem.getPhotoPath());
        existing.setLat(toDoItem.getLat());
        existing.setLng(toDoItem.getLng());

        ToDoItem updatedItem = toDoItemRepository.save(existing);
        notificationDispatcher.broadcastToUser(user.getUsername(), "updated", updatedItem);
        return updatedItem;
    }

    public void deleteToDoItem(Long id, User user) {
        ToDoItem existing = getOwnedItem(id, user);
        toDoItemRepository.delete(existing);
        notificationDispatcher.broadcastToUser(user.getUsername(), "deleted", id);
    }

    private ToDoItem getOwnedItem(Long id, User user) {
        return toDoItemRepository.findById(id)
                .filter(item -> item.getUser() != null
                        && Objects.equals(item.getUser().getId(), user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));
    }
}