
package com.example.tasks.todo.ui.items

import android.util.Log
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tasks.todo.data.Item

typealias OnItemFn = (id: Long?) -> Unit

@Composable
fun ItemList(
    itemList: List<Item>,
    onItemClick: OnItemFn,
    modifier: Modifier
) {
    Log.d("ItemList", "recompose")

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        items(itemList) { item ->
            ItemDetail(item, onItemClick)
        }
    }
}

@Composable
fun ItemDetail(
    item: Item,
    onItemClick: OnItemFn
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        ClickableText(
            text = AnnotatedString(item.title),
            style = TextStyle(
                fontSize = 24.sp,
                color = MaterialTheme.colorScheme.primary
            ),
            onClick = {
                onItemClick(item.id)
            }
        )

        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Priority: ${item.priority ?: 1}/10",
                style = MaterialTheme.typography.bodyMedium
            )

            Text(
                text = if (item.isCompleted) "Completed" else "Pending",
                color = if (item.isCompleted) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.onSurfaceVariant
                },
                style = MaterialTheme.typography.bodyMedium
            )
        }

        Text(
            text = "Due date: ${item.dueDate ?: "Not set"}",
            style = MaterialTheme.typography.bodyMedium
        )

        Divider()
    }
}
