
package com.example.tasks.todo.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "items")
data class Item(
    @PrimaryKey
    val id: Long = 0L,
    val title: String = "",
    val priority: Int? = null,
    val dueDate: String? = null,
    val isCompleted: Boolean = false,
    val photoPath: String? = null,
    val lat: Double? = null,
    val lng: Double? = null
)
