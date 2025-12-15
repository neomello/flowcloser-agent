# 🚂 Configurar Variáveis Twilio no Railway

## ⚠️ Importante

As variáveis de ambiente do Twilio precisam estar configuradas **no Railway**, não apenas no `.env` local!

---

## 🔧 Como Configurar no Railway

### Opção 1: Via Dashboard do Railway (Recomendado)

1. **Acesse o Railway Dashboard:**
   - Vá em: https://railway.com/project/95ed3bcd-2e20-4477-b50c-43cd9ec04c41
   - Ou acesse: https://railway.app

2. **Selecione seu projeto:**
   - Clique no projeto "flowcloser-adk-ts" (ou nome do seu projeto)

3. **Vá em "Variables":**
   - No menu lateral, clique em **"Variables"**
   - Ou clique no serviço e depois em **"Variables"**

4. **Adicione as variáveis do Twilio:**
   Clique em **"New Variable"** e adicione uma por uma:

   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   WHATSAPP_PROVIDER=twilio
   ```

5. **Salve e aguarde o redeploy:**
   - Railway vai redeployar automaticamente
   - Aguarde alguns segundos

---

### Opção 2: Via CLI do Railway

```bash
# Instalar Railway CLI (se não tiver)
npm i -g @railway/cli

# Login
railway login

# Linkar ao projeto
railway link

# Adicionar variáveis
railway variables set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set TWILIO_AUTH_TOKEN=your_auth_token_here
railway variables set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
railway variables set WHATSAPP_PROVIDER=twilio
```

---

## ✅ Variáveis Necessárias

Certifique-se de que estas variáveis estão no Railway:

| Variável | Valor |
|----------|-------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | `your_auth_token_here` |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` |
| `WHATSAPP_PROVIDER` | `twilio` |

---

## 🔍 Como Verificar se Está Configurado

### Via Dashboard:

1. Vá em **Variables** no Railway
2. Procure pelas variáveis `TWILIO_*`
3. Se não estiverem lá, adicione

### Via CLI:
```bash
railway variables
```

Deve mostrar todas as variáveis, incluindo as do Twilio.

---

## 🚀 Após Configurar

1. **Aguarde o redeploy automático** (Railway faz isso quando você adiciona variáveis)
2. **Teste o webhook:**
   - Envie uma mensagem do WhatsApp para `+1 415 523 8886`
   - Deve receber resposta automática

---

## 🐛 Troubleshooting

### Se não funcionar após configurar:

1. **Verifique se as variáveis estão corretas:**
   ```bash
   railway variables
   ```

2. **Force um redeploy:**
   - No dashboard, vá em **"Deployments"**
   - Clique em **"Redeploy"**

3. **Verifique os logs:**
   ```bash
   railway logs --tail
   ```
   
   Procure por:
   - `⚠️ Twilio não configurado` → Variáveis não estão no Railway
   - `✅ WhatsApp Twilio enviado` → Funcionando!

---

## 📝 Checklist

- [ ] Variáveis Twilio adicionadas no Railway
- [ ] Redeploy concluído
- [ ] Webhook configurado no Twilio
- [ ] Teste enviando mensagem do WhatsApp

---

## 🎯 Próximo Passo

Após configurar as variáveis no Railway:

1. Aguarde o redeploy (alguns segundos)
2. Envie uma mensagem do WhatsApp para `+1 415 523 8886`
3. Deve receber resposta automática do FlowCloser!

