# 🚂 Configuração de Variáveis no Railway

## 📋 Como Usar este JSON

### Opção 1: Importar JSON (Recomendado)

1. Acesse seu projeto no Railway: https://railway.com/dashboard
2. Vá em **Variables**
3. Clique em **Raw Editor** ou **Import from JSON**
4. Cole o conteúdo do arquivo `railway-variables.json`
5. Clique em **Save**

### Opção 2: Adicionar Manualmente

Copie e cole cada variável manualmente no Railway:

---

## 📄 JSON para Colar no Railway

```json
{
  "IQAI_API_KEY": "97a16a55-05f0-4a39-826e-fe09cef13a53",
  "AGENT_TOKEN_CONTRACT": "0x6C3E3a7aE71AFaf30C89471Cf3080b62a1ad41E4",
  "LLM_MODEL": "gpt-4o",
  "LLM_MODEL_FALLBACK": "gemini-2.5-flash",
  "OPENAI_ORG_ID": "org-icjyrmJtDNf7AD6YdWTAh9Nu",
  "OPENAI_PROJECT_ID": "proj_MTlevvRFUIPEO3n5ZPCWPQ3r",
  "PORT": "8042",
  "WEBHOOK_VERIFY_TOKEN": "flowcloser_webhook_neo",
  "OPENAI_API_KEY": "sua_chave_openai_aqui",
  "GOOGLE_API_KEY": "your_google_api_key_here",
  "RAILWAY_URL": "https://railway.com/project/95ed3bcd-2e20-4477-b50c-43cd9ec04c41",
  "INSTAGRAM_APP_ID": "2706639773011042",
  "INSTAGRAM_APP_SECRET": "f8a59233ba3f6df301b5f08fd8b3067f",
  "INSTAGRAM_REDIRECT_URI": "https://flowcloser-agent-production.up.railway.app/api/auth/instagram/callback",
  "THIRDWEB_CLIENT_ID": "80c33540b0e40af798fa040fd47ac5d8",
  "THIRDWEB_SECRET_KEY": "AQQTztBa6f594WpNv11dh_KjosceFhDv9CBCg0rmWQZpBqxTs5oA2Wzwy_Har3FSBGU9T4CGc88nA6hg-irUpg",
  "PORTFOLIO_URL": "https://www.canva.com/design/DAG4sWWGiv8/1nwHM_YaS4YSzlXP-OlS9Q/view?utm_content=DAG4sWWGiv8&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=he9bddfa69c"
}
```

---

## 📝 Variáveis Incluídas

### IQAI & Agent
- `IQAI_API_KEY` - Chave da API IQAI
- `AGENT_TOKEN_CONTRACT` - Contrato do agente na blockchain

### LLM Configuration
- `LLM_MODEL` - Modelo primário (gpt-4o)
- `LLM_MODEL_FALLBACK` - Modelo de fallback (gemini-2.5-flash)
- `OPENAI_ORG_ID` - ID da organização OpenAI
- `OPENAI_PROJECT_ID` - ID do projeto OpenAI
- `OPENAI_API_KEY` - Chave da API OpenAI
- `GOOGLE_API_KEY` - Chave da API Google (Gemini)

### Server Configuration
- `PORT` - Porta do servidor (8042)
- `RAILWAY_URL` - URL do projeto Railway

### Meta/Instagram
- `INSTAGRAM_APP_ID` - ID do app Instagram
- `INSTAGRAM_APP_SECRET` - Secret do app Instagram
- `INSTAGRAM_REDIRECT_URI` - URI de callback OAuth
- `WEBHOOK_VERIFY_TOKEN` - Token de verificação do webhook

### Thirdweb
- `THIRDWEB_CLIENT_ID` - Client ID do Thirdweb
- `THIRDWEB_SECRET_KEY` - Secret Key do Thirdweb

### Portfolio Visual
- `PORTFOLIO_URL` - URL do portfólio visual (Canva)

---

## ⚠️ Variáveis Opcionais (Adicionar quando necessário)

Se você configurar WhatsApp no futuro, adicione:

```json
{
  "WHATSAPP_ACCESS_TOKEN": "seu_token_aqui",
  "WHATSAPP_PHONE_NUMBER_ID": "seu_phone_id_aqui",
  "WHATSAPP_BUSINESS_ACCOUNT_ID": "seu_business_id_aqui"
}
```

---

## ✅ Após Configurar

1. **Salve as variáveis** no Railway
2. **Redeploy** o serviço para aplicar as mudanças
3. **Verifique** se o health check está funcionando:
   ```
   https://flowcloser-agent-production.up.railway.app/health
   ```

---

## 🔍 Verificar se Funcionou

```bash
# Teste o health check
curl https://flowcloser-agent-production.up.railway.app/health

# Deve retornar:
# {"status":"ok","timestamp":"..."}
```

---

**Arquivo:** `railway-variables.json` - Pronto para importar no Railway ✅

