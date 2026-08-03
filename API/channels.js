const express = require('express');
const app = express();
const channelsData = require('../data/channels.json');

// Middleware para JSON
app.use(express.json());

// Página inicial (lista completa de canais em JSON)
app.get('/', (req, res) => {
  res.json(channelsData);
});

// Rota que retorna todos os canais
app.get('/api/channels', (req, res) => {
  // Opcional: paginação simples
  const { page = 1, limit = 50 } = req.query;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = channelsData.slice(start, end);

  res.json({
    total: channelsData.length,
    page: Number(page),
    limit: Number(limit),
    data: paginated,
  });
});

// Rota que retorna as categorias com a quantidade de canais
app.get('/api/categorias', (req, res) => {
  const counts = {};
  for (const ch of channelsData) {
    const cat = ch.category || ch.group_title || 'OUTROS';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  const categorias = Object.entries(counts)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  res.json({ total: categorias.length, categorias });
});

// Rota que retorna um canal pelo índice (index)
app.get('/api/channels/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const channel = channelsData.find(c => c.index === id);
  if (!channel) {
    return res.status(404).json({ error: 'Canal não encontrado' });
  }
  res.json(channel);
});

// Exportar para a Vercel (serverless)
module.exports = app;
