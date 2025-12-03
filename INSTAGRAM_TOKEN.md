# 🔑 Token de Acesso Instagram - Configuração

**Data:** 2025-01-27  
**Status:** ✅ Token configurado

---

## 📋 Token Recebido

**Access Token:**
```
EAATBty5aMvgBQJ2TA3v1ZA9Wcz9UhxYOy52scwii3NNyZAptPzBijofPydBA7pKk4TOVtLBugFeaYJgYQwiuCrIM6AgkKToaOkojqDkFOdkhA7Qs8l4DZCrZBEcwsnNXwiUYEFT6qoPZAcxeZCetYD2mpIxrKffHMgdhdKIwR7RZADGEXfl9EAoErMHP9PPiJ5FZCLir36NZB
```

**Permissões Concedidas:**

- ✅ `ads_management`
- ✅ `ads_read`
- ✅ `manage_notifications`
- ✅ `manage_pages`
- ✅ `read_insights`
- ✅ `rsvp_event`

---

## ✅ Configuração Aplicada

### 1. **Arquivo `.env` (Local)** ✅
```env
INSTAGRAM_ACCESS_TOKEN=EAATBty5aMvgBQJ2TA3v1ZA9Wcz9UhxYOy52scwii3NNyZAptPzBijofPydBA7pKk4TOVtLBugFeaYJgYQwiuCrIM6AgkKToaOkojqDkFOdkhA7Qs8l4DZCrZBEcwsnNXwiUYEFT6qoPZAcxeZCetYD2mpIxrKffHMgdhdKIwR7RZADGEXfl9EAoErMHP9PPiJ5FZCLir36NZB
```

### 2. **Railway (Produção)** ⚠️ **PRECISA ADICIONAR**

Adicione esta variável no Railway:

1. Acesse: https://railway.com/project/95ed3bcd-2e20-4477-b50c-43cd9ec04c41
2. Vá em **Variables**
3. Adicione:
   ```
   INSTAGRAM_ACCESS_TOKEN=EAATBty5aMvgBQJ2TA3v1ZA9Wcz9UhxYOy52scwii3NNyZAptPzBijofPydBA7pKk4TOVtLBugFeaYJgYQwiuCrIM6AgkKToaOkojqDkFOdkhA7Qs8l4DZCrZBEcwsnNXwiUYEFT6qoPZAcxeZCetYD2mpIxrKffHMgdhdKIwR7RZADGEXfl9EAoErMHP9PPiJ5FZCLir36NZB
   ```
4. Clique em **Save**
5. O Railway vai fazer redeploy automaticamente

---

## 🔧 Funcionalidade Implementada

### Envio de Mensagens Automático

O código foi atualizado para **enviar mensagens automaticamente** de volta para o Instagram quando receber uma mensagem via webhook.

**Função criada:** `sendInstagramMessage()`
- Usa Instagram Graph API v18.0
- Envia mensagens de texto
- Trata erros automaticamente

**Integração:**
- Webhook recebe mensagem → Processa com agente → Envia resposta automaticamente

---

## 📊 Como Funciona

1. **Usuário envia mensagem no Instagram**
2. **Meta envia webhook** para `/api/webhooks/instagram`
3. **Agente processa** a mensagem usando `askWithFallback()`
4. **Resposta é enviada automaticamente** via `sendInstagramMessage()`
5. **Usuário recebe resposta** no Instagram

---

## ⚠️ Importante

### Validade do Token

- Tokens de acesso do Instagram/Facebook podem expirar
- Se o token expirar, você precisará gerar um novo
- Tokens de longa duração podem ser configurados no Meta Developer Console

### Renovação do Token

Se o token expirar:

1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione seu app
3. Gere um novo token de acesso
4. Atualize no Railway

---

## 🧪 Testar

Após adicionar o token no Railway:

1. Envie uma mensagem para sua conta Instagram Business
2. Verifique os logs:
   ```bash
   railway logs --tail
   ```
3. Você deve ver:
   - `📨 Message from ...`
   - `✅ Response: ...`
   - `✅ Mensagem enviada para ...`

---

## 📝 Variáveis Necessárias

### Obrigatórias:
- ✅ `INSTAGRAM_APP_ID`
- ✅ `INSTAGRAM_APP_SECRET`
- ✅ `INSTAGRAM_REDIRECT_URI`
- ✅ `INSTAGRAM_ACCESS_TOKEN` ← **NOVO**

### Opcionais:
- `INSTAGRAM_PAGE_ID` (se necessário para algumas operações)

---

**Status:** ✅ Token configurado localmente  
**Próxima ação:** Adicionar token no Railway e testar

