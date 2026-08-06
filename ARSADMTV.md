# Como hospedar a API de Canais gratuitamente

Este guia mostra como colocar a API no ar de graça para que qualquer pessoa possa acessar.

---

## O que você vai precisar

- Conta no [GitHub](https://github.com) (grátis)
- Conta na plataforma de hospedagem que escolher (grátis)
- Node.js instalado na sua máquina (só para testar antes de publicar)

---

## Sim, você pode copiar os arquivos e colar no GitHub

Copie **todos** os arquivos e pastas abaixo para o repositório (sem mexer em nada):

- `server.js`
- `package.json`
- `package-lock.json`
- `vercel.json`
- `.gitignore`
- `API/` (a pasta inteira, com o `channels.js`)
- `data/` (a pasta inteira, com o `channels.json`)
- `api/` (a pasta inteira, com o `index.js`)

**NÃO copie** a pasta `node_modules` (é grande, desnecessária e o Vercel instala tudo sozinho). Se copiou sem querer, não tem problema: o `.gitignore` impede que ela seja enviada.

---

## Passo 0 — Testar localmente (opcional)

```bash
npm install
npm run dev
```

A API sobe em `http://localhost:3000`.

---

## Passo 1 — Enviar o código para o GitHub

1. Crie um repositório no GitHub (ex.: `api-canais`), sem README.
2. No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "API de canais"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/api-canais.git
git push -u origin main
```

> Os arquivos `node_modules` não são enviados (já existe o `.gitignore`).

---

## Opção A — Vercel (recomendada, nunca "dorme")

1. Acesse [vercel.com](https://vercel.com) e clique em **Sign Up**.
2. Escolha **Continue with GitHub** e autorize o acesso.
3. Clique em **Add New...** → **Project**.
4. Selecione o repositório `api-canais` → **Import**.
5. Framework Preset: **Other** (o resto pode ficar como está).
6. Clique em **Deploy**. Em ~1 minuto estará no ar.
7. Ao final, o Vercel mostra a URL do seu projeto, algo como:
   `https://api-canais-xxxx.vercel.app`

### Como funciona

O Vercel já reconhece o arquivo `api/index.js` e o `vercel.json` — não precisa configurar nada além do Deploy.

### Testar

- `https://SEU-PROJETO.vercel.app/` → lista completa dos canais
- `https://SEU-PROJETO.vercel.app/api/channels?page=1&limit=50` → com paginação
- `https://SEU-PROJETO.vercel.app/api/channels/1` → um canal pelo índice

### Atualizar o site

Toda vez que você fizer `git push` para o GitHub, o Vercel publica automaticamente. Nada de pagar nada.

---

## Opção B — Render (gratuito, porém "dorme")

1. Acesse [render.com](https://render.com) → **Sign Up** com o GitHub.
2. Clique em **New** → **Web Service**.
3. Conecte o repositório `api-canais`.
4. Preencha:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Plano: **Free**.
6. Clique em **Deploy Web Service**. A URL será algo como:
   `https://api-canais.onrender.com`

> No plano gratuito do Render, se ninguém acessa por ~15 minutos, o serviço "dorme". O primeiro acesso demora alguns segundos para acordar. É de graça, mas pode ser lento no início.

---

## Rotas disponíveis

| Rota | O que retorna |
| --- | --- |
| `/` | Lista completa dos canais (JSON) |
| `/api/channels?page=1&limit=50` | Canais com paginação |
| `/api/channels/:id` | Um canal pelo índice (`index`) |

Exemplos de uso:

```bash
curl https://SEU-PROJETO.vercel.app/
curl https://SEU-PROJETO.vercel.app/api/channels/1
```

---

## Dica: domínio personalizado (grátis)

Você pode usar um subdomínio gratuito do Vercel sem pagar. Para um domínio próprio (`meucanais.com.br`), é preciso comprar o domínio (custa alguns reais/ano) e configurar o DNS na plataforma.
