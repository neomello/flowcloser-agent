# 🎯 Guia Final - Configuração Meta Developer Console

**Documento Principal:** Use `CONFIGURACAO_META.md`  
**Guia Detalhado:** Use `GUIA_META_STEP_BY_STEP.md` (se precisar de mais detalhes)

---

## 📋 Checklist Rápido - O Que Fazer AGORA

### ✅ 1. Páginas Legais (JÁ FEITO)
- ✅ Privacy Policy: https://flowcloser-agent-production.up.railway.app/privacy-policy
- ✅ Terms of Service: https://flowcloser-agent-production.up.railway.app/terms-of-service

### ⚠️ 2. Adicionar Token no Railway (URGENTE)
1. Acesse: https://railway.com/project/95ed3bcd-2e20-4477-b50c-43cd9ec04c41
2. Vá em **Variables**
3. Adicione:
   ```
   INSTAGRAM_ACCESS_TOKEN=EAATBty5aMvgBQJ2TA3v1ZA9Wcz9UhxYOy52scwii3NNyZAptPzBijofPydBA7pKk4TOVtLBugFeaYJgYQwiuCrIM6AgkKToaOkojqDkFOdkhA7Qs8l4DZCrZBEcwsnNXwiUYEFT6qoPZAcxeZCetYD2mpIxrKffHMgdhdKIwR7RZADGEXfl9EAoErMHP9PPiJ5FZCLir36NZB
   ```
4. Clique em **Save**

### 📱 3. Configurar no Meta Developer Console

#### Passo 1: Acessar o Console
1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu App (ID: `2706639773011042`)

#### Passo 2: Adicionar Páginas Legais
1. Vá em **Configurações** → **Básico**
2. Role até **Páginas Legais**
3. Adicione:
   - **Privacy Policy URL**: 
     ```
     https://flowcloser-agent-production.up.railway.app/privacy-policy
     ```
   - **Terms of Service URL**: 
     ```
     https://flowcloser-agent-production.up.railway.app/terms-of-service
     ```
4. Clique em **Salvar Alterações**

#### Passo 3: Configurar Webhook Instagram
1. Vá em **Produtos** → **Instagram** → **Configurações**
2. Role até **Webhooks**
3. Clique em **Configurar Webhooks** ou **Editar**
4. Preencha:
   - **URL do Callback**: 
     ```
     https://flowcloser-agent-production.up.railway.app/api/webhooks/instagram
     ```
   - **Token de Verificação**: 
     ```
     flowcloser_webhook_neo
     ```
   - **Campos de Assinatura**: ✅ Marque `messages`
5. Clique em **Verificar e Salvar**
6. ✅ Meta vai verificar automaticamente - deve aparecer "Verificado"

#### Passo 4: Configurar OAuth Redirect URI
1. Ainda em **Instagram** → **Configurações**
2. Role até **OAuth Redirect URIs**
3. Adicione:
   ```
   https://flowcloser-agent-production.up.railway.app/api/auth/instagram/callback
   ```
4. Clique em **Salvar Alterações**

#### Passo 5: Testar Webhook
1. No Meta Developer Console, vá em **Webhooks**
2. Clique em **Testar** ao lado do webhook do Instagram
3. Meta vai enviar um evento de teste
4. Verifique os logs do Railway:
   ```bash
   railway logs --tail
   ```
5. Você deve ver: `📨 Message from ...` e `✅ Mensagem enviada para ...`

---

## 🔗 URLs Importantes

### Produção
- **Base URL**: https://flowcloser-agent-production.up.railway.app
- **Webhook Instagram**: https://flowcloser-agent-production.up.railway.app/api/webhooks/instagram
- **Privacy Policy**: https://flowcloser-agent-production.up.railway.app/privacy-policy
- **Terms of Service**: https://flowcloser-agent-production.up.railway.app/terms-of-service

### Meta Developer Console
- **Apps**: https://developers.facebook.com/apps/
- **Seu App**: https://developers.facebook.com/apps/2706639773011042

---

## ✅ Checklist Final

### Configuração Básica
- [ ] Token adicionado no Railway (`INSTAGRAM_ACCESS_TOKEN`)
- [ ] Privacy Policy URL adicionada no Meta Console
- [ ] Terms of Service URL adicionada no Meta Console
- [ ] Webhook Instagram configurado e verificado
- [ ] OAuth Redirect URI configurado

### Testes
- [ ] Webhook verificado com sucesso no Meta Console
- [ ] Teste de webhook enviado e recebido
- [ ] Mensagem de teste processada pelo agente
- [ ] Resposta enviada automaticamente para Instagram

### Produção
- [ ] Servidor rodando e acessível
- [ ] Health check funcionando
- [ ] Todos os endpoints testados

---

## 📚 Documentos Disponíveis

1. **`CONFIGURACAO_META.md`** ⭐ **USE ESTE** - Guia completo e atualizado
2. **`GUIA_META_STEP_BY_STEP.md`** - Guia passo a passo muito detalhado
3. **`META_DEV_CHECKLIST.md`** - Checklist básico (mais antigo)

---

## 🚀 Próximos Passos Após Configuração

1. **Testar com mensagem real** no Instagram
2. **Monitorar logs** para verificar funcionamento
3. **Ajustar prompt** se necessário baseado nas conversas reais
4. **Solicitar permissões adicionais** se necessário (via App Review)

---

**Status:** ✅ Tudo pronto para configurar no Meta Developer Console  
**Documento Recomendado:** `CONFIGURACAO_META.md`

