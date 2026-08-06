package com.cinestream.neon

import org.json.JSONObject

data class Channel(
    val id: String,
    val name: String,
    val url: String,
    val logo: String,
    val category: String
) {
    companion object {
        fun fromJson(obj: JSONObject): Channel {
            val id = obj.optString("id").ifEmpty { obj.optString("url") }
            val name = obj.optString("display_name").ifEmpty { obj.optString("tvg_name") }.ifEmpty { "Sem nome" }
            val url = obj.optString("url")
            val logo = obj.optString("tvg_logo")
            val category = obj.optString("group_title").ifEmpty { "Geral" }
            return Channel(id, name, url, logo, category)
        }
    }
}
