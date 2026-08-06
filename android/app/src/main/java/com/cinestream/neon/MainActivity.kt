package com.cinestream.neon

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import android.widget.Toast

class MainActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvStatus: TextView
    private lateinit var searchInput: EditText
    private lateinit var tvTotal: TextView
    private lateinit var tvFavs: TextView
    private lateinit var categoryBar: LinearLayout
    private lateinit var categoryScroll: HorizontalScrollView
    private lateinit var btnFavTab: Button
    private lateinit var btnChannelsTab: Button

    private var allChannels: List<Channel> = emptyList()
    private val adapter = ChannelsAdapter(emptyList(), { playChannel(it) }, { toggleFav(it) }, emptySet())
    private var favs: MutableSet<String> = mutableSetOf()
    private var currentTab = "canais"
    private var currentCategory = "Todos"

    private val scope = CoroutineScope(Dispatchers.Main)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        recyclerView = findViewById(R.id.recycler_channels)
        progressBar = findViewById(R.id.progress_loading)
        tvStatus = findViewById(R.id.tv_status)
        searchInput = findViewById(R.id.input_search)
        tvTotal = findViewById(R.id.tv_total)
        tvFavs = findViewById(R.id.tv_favs)
        categoryBar = findViewById(R.id.category_bar)
        categoryScroll = findViewById(R.id.category_scroll)
        btnFavTab = findViewById(R.id.btn_fav_tab)
        btnChannelsTab = findViewById(R.id.btn_channels_tab)

        recyclerView.layoutManager = GridLayoutManager(this, 3)
        recyclerView.adapter = adapter

        loadFavs()

        btnChannelsTab.setOnClickListener {
            currentTab = "canais"
            setActiveTab(btnChannelsTab, btnFavTab)
            refresh()
        }
        btnFavTab.setOnClickListener {
            currentTab = "favoritos"
            setActiveTab(btnFavTab, btnChannelsTab)
            refresh()
        }

        searchInput.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                refresh()
            }
            override fun afterTextChanged(s: android.text.Editable?) {}
        })

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (currentTab == "favoritos") {
                    currentTab = "canais"
                    setActiveTab(btnChannelsTab, btnFavTab)
                    refresh()
                } else if (currentCategory != "Todos") {
                    currentCategory = "Todos"
                    refreshCategories()
                    refresh()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        loadChannels()
    }

    private fun setActiveTab(active: Button, other: Button) {
        active.setBackgroundResource(R.drawable.tab_active)
        other.setBackgroundResource(R.drawable.tab_inactive)
    }

    private fun loadFavs() {
        val prefs = getSharedPreferences("cine_prefs", MODE_PRIVATE)
        favs = prefs.getStringSet("favs", emptySet())?.toMutableSet() ?: mutableSetOf()
        updateFavCount()
    }

    private fun saveFavs() {
        getSharedPreferences("cine_prefs", MODE_PRIVATE)
            .edit()
            .putStringSet("favs", favs)
            .apply()
    }

    private fun updateFavCount() {
        tvFavs.text = favs.size.toString()
    }

    private fun loadChannels() {
        progressBar.visibility = View.VISIBLE
        tvStatus.text = "Conectando à rede..."
        scope.launch {
            val result = withContext(Dispatchers.IO) { ApiClient.fetchChannels() }
            allChannels = result
            progressBar.visibility = View.GONE
            if (result.isEmpty()) {
                tvStatus.text = "Erro de conexão com o servidor"
            } else {
                tvStatus.visibility = View.GONE
                buildCategories()
                refresh()
            }
        }
    }

    private fun buildCategories() {
        categoryBar.removeAllViews()
        addCategoryChip("Todos")
        allChannels.map { it.category }.distinct().sorted().forEach { addCategoryChip(it) }
    }

    private fun addCategoryChip(cat: String) {
        val chip = Button(this)
        chip.text = cat
        chip.textSize = 12f
        chip.setBackgroundResource(if (cat == currentCategory) R.drawable.chip_active else R.drawable.chip_inactive)
        chip.setOnClickListener {
            currentCategory = cat
            refreshCategories()
            refresh()
        }
        categoryBar.addView(chip, LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
            marginEnd = dp(8)
        })
    }

    private fun refreshCategories() {
        categoryBar.removeAllViews()
        addCategoryChip("Todos")
        allChannels.map { it.category }.distinct().sorted().forEach { addCategoryChip(it) }
    }

    private fun refresh() {
        val query = searchInput.text.toString().trim().lowercase()
        var list = if (currentTab == "favoritos") {
            allChannels.filter { it.id in favs }
        } else {
            allChannels
        }
        if (currentCategory != "Todos") {
            list = list.filter { it.category == currentCategory }
        }
        if (query.isNotEmpty()) {
            list = list.filter { it.name.lowercase().contains(query) }
        }
        adapter.update(list, favs)
        tvTotal.text = list.size.toString()
    }

    private fun playChannel(channel: Channel) {
        if (channel.url.isEmpty()) return
        val intent = Intent(this, PlayerActivity::class.java)
        intent.putExtra("channel_url", channel.url)
        intent.putExtra("channel_name", channel.name)
        startActivity(intent)
    }

    private fun toggleFav(channel: Channel) {
        if (channel.id in favs) {
            favs.remove(channel.id)
            Toast.makeText(this, "Removido dos favoritos", Toast.LENGTH_SHORT).show()
        } else {
            favs.add(channel.id)
            Toast.makeText(this, "Adicionado aos favoritos ★", Toast.LENGTH_SHORT).show()
        }
        saveFavs()
        updateFavCount()
        refresh()
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}
