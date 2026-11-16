
package com.example.tasks.todo.data.remote

import com.example.tasks.todo.data.Item
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Headers
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface ItemService {

    @GET("/api/todos")
    suspend fun find(
        @Header("Authorization") authorization: String
    ): List<Item>

    @Headers("Content-Type: application/json")
    @POST("/api/todos")
    suspend fun create(
        @Header("Authorization") authorization: String,
        @Body item: Item
    ): Item

    @Headers("Content-Type: application/json")
    @PUT("/api/todos/{id}")
    suspend fun update(
        @Header("Authorization") authorization: String,
        @Path("id") itemId: Long,
        @Body item: Item
    ): Item

    @DELETE("/api/todos/{id}")
    suspend fun delete(
        @Header("Authorization") authorization: String,
        @Path("id") itemId: Long
    )
}
