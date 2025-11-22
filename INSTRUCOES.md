# 📚 Instruções do Projeto FlowCloser

Guia completo para configurar, desenvolver e fazer deploy do FlowCloser Agent.

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** ou **yarn**
- Contas e chaves de API:
  - IQAI API Key
  - OpenAI API Key (para GPT-4o-mini)
  - Google API Key (para Gemini, opcional)
  - Instagram App ID e Secret (para integração com Instagram)

## 🚀 Instalação

1. **Clone o repositório** (se ainda não tiver):
```bash
git clone <url-do-repositorio>
cd flowcloser_adk-ts
```

2. **Instale as dependências**:
```bash
npm install
```

## ⚙️ Configuração

1. **Copie o arquivo de exemplo de variáveis de ambiente**:
```bash
cp .env.example .env
```

2. **Configure as variáveis de ambiente** no arquivo `.env`:

```env
# Chave da API IQAI (obrigatória)
IQAI_API_KEY=sua_chave_iqai_aqui

# Modelo LLM primário
LLM_MODEL=gpt-4o-mini

# Modelo LLM de fallback (opcional)
LLM_MODEL_FALLBACK=gemini-2.5-flash

# Chaves de API dos provedores LLM
OPENAI_API_KEY=sua_chave_openai_aqui
GOOGLE_API_KEY=sua_chave_google_aqui

# Porta do servidor
PORT=8042

# Token de verificação do webhook Instagram
WEBHOOK_VERIFY_TOKEN=flowcloser_webhook_neo

# Credenciais Instagram OAuth
INSTAGRAM_APP_ID=seu_app_id_instagram
INSTAGRAM_APP_SECRET=seu_app_secret_instagram
INSTAGRAM_REDIRECT_URI=https://seu-dominio.up.railway.app/api/auth/instagram/callback
```

## 💻 Desenvolvimento

### Rodar em modo desenvolvimento

O modo dev usa `tsx watch` para recompilar automaticamente quando há mudanças:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:8042` (ou na porta definida em `PORT`).

### Build do projeto

Para compilar o TypeScript para JavaScript:

```bash
npm run build
```

Os arquivos compilados serão gerados na pasta `dist/`.

### Rodar em produção (local)

Após fazer o build:

```bash
npm start
```

## 🌐 Endpoints da API

### Webhook Instagram (GET)

- **URL**: `/api/webhook/instagram`
- **Método**: GET
- **Descrição**: Verificação do webhook do Instagram Business API
- **Query params**: `hub.mode`, `hub.verify_token`, `hub.challenge`

### Webhook Instagram (POST)

- **URL**: `/api/webhook/instagram`
- **Método**: POST
- **Descrição**: Recebe eventos do Instagram (mensagens, etc.)

### OAuth Callback Instagram

- **URL**: `/api/auth/instagram/callback`
- **Método**: GET
- **Descrição**: Callback para autenticação OAuth do Instagram

## 📦 Estrutura do Projeto

```
flowcloser_adk-ts/
├── src/                    # Código fonte TypeScript
│   ├── agents/
│   │   └── flowcloser/     # Agente FlowCloser
│   │       ├── agent.ts    # Configuração principal do agente
│   │       ├── tools.ts    # Ferramentas disponíveis para o agente
│   │       └── callbacks.ts # Callbacks do agente
│   └── main.ts             # Ponto de entrada da aplicação
├── dist/                   # Arquivos compilados (gerado após build)
├── .env                    # Variáveis de ambiente (não commitado)
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração TypeScript
├── Procfile               # Configuração para Railway
└── README.md             # Documentação principal
```

## 🚢 Deploy

### Railway

O projeto está configurado para deploy no Railway:

1. **Instale o Railway CLI**:

```bash
npm i -g @railway/cli
```

2. **Faça login**:
```bash
railway login
```

3. **Inicialize o projeto**:
```bash
railway init
```

4. **Configure as variáveis de ambiente** no dashboard do Railway ou via CLI:

```bash
railway variables --set "IQAI_API_KEY=sua_chave" --set "OPENAI_API_KEY=sua_chave" --set "GOOGLE_API_KEY=sua_chave"
railway variables --set "LLM_MODEL=gpt-4o-mini" --set "PORT=8042"
railway variables --set "WEBHOOK_VERIFY_TOKEN=flowcloser_webhook_neo"
railway variables --set "INSTAGRAM_APP_ID=seu_app_id" --set "INSTAGRAM_APP_SECRET=seu_app_secret"
railway variables --set "INSTAGRAM_REDIRECT_URI=https://seu-dominio.up.railway.app/api/auth/instagram/callback"
```

**Nota:** Você pode definir múltiplas variáveis em um único comando usando múltiplos `--set`, ou definir uma por vez.

5. **Faça deploy**:
```bash
railway up
```

O `Procfile` já está configurado para rodar `node dist/main.js` em produção.

### Variáveis de Ambiente no Railway

Certifique-se de configurar todas as variáveis necessárias no Railway:
- `IQAI_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY` (opcional)
- `LLM_MODEL`
- `LLM_MODEL_FALLBACK` (opcional)
- `PORT` (Railway define automaticamente, mas você pode sobrescrever)
- `WEBHOOK_VERIFY_TOKEN`
- `INSTAGRAM_APP_ID`
- `INSTAGRAM_APP_SECRET`
- `INSTAGRAM_REDIRECT_URI` (deve apontar para sua URL do Railway)

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot-reload
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Inicia o servidor em produção (requer build prévio)

## 🐛 Troubleshooting

### Erro de porta já em uso
Se a porta 8042 estiver em uso, altere a variável `PORT` no `.env` ou use:
```bash
PORT=3000 npm run dev
```

### Erro de módulos não encontrados
Certifique-se de ter instalado todas as dependências:
```bash
npm install
```

### Erro de variáveis de ambiente não definidas
Verifique se o arquivo `.env` existe e contém todas as variáveis necessárias. Use `.env.example` como referência.

### Erro de build
Limpe a pasta `dist` e tente novamente:
```bash
rm -rf dist
npm run build
```

## 📝 Notas Importantes

- O projeto usa **ES Modules** (`"type": "module"` no `package.json`)
- O agente usa sistema de **fallback automático** entre modelos LLM
- O webhook do Instagram precisa ser configurado no Facebook Developer Console apontando para sua URL de produção
- O `INSTAGRAM_REDIRECT_URI` deve ser uma URL HTTPS válida em produção

## 🔗 Links Úteis

- [Documentação IQAI ADK](https://docs.iqai.com)
- [Railway Documentation](https://docs.railway.app)
- [Instagram Business API](https://developers.facebook.com/docs/instagram-api)

