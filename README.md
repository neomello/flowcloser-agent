# FlowCloser

🚨 A new era of digital presence just went onchain.

Meet FlowCloser, the AI agent trained to convert cold leads into signed deals.

It sells presence. Emotional. Strategic. Unstoppable.

An autonomous agent engineered to convert friction into trust, and leads into serious digital presence.

## 🌐 Links

- **IQAI Agent**: https://app.iqai.com/pending/0x2Dd669407Ab779724f2b38b54A4322aA40C55e67
- **Website**: [flowoff.xyz](https://flowoff.xyz)
- **Deployment**: https://flowcloser-agent-production.up.railway.app

## 📚 Documentação

- **[INSTRUCOES.md](./INSTRUCOES.md)** - Guia completo de instalação, configuração e deploy
- **[TESTES.md](./TESTES.md)** - Guia completo de testes da API e endpoints

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves de API

# Rodar em desenvolvimento
npm run dev

# Build e produção
npm run build
npm start
```

## 🛠️ Tecnologias

- **TypeScript** - Linguagem de programação
- **Express.js** - Framework web
- **@iqai/adk** - Agent Development Kit
- **better-sqlite3** - Banco de dados SQLite para sessões
- **Railway** - Plataforma de deploy

## 📦 Estrutura do Projeto

```
flowcloser_adk-ts/
├── src/              # Código fonte TypeScript
├── dist/             # Código compilado
├── data/             # Banco de dados SQLite (gerado automaticamente)
├── INSTRUCOES.md     # Guia de instalação e configuração
├── TESTES.md         # Guia de testes
└── README.md         # Este arquivo
```

## 🔧 Variáveis de Ambiente

Veja o arquivo [.env.example](./.env.example) para a lista completa de variáveis necessárias.

Principais variáveis:
- `IQAI_API_KEY` - Chave da API IQAI
- `OPENAI_API_KEY` - Chave da API OpenAI
- `LLM_MODEL` - Modelo LLM primário (padrão: gpt-4o-mini)
- `INSTAGRAM_APP_ID` - ID do app Instagram
- `INSTAGRAM_APP_SECRET` - Secret do app Instagram

## 📝 Licença

Built onchain. Powered by $NEOFLW.

// 🪩 By NEØ PROTOCOL™ //

