package com.example.tasks

import android.content.Context
import android.util.Log
import androidx.datastore.preferences.preferencesDataStore
import com.example.tasks.core.data.remote.Api
import com.example.tasks.todo.data.remote.ItemService
import com.example.tasks.auth.TAG
import com.example.tasks.auth.data.AuthRepository
import com.example.tasks.auth.data.remote.AuthDataSource
import com.example.tasks.core.data.UserPreferencesRepository
import com.example.tasks.todo.data.ItemRepository
import com.example.tasks.todo.data.remote.ItemWsClient


val Context.userPreferencesDataStore by preferencesDataStore(
    name = "user_preferences"
)

class AppContainer(val context: Context) {
    init {
        Log.d(TAG, "init")
    }

    private val itemService: ItemService = Api.retrofit.create(ItemService::class.java)
    private val itemWsClient: ItemWsClient = ItemWsClient(Api.okHttpClient)
    private val authDataSource: AuthDataSource = AuthDataSource()

    private val database: MyAppDatabase by lazy { MyAppDatabase.getDatabase(context) }

    val itemRepository: ItemRepository by lazy {
        ItemRepository(itemService, itemWsClient, database.itemDao())
    }

    val authRepository: AuthRepository by lazy {
        AuthRepository(authDataSource)
    }

    val userPreferencesRepository: UserPreferencesRepository by lazy {
        UserPreferencesRepository(context.userPreferencesDataStore)
    }
}
