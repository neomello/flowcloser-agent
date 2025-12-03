# ⚙️ Configuração no Meta Developer Console - FlowCloser v1.2

## ✅ O que já está pronto

- ✅ Webhook Instagram configurado (`/api/webhooks/instagram`)
- ✅ Webhook WhatsApp configurado (`/api/webhooks/whatsapp`)
- ✅ OAuth Callback configurado (`/api/auth/instagram/callback`)
- ✅ Privacy Policy criada (`/privacy-policy`)
- ✅ Terms of Service criados (`/terms-of-service`)
- ✅ Deploy no Railway funcionando
- ✅ Sistema de logs implementado
- ✅ Integração visual (Canva) implementada

---

## 📋 Passo a Passo para Configurar no Meta Developer

### 1. Acessar o Meta Developer Console

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu App:
   - **App ID Principal:** `1338892407681784`
   - **Instagram App ID:** `2706639773011042`
   - **Instagram:** neoflowoff.eth
   - **Nome do App:** flowcloser_webhook_neo-IG

### 2. Configurar Webhook do Instagram

1. Vá em **Produtos** → **Instagram** → **Configurações**
2. Role até **Webhooks**
3. Clique em **Configurar Webhooks** ou **Editar**
4. Preencha:
   - **URL do Callback**: `https://flowcloser-agent-production.up.railway.app/api/webhooks/instagram`
   - **Token de Verificação**: `flowcloser_webhook_neo`
   - **Campos de Assinatura**: Marque `messages`
5. **Sobre Certificado de Cliente:**
   - ⚠️ Meta pode pedir certificado de cliente (mTLS)
   - Railway não suporta mTLS diretamente
   - **Solução:** Configure sem certificado inicialmente (use token como segurança)
   - O código já está preparado para verificar certificado quando disponível
   - Veja `META_CLIENT_CERTIFICATE.md` para mais detalhes
6. Clique em **Verificar e Salvar**
7. Meta vai fazer uma requisição GET para verificar - deve retornar sucesso ✅

### 3. Configurar OAuth Redirect URI

1. Ainda em **Instagram** → **Configurações**
2. Role até **OAuth Redirect URIs**
3. Adicione:
   ```
   https://flowcloser-agent-production.up.railway.app/api/auth/instagram/callback
   ```
4. Clique em **Salvar Alterações**

### 4. Adicionar Páginas Legais (OBRIGATÓRIO)

1. Vá em **App Review** → **Permissions and Features**
2. Ou vá em **Configurações** → **Básico**
3. Role até **Páginas Legais**
4. Preencha:
   - **URL da Política de Privacidade**: 
     ```
     https://flowcloser-agent-production.up.railway.app/privacy-policy
     ```
   - **URL dos Termos de Serviço**: 
     ```
     https://flowcloser-agent-production.up.railway.app/terms-of-service
     ```
5. Clique em **Salvar Alterações**

### 5. Configurar Permissões do Instagram

1. Vá em **Produtos** → **Instagram** → **Permissões**
2. Solicite as permissões necessárias:
   - `instagram_basic` (já deve estar ativa)
   - `instagram_manage_messages` (para enviar mensagens)
   - `pages_show_list` (para listar páginas)
   - `pages_messaging` (para mensagens)

### 6. Configurar Webhook do WhatsApp

1. Vá em **Produtos** → **WhatsApp** → **Configuração**
2. Role até **Webhooks**
3. Clique em **Configurar Webhooks** ou **Editar**
4. Preencha:
   - **URL do Callback**: `https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp`
   - **Token de Verificação**: `flowcloser_webhook_neo` (mesmo do Instagram)
   - **Campos de Assinatura**: Marque `messages`
5. Clique em **Verificar e Salvar**
6. Meta vai fazer uma requisição GET para verificar - deve retornar sucesso ✅

**Nota:** Para WhatsApp funcionar completamente, você também precisa:
- Configurar número de telefone do WhatsApp Business
- Obter token de acesso do WhatsApp Business API
- Configurar webhook no WhatsApp Business Manager

### 7. Testar os Webhooks

**Instagram:**
1. No Meta Developer Console, vá em **Webhooks**
2. Clique em **Testar** ao lado do webhook do Instagram
3. Meta vai enviar um evento de teste
4. Verifique os logs do Railway para confirmar que recebeu

**WhatsApp:**

1. No WhatsApp Business Manager, vá em **API Setup**
2. Clique em **Test** ao lado do webhook
3. Verifique os logs do Railway

### 8. Configurar Permissões Adicionais (WhatsApp)

1. Vá em **Produtos** → **WhatsApp** → **Permissões**
2. Solicite as permissões necessárias:
   - `whatsapp_business_messaging` (para enviar mensagens)
   - `whatsapp_business_management` (para gerenciar conta)

### 9. Submeter para Revisão (se necessário)

Se você precisa de permissões adicionais:

