package com.example.tasks.todo.data.remote

import com.example.tasks.todo.data.Item


data class ItemEvent(val type: String, val payload: Item)
