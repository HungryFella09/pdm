
package com.example.tasks.todo.ui.item

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.example.tasks.MyApplication
import com.example.tasks.core.Result
import com.example.tasks.core.TAG
import com.example.tasks.todo.data.Item
import com.example.tasks.todo.data.ItemRepository
import kotlinx.coroutines.launch

data class ItemUiState(
    val itemId: Long? = null,
    val item: Item = Item(),
    val loadResult: Result<Item>? = null,
    val submitResult: Result<Item>? = null
)

class ItemViewModel(
    private val itemId: Long?,
    private val itemRepository: ItemRepository
) : ViewModel() {

    var uiState: ItemUiState by mutableStateOf(
        ItemUiState(loadResult = Result.Loading)
    )
        private set

    init {
        Log.d(TAG, "init")

        if (itemId != null) {
            loadItem()
        } else {
            uiState = uiState.copy(
                loadResult = Result.Success(Item())
            )
        }
    }

    fun loadItem() {
        viewModelScope.launch {
            itemRepository.itemStream.collect { items ->
                if (uiState.loadResult !is Result.Loading) {
                    return@collect
                }

                val item = items.find { it.id == itemId }
                    ?: Item(id = itemId ?: 0L)

                uiState = uiState.copy(
                    item = item,
                    loadResult = Result.Success(item)
                )
            }
        }
    }

    fun saveOrUpdateItem(
        title: String,
        dueDate: String?,
        priority: Int,
        isCompleted: Boolean
    ) {
        viewModelScope.launch {
            Log.d(TAG, "saveOrUpdateItem...")

            try {
                uiState = uiState.copy(
                    submitResult = Result.Loading
                )

                val item = uiState.item.copy(
                    title = title,
                    dueDate = dueDate,
                    priority = priority,
                    isCompleted = isCompleted
                )

                val savedItem = if (itemId == null) {
                    itemRepository.save(item)
                } else {
                    itemRepository.update(item)
                }

                Log.d(TAG, "saveOrUpdateItem succeeded")

                uiState = uiState.copy(
                    item = savedItem,
                    submitResult = Result.Success(savedItem)
                )

            } catch (e: Exception) {
                Log.e(TAG, "saveOrUpdateItem failed", e)

                uiState = uiState.copy(
                    submitResult = Result.Error(e)
                )
            }
        }
    }

    companion object {
        fun Factory(itemId: Long?): ViewModelProvider.Factory =
            viewModelFactory {
                initializer {
                    val app =
                        this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                                as MyApplication

                    ItemViewModel(
                        itemId,
                        app.container.itemRepository
                    )
                }
            }
    }
}
