const express = require('express');
const path = require('path');
const api = require('./api/channels');

const app = express();
const ROOT = __dirname;

app.use(express.json());

// API de canais
app.use(api);

// Arquivos estáticos (player web)
app.use(express.static(path.join(ROOT, 'www')));
app.use(express.static(ROOT));

// 404 JSON para rotas de API desconhecidas
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Fallback para o player
app.use((req, res) => {
  res.sendFile(path.join(ROOT, 'www', 'index.html'), (err) => {
    if (err) res.status(404).send('404');
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`✓ API em http://localhost:${port}`));
