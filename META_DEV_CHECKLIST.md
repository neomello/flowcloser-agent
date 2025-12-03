# ✅ Checklist para Aprovação no Meta Developer

## 🎯 O que você precisa fazer AGORA para aprovar o app

### 1. ⚠️ CRÍTICO: Páginas Legais (Obrigatório)

**Meta exige URLs públicas para:**
- Privacy Policy
- Terms of Service

**Status atual:** ❌ NÃO TEMOS

**Ação necessária:**
- Criar endpoints `/privacy-policy` e `/terms-of-service`
- Deploy no Railway
- Adicionar URLs no Meta Developer Console

---

### 2. ⚠️ CRÍTICO: Webhook WhatsApp

**Status atual:** ❌ TEMOS APENAS INSTAGRAM

**O que você está tentando aprovar:**
- Se for **WhatsApp**: precisa criar webhook `/webhook` (não `/api/webhooks/instagram`)
- Se for **Instagram**: já temos, mas precisa verificar se está correto

**Ação necessária:**
- Decidir: WhatsApp ou Instagram?
- Se WhatsApp: criar endpoints conforme código passado
- Se Instagram: verificar se está tudo configurado

---

### 3. ✅ Já temos (mas precisa verificar):

- [x] Express.js rodando
- [x] Health check (`/health`)
- [x] Webhook verification (Instagram)
- [x] OAuth callback (Instagram)
- [x] Deploy no Railway

---

## 📋 Passo a Passo para Aprovação

### Passo 1: Criar Páginas Legais (URGENTE)

```bash
# Criar arquivos:
src/routes/legal.ts  # Privacy Policy e Terms
```

**URLs que você vai precisar:**
- `https://flowcloser-agent-production.up.railway.app/privacy-policy`
- `https://flowcloser-agent-production.up.railway.app/terms-of-service`

### Passo 2: Configurar no Meta Developer Console

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu App
3. Vá em **App Review** → **Permissions and Features**
4. Adicione:
   - **Privacy Policy URL**: `https://flowcloser-agent-production.up.railway.app/privacy-policy`
   - **Terms of Service URL**: `https://flowcloser-agent-production.up.railway.app/terms-of-service`

### Passo 3: Configurar Webhook

**Se for WhatsApp:**
- Webhook URL: `https://flowcloser-agent-production.up.railway.app/webhook`
- Verify Token: `flowcloser_webhook_neo` (ou o que você configurar)

**Se for Instagram:**
- Webhook URL: `https://flowcloser-agent-production.up.railway.app/api/webhooks/instagram`
- Verify Token: `flowcloser_webhook_neo`

### Passo 4: Testar Webhook

Meta vai fazer uma requisição GET para verificar:
```
GET /webhook?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=CHALLENGE
```

**Resposta esperada:** Deve retornar o `hub.challenge` como texto.

### Passo 5: Submeter para Revisão

1. Preencha todos os campos obrigatórios
2. Adicione screenshots/vídeos do fluxo
3. Explique o uso do bot
4. Submeta para revisão

---

## 🚨 Problemas Comuns

### Problema 1: "Privacy Policy URL is required"
**Solução:** Criar endpoint `/privacy-policy` e adicionar URL no console.

### Problema 2: "Webhook verification failed"
**Solução:** Verificar se o token está correto e se o endpoint retorna o challenge.

### Problema 3: "App not responding"
**Solução:** Verificar se o servidor está rodando e acessível publicamente.

---

## 📝 Próxima Ação Recomendada

**AGORA:**
1. Criar endpoints de Privacy Policy e Terms of Service
2. Fazer deploy
3. Adicionar URLs no Meta Developer Console

**DEPOIS:**
1. Implementar WhatsApp (se necessário)
2. Implementar fluxo conversacional
3. Implementar follow-ups

---

## ❓ Decisão Necessária

**Você está tentando aprovar:**
- [ ] WhatsApp Business API
- [ ] Instagram Business API
- [ ] Ambos

**Isso determina:**
- Qual webhook criar/modificar
- Quais permissões solicitar
- Qual fluxo implementar

