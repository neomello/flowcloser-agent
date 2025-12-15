# 🚀 Deploy Necessário - Twilio WhatsApp Webhook

## ⚠️ Problema Identificado

O webhook do Twilio está retornando **404** porque o código ainda não foi deployado no Railway.

**Status:**

- ✅ Código implementado localmente
- ✅ Variáveis configuradas no Railway
- ❌ **Código não deployado no Railway**

---

## 🔧 Solução: Fazer Deploy

### Opção 1: Deploy via Git (Recomendado)

```bash
# 1. Adicionar mudanças
git add src/main.ts package.json docs/setup/

# 2. Commit
git commit -m "feat: adiciona integração Twilio WhatsApp"

# 3. Push (Railway detecta automaticamente e faz deploy)
git push origin main
```

### Opção 2: Deploy Manual via Railway CLI

```bash
# 1. Login
railway login

# 2. Linkar ao projeto
railway link

# 3. Deploy
railway up
```

---

## ⏱️ Após o Deploy

1. **Aguarde 2-3 minutos** para o build completar
2. **Verifique os logs:**

   ```bash
   railway logs --tail
   ```

3. **Teste o webhook:**

   ```bash
   curl -X POST https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp/twilio \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "From=whatsapp:+55628323110&Body=teste&MessageSid=SMtest123&MessageStatus=received"
   ```
   
   **Deve retornar:** `OK` (não mais 404)

4. **Teste enviando mensagem do WhatsApp:**
   - Envie para `+1 415 523 8886`
   - Deve receber resposta automática

---

## ✅ Checklist

- [ ] Código commitado
- [ ] Push realizado
- [ ] Railway detectou o push
- [ ] Build completado
- [ ] Webhook testado (não mais 404)
- [ ] Mensagem do WhatsApp testada

---

## 🎯 Sobre o Número do Sandbox

O número `+1 415 523 8886` é do **Twilio Sandbox** e funciona perfeitamente para desenvolvimento:

**Vantagens:**

- ✅ Funciona imediatamente (após deploy)
- ✅ Sem aprovação de documentos
- ✅ Grátis para testes

**Limitações:**

- ⚠️ Apenas números que enviaram `join shadow-horn.` podem receber
- ⚠️ Janela de 24 horas após última mensagem

**Para usar:**

1. Envie `join shadow-horn.` para `+1 415 523 8886`
2. Aguarde confirmação
3. Envie mensagens normalmente

**Para produção depois:**

- Solicite número WhatsApp Business verificado
- Requer aprovação de documentos
- Pode demorar dias/semanas

---

## 📝 Próximos Passos

1. **Faça o deploy** (commit + push)
2. **Aguarde build** (2-3 minutos)
3. **Teste o webhook** (curl acima)
4. **Envie mensagem do WhatsApp** para `+1 415 523 8886`
5. **Deve funcionar!** 🎉

