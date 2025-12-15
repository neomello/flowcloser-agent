# ✅ Configuração Final do Twilio Sandbox - Passo a Passo

## 🎯 Status Atual

✅ Você já está conectado ao Sandbox!

- Número do Sandbox: `whatsapp:+14155238886`
- Seu número: `whatsapp:+55628323110`
- Código de join: `join shadow-horn.`

---

## 🔧 Passo 1: Corrigir o Webhook

Na página do Sandbox, você precisa corrigir as URLs do webhook:

### ❌ URLs Atuais (Incorretas):
```
https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp/
```

### ✅ URLs Corretas:
```
https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp/twilio
```

**O que fazer:**

1. Na seção **"Sandbox Configuration"**
2. No campo **"When a message comes in"**, altere para:
   ```
   https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp/twilio
   ```
3. No campo **"Status callback URL"**, altere para:
   ```
   https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp/twilio/status
   ```
4. Clique em **"Save"**

---

## ✅ Passo 2: Verificar o .env

Confirme que o `.env` está assim:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_PROVIDER=twilio
```

---

## 🧪 Passo 3: Testar

### Teste 1: Enviar mensagem do Sandbox para você

1. Na página "Try WhatsApp"
2. No campo **"To"**, coloque: `whatsapp:+55628323110`
3. No campo **"From"**, já está: `whatsapp:+14155238886`
4. Escolha um template ou envie mensagem simples
5. Clique em **"Send template message"**

### Teste 2: Enviar mensagem do seu WhatsApp para o Sandbox

1. Abra o WhatsApp no seu celular
2. Envie uma mensagem para: `+1 415 523 8886`
3. A mensagem deve ser processada pelo FlowCloser
4. Você deve receber uma resposta automática

---

## 📝 Resumo das URLs Corretas

| Campo | URL Correta |
|-------|-------------|
| **When a message comes in** | `https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp/twilio` |
| **Status callback URL** | `https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp/twilio/status` |

---

## ✅ Checklist Final

- [ ] Webhook corrigido para `/api/webhooks/whatsapp/twilio`
- [ ] Status callback corrigido para `/api/webhooks/whatsapp/twilio/status`
- [ ] Clicou em "Save"
- [ ] `.env` configurado com número do Sandbox
- [ ] Testou enviar mensagem

---

## 🐛 Se não funcionar

1. Verifique se o servidor está rodando no Railway
2. Verifique os logs: `railway logs --tail`
3. Teste o webhook manualmente:
   ```bash
   curl -X POST https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp/twilio \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "From=whatsapp:+55628323110&Body=teste"
   ```

