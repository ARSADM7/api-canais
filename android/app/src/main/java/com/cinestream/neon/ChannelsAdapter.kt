package com.cinestream.neon

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide

class ChannelsAdapter(
    private var items: List<Channel>,
    private val onPlay: (Channel) -> Unit,
    private val onFavToggle: (Channel) -> Unit,
    private val favSet: Set<String>
) : RecyclerView.Adapter<ChannelsAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_channel, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val channel = items[position]
        holder.name.text = channel.name
        holder.favIndicator.text = if (channel.id in favSet) "★" else "☆"

        val logoUrl = channel.logo
        if (logoUrl.isNotEmpty() && logoUrl != "None") {
            Glide.with(holder.itemView.context)
                .load(logoUrl)
                .placeholder(R.drawable.ic_tv)
                .error(R.drawable.ic_tv)
                .into(holder.logo)
        } else {
            holder.logo.setImageResource(R.drawable.ic_tv)
        }

        holder.itemView.setOnClickListener { onPlay(channel) }
        holder.favIndicator.setOnClickListener { onFavToggle(channel) }
    }

    override fun getItemCount() = items.size

    fun update(newItems: List<Channel>, newFavSet: Set<String>) {
        items = newItems
        favSetUpdated(newFavSet)
        notifyDataSetChanged()
    }

    fun updateFavs(newFavSet: Set<String>) {
        notifyDataSetChanged()
    }

    private fun favSetUpdated(newFavSet: Set<String>) {}

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val logo: ImageView = view.findViewById(R.id.channel_logo)
        val name: TextView = view.findViewById(R.id.channel_name)
        val favIndicator: TextView = view.findViewById(R.id.fav_indicator)
    }
}
