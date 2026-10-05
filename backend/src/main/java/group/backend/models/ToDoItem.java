package group.backend.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "to_do_items")
public class ToDoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "prioritys")
    private Integer priority;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "is_completed")
    private Boolean isCompleted;
}
