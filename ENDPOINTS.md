# Documentação da API de Canais

API gratuita e aberta, sem necessidade de chave (token). Qualquer site, aplicativo ou pessoa pode usar — inclusive direto do `localhost` (CORS liberado).

**URL base:**
```
https://api-canais-opal.vercel.app
```

---

## Endpoints

### 1. Lista completa de canais

Retorna **todos** os canais de uma vez.

```
GET https://api-canais-opal.vercel.app/
```

**Resposta:** um array de objetos `canal`.

```json
[
  {
    "index": 1,
    "tvg_id": "None",
    "tvg_name": "20/07 19:40 Twins at Guardians PPV+ [MLB]",
    "tvg_logo": "https://m.media-amazon.com/.../2560x1920.png",
    "group_title": "JOGOS DO DIA - MLB",
    "display_name": "20/07 19:40 Twins at Guardians PPV+ [MLB]",
    "url": "http://plutovip.eu:8880/live/osni1111/Online999/370571.m3u8",
    "parsed": {
      "date": "20/07",
      "time": "19:40",
      "event": "Twins at Guardians",
      "league": "MLB",
      "extra": "PPV+"
    },
    "category": "ESPORTES"
  }
]
```

---

### 2. Canais com paginação

Recomendado para apps que carregam aos poucos.

```
GET https://api-canais-opal.vercel.app/api/channels?page=1&limit=50
```

**Parâmetros (todos opcionais):**

| Parâmetro | Padrão | Descrição |
| --- | --- | --- |
| `page` | `1` | Número da página |
| `limit` | `50` | Quantidade de canais por página |

**Exemplo:**
```
https://api-canais-opal.vercel.app/api/channels?page=2&limit=20
```

**Resposta:**
```json
{
  "total": 1693,
  "page": 2,
  "limit": 20,
  "data": [
    { "index": 21, "tvg_name": "...", "url": "..." },
    { "index": 22, "tvg_name": "...", "url": "..." }
  ]
}
```

- `total` = número total de canais
- `page` / `limit` = o que foi pedido
- `data` = lista de canais daquela página

---

### 3. Um canal pelo índice

Retorna um único canal pelo número (`index`).

```
GET https://api-canais-opal.vercel.app/api/channels/1
```

**Exemplos:**
```
https://api-canais-opal.vercel.app/api/channels/1
https://api-canais-opal.vercel.app/api/channels/100
https://api-canais-opal.vercel.app/api/channels/1693
```

**Resposta (200):** um objeto `canal` (mesmo formato do item da lista).

**Se o canal não existir (404):**
```json
{
  "error": "Canal não encontrado"
}
```

---

### 4. Categorias

Lista todas as categorias com a quantidade de canais de cada uma.

```
GET https://api-canais-opal.vercel.app/api/categorias
```

**Resposta:**
```json
{
  "total": 42,
  "categorias": [
    { "nome": "24H | ANIMES", "total": 65 },
    { "nome": "24H | DESENHOS", "total": 266 },
    { "nome": "24H | PROGRAMAS DE TV", "total": 71 }
  ]
}
```

---

## Campos de cada canal

| Campo | Descrição |
| --- | --- |
| `index` | Número único do canal |
| `tvg_id` | Identificador do EPG (pode vir vazio) |
| `tvg_name` | Nome original no EPG |
| `tvg_logo` | URL do logo do canal |
| `group_title` | Grupo original da lista |
| `display_name` | Nome para exibição |
| `url` | Link do stream (formato m3u8) |
| `parsed` | Dados extraídos do nome (data, horário, evento, liga) — pode ser `null` |
| `category` | Categoria do canal |

---

## Exemplos de uso

### No navegador
Basta abrir a URL. O navegador mostra o JSON.

### Com JavaScript (fetch)

```js
const url = 'https://api-canais-opal.vercel.app/api/channels?page=1&limit=50';

fetch(url)
  .then(r => r.json())
  .then(dados => {
    console.log('Total de canais:', dados.total);
    for (const canal of dados.data) {
      console.log(canal.index, canal.display_name);
    }
  })
  .catch(err => console.error('Erro:', err));
```

### No terminal (curl)

```bash
curl https://api-canais-opal.vercel.app/api/channels?page=1&limit=10
```

---

## Observações

- **CORS liberado:** a API pode ser usada de qualquer site, aplicativo ou `localhost`.
- **Sem limites conhecidos:** use com bom senso, evite consultas em excesso.
- **Publicação:** o código está em `github.com/ARSADM7/api-canais` e o deploy é automático pelo Vercel.