1. Vá em **App Review** → **Permissions and Features**
2. Selecione as permissões que precisa
3. Preencha o formulário de revisão:
   - **Como você usa essa permissão?**: Descreva o uso do bot
   - **Instruções para o revisor**: Como testar o bot
   - **Screenshots/Vídeos**: Mostre o fluxo funcionando
4. Clique em **Enviar para Revisão**

---

## 🔗 URLs Importantes

### Produção (Railway)

- **Base URL**: `https://flowcloser-agent-production.up.railway.app`
- **Health Check**: `https://flowcloser-agent-production.up.railway.app/health`
- **Webhook Instagram**: `https://flowcloser-agent-production.up.railway.app/api/webhooks/instagram`
- **Webhook WhatsApp**: `https://flowcloser-agent-production.up.railway.app/api/webhooks/whatsapp`
- **API Direta**: `https://flowcloser-agent-production.up.railway.app/api/agents/flowcloser/message`
- **Ghostwriter**: `https://flowcloser-agent-production.up.railway.app/api/agents/flowcloser/ghostwriter`
- **OAuth Callback**: `https://flowcloser-agent-production.up.railway.app/api/auth/instagram/callback`
- **Privacy Policy**: `https://flowcloser-agent-production.up.railway.app/privacy-policy`
- **Terms of Service**: `https://flowcloser-agent-production.up.railway.app/terms-of-service`

### Variáveis de Ambiente Necessárias

Certifique-se de que estas variáveis estão configuradas no Railway:

```env
INSTAGRAM_APP_ID=2706639773011042
INSTAGRAM_APP_SECRET=sua_chave_secreta
INSTAGRAM_REDIRECT_URI=https://flowcloser-agent-production.up.railway.app/api/auth/instagram/callback
WEBHOOK_VERIFY_TOKEN=flowcloser_webhook_neo
```

---

## ✅ Checklist Final - FlowCloser v1.2

### Instagram

- [ ] Webhook Instagram configurado e verificando com sucesso
- [ ] OAuth Redirect URI adicionado
- [ ] Permissões solicitadas (`instagram_manage_messages`, `pages_messaging`)
- [ ] Webhook recebendo eventos de teste

### WhatsApp

- [ ] Webhook WhatsApp configurado e verificando com sucesso
- [ ] Número do WhatsApp Business configurado
- [ ] Token de acesso do WhatsApp Business API obtido
- [ ] Permissões solicitadas (`whatsapp_business_messaging`)

### Geral

- [ ] Privacy Policy URL configurada e acessível
- [ ] Terms of Service URL configurada e acessível
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] Servidor rodando e acessível publicamente
- [ ] Health check respondendo (`/health`)
- [ ] Todos os endpoints testados manualmente

### Variáveis de Ambiente no Railway

Certifique-se de que estas variáveis estão configuradas:

```env
# Meta/Instagram
INSTAGRAM_APP_ID=2706639773011042
INSTAGRAM_APP_SECRET=f8a59233ba3f6df301b5f08fd8b3067f
INSTAGRAM_REDIRECT_URI=https://flowcloser-agent-production.up.railway.app/api/auth/instagram/callback
WEBHOOK_VERIFY_TOKEN=flowcloser_webhook_neo

# WhatsApp (quando configurar)
WHATSAPP_ACCESS_TOKEN=seu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id_aqui
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_id_aqui

# IQAI
IQAI_API_KEY=97a16a55-05f0-4a39-826e-fe09cef13a53
AGENT_TOKEN_CONTRACT=0x6C3E3a7aE71AFaf30C89471Cf3080b62a1ad41E4

# LLM
LLM_MODEL=gpt-4o-mini
LLM_MODEL_FALLBACK=gemini-2.5-flash
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIzaSy...

# Portfolio Visual
PORTFOLIO_URL=https://www.canva.com/design/DAG4sWWGiv8/...
```

---

## 🧪 Testar Localmente (Opcional)

Se quiser testar localmente antes de fazer deploy:

1. Use ngrok ou similar para expor localhost:
   ```bash
   ngrok http 8042
   ```

2. Use a URL do ngrok no Meta Developer Console temporariamente

3. Após testes, atualize para a URL do Railway

---

## 🚨 Troubleshooting

### Webhook não verifica

- Verifique se o `WEBHOOK_VERIFY_TOKEN` está correto
- Verifique se o endpoint retorna o `challenge` como texto (não JSON)
- Verifique os logs do Railway

### Privacy Policy não aparece

- Verifique se a URL está acessível publicamente
- Verifique se não há redirecionamentos
- Teste a URL no navegador

### OAuth não funciona

- Verifique se o `INSTAGRAM_REDIRECT_URI` está exatamente igual no console
- Verifique se o `INSTAGRAM_APP_SECRET` está correto
- Verifique os logs do servidor

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs do Railway: `railway logs`
2. Teste os endpoints manualmente com `curl`
3. Verifique a documentação do Meta: https://developers.facebook.com/docs/instagram-api/

