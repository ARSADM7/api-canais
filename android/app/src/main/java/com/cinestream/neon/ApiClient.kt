package com.cinestream.neon

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

object ApiClient {
    private const val ENDPOINT = "https://api-canais-opal.vercel.app/api/channels"

    suspend fun fetchChannels(): List<Channel> = withContext(Dispatchers.IO) {
        val result = mutableListOf<Channel>()
        try {
            val total = getTotal()
            result.addAll(fetchPage(1, total))
            var page = 2
            while (result.size < total) {
                val batch = fetchPage(page, 500)
                if (batch.isEmpty()) break
                result.addAll(batch)
                page++
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        result
    }

    private fun getTotal(): Int {
        val conn = URL("$ENDPOINT?page=1&limit=1").openConnection() as HttpURLConnection
        try {
            conn.connectTimeout = 15000
            conn.readTimeout = 15000
            val body = conn.inputStream.bufferedReader().use { it.readText() }
            return JSONObject(body).optInt("total", 0)
        } finally {
            conn.disconnect()
        }
    }

    private fun fetchPage(page: Int, limit: Int): List<Channel> {
        val conn = URL("$ENDPOINT?page=$page&limit=$limit").openConnection() as HttpURLConnection
        try {
            conn.connectTimeout = 30000
            conn.readTimeout = 60000
            val body = conn.inputStream.bufferedReader().use { it.readText() }
            val data = JSONObject(body).optJSONArray("data") ?: JSONArray()
            val list = mutableListOf<Channel>()
            for (i in 0 until data.length()) {
                list.add(Channel.fromJson(data.getJSONObject(i)))
            }
            return list
        } finally {
            conn.disconnect()
        }
    }
}
