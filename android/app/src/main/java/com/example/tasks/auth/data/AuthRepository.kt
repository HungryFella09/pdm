package com.example.tasks.auth.data

import android.util.Log
import com.example.tasks.core.data.remote.Api
import com.example.tasks.auth.TAG
import com.example.tasks.auth.data.remote.AuthDataSource
import com.example.tasks.auth.data.remote.TokenHolder
import com.example.tasks.auth.data.remote.User

class AuthRepository(private val authDataSource: AuthDataSource) {
    init {
        Log.d(TAG, "init")
    }

    fun clearToken() {
        Api.tokenInterceptor.token = null
    }

    suspend fun login(username: String, password: String): Result<TokenHolder> {
        val user = User(username, password)
        val result = authDataSource.login(user)
        if (result.isSuccess) {
            Api.tokenInterceptor.token = result.getOrNull()?.token
        }
        return result
    }
}
