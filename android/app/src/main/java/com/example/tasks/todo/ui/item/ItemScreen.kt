
package com.example.tasks.todo.ui.item

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.tasks.R
import com.example.tasks.core.Result
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemScreen(itemId: Long?, onClose: () -> Unit) {

    val itemViewModel = viewModel<ItemViewModel>(
        factory = ItemViewModel.Factory(itemId)
    )

    val itemUiState = itemViewModel.uiState

    var title by rememberSaveable(itemId) {
        mutableStateOf(itemUiState.item.title)
    }

    var dueDate by rememberSaveable(itemId) {
        mutableStateOf(itemUiState.item.dueDate)
    }

    var priority by rememberSaveable(itemId) {
        mutableStateOf(itemUiState.item.priority ?: 2)
    }

    var isCompleted by rememberSaveable(itemId) {
        mutableStateOf(itemUiState.item.isCompleted)
    }

    var fieldsInitialized by remember(itemId) {
        mutableStateOf(itemId == null)
    }

    var showDatePicker by remember {
        mutableStateOf(false)
    }

    LaunchedEffect(itemId, itemUiState.loadResult) {
        if (fieldsInitialized) {
            return@LaunchedEffect
        }

        if (itemUiState.loadResult !is Result.Loading &&
            itemUiState.loadResult != null
        ) {
            title = itemUiState.item.title
            dueDate = itemUiState.item.dueDate
            priority = itemUiState.item.priority ?: 2
            isCompleted = itemUiState.item.isCompleted
            fieldsInitialized = true
        }
    }

    LaunchedEffect(itemUiState.submitResult) {
        if (itemUiState.submitResult is Result.Success) {
            onClose()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(text = stringResource(id = R.string.item))
                },
                actions = {
                    Button(
                        onClick = {
                            itemViewModel.saveOrUpdateItem(
                                title = title,
                                dueDate = dueDate,
                                priority = priority,
                                isCompleted = isCompleted
                            )
                        },
                        enabled = itemUiState.submitResult !is Result.Loading
                    ) {
                        Text("Save")
                    }
                }
            )
        }
    ) { paddingValues ->

        Column(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {

            if (itemUiState.loadResult is Result.Loading) {
                CircularProgressIndicator()
            } else {

                if (itemUiState.submitResult is Result.Loading) {
                    LinearProgressIndicator(
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                if (itemUiState.loadResult is Result.Error) {
                    Text(
                        text = "Failed to load item: ${
                            itemUiState.loadResult.exception?.message
                        }"
                    )
                }

                TextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title") },
                    modifier = Modifier.fillMaxWidth()
                )

                // Due date
                Text("Due date")

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = dueDate ?: "No date selected",
                        modifier = Modifier.weight(1f)
                    )

                    Button(onClick = { showDatePicker = true }) {
                        Text("Choose date")
                    }

                    TextButton(onClick = { dueDate = null }) {
                        Text("Clear")
                    }
                }

                // Priority
                Text("Priority: $priority / 10")

                Slider(
                    value = priority.toFloat(),
                    onValueChange = { priority = it.toInt() },
                    valueRange = 1f..10f,
                    steps = 8
                )

                // Completed
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = isCompleted,
                        onCheckedChange = { isCompleted = it }
                    )
                    Text("Completed")
                }

                if (itemUiState.submitResult is Result.Error) {
                    Text(
                        text = "Failed to save item: ${
                            itemUiState.submitResult.exception?.message
                        }"
                    )
                }
            }
        }
    }

    if (showDatePicker) {
        val initialDateMillis = dueDate?.let {
            try {
                LocalDate.parse(it)
                    .atStartOfDay(ZoneOffset.UTC)
                    .toInstant()
                    .toEpochMilli()
            } catch (e: Exception) {
                null
            }
        }

        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = initialDateMillis
        )

        DatePickerDialog(
            onDismissRequest = {
                showDatePicker = false
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        dueDate = datePickerState.selectedDateMillis?.let {
                            Instant.ofEpochMilli(it)
                                .atZone(ZoneOffset.UTC)
                                .toLocalDate()
                                .toString()
                        }
                        showDatePicker = false
                    }
                ) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showDatePicker = false
                    }
                ) {
                    Text("Cancel")
                }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewItemScreen() {
    ItemScreen(
        itemId = null,
        onClose = {}
    )
}
