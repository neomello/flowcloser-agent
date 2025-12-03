# 🔒 Configuração de Certificado de Cliente - Meta Webhooks

**App ID:** 1338892407681784  
**Instagram App ID:** 2706639773011042  
**Instagram:** neoflowoff.eth  
**Nome do App:** flowcloser_webhook_neo-IG

---

## 📋 O Que o Meta Está Pedindo

O Meta está exigindo **verificação de certificado de cliente (mTLS)** para aumentar a segurança dos webhooks. Isso significa que:

1. Meta envia um certificado de cliente nas requisições
2. Seu servidor deve verificar esse certificado
3. O Common Name (CN) deve ser: `client.webhooks.fbclientcerts.com`

---

## ⚠️ Limitação do Railway

**Railway não permite configuração direta de mTLS no nível do Nginx.**

**Solução:** Verificar o certificado no código da aplicação Express.js.

---

## ✅ Solução Implementada

### Opção 1: Verificação no Código (Recomendado para Railway)

O código foi atualizado para verificar o certificado do cliente quando disponível.

**Como funciona:**
- Railway recebe a requisição HTTPS do Meta
- Express.js verifica o certificado do cliente (se disponível)
- Valida o CN: `client.webhooks.fbclientcerts.com`

### Opção 2: Configuração Manual (Se Railway Suportar)

Se o Railway permitir configuração de Nginx customizado:

1. Baixar certificado raiz da DigiCert
2. Configurar Nginx para verificar certificado de cliente
3. Verificar CN no código

---

## 🔧 Implementação no Código

O código já foi atualizado para verificar o certificado quando disponível através do header `X-Client-Certificate` ou variável de ambiente do Railway.

---

## 📝 Configuração no Meta Developer Console

### Passo 1: Configurar Webhook

1. Acesse: https://developers.facebook.com/apps/1338892407681784
2. Vá em **Produtos** → **Instagram** → **Configurações**
3. Role até **Webhooks**
4. Configure:
   - **URL do Callback**: `https://flowcloser-agent-production.up.railway.app/api/webhooks/instagram`
   - **Token de Verificação**: `flowcloser_webhook_neo`
   - **Campos de Assinatura**: ✅ `messages`

### Passo 2: Sobre o Certificado de Cliente

**IMPORTANTE:** O Railway pode não expor o certificado do cliente diretamente para a aplicação.

**Opções:**

#### Opção A: Pular Verificação de Certificado (Temporário)
- O Meta pode permitir configurar sem certificado inicialmente
- Você pode adicionar depois quando tiver infraestrutura adequada
- Use a verificação de token (`WEBHOOK_VERIFY_TOKEN`) como segurança primária

#### Opção B: Usar Proxy/Reverse Proxy
- Configurar um proxy (ex: Cloudflare) que faça a verificação mTLS
- Proxy encaminha para Railway com header customizado
- Aplicação verifica o header

#### Opção C: Migrar para Infraestrutura que Suporta mTLS
- AWS ALB com mTLS
- Nginx próprio com configuração customizada
- Outros serviços que suportam mTLS nativamente

---

## 🚨 Recomendação Imediata

**Para finalizar a configuração AGORA:**

1. **Configure o webhook normalmente** (sem certificado por enquanto)
2. **Use o token de verificação** (`flowcloser_webhook_neo`) como segurança primária
3. **Meta pode aceitar** a configuração sem certificado inicialmente
4. **Adicione certificado depois** se necessário ou quando migrar infraestrutura

**O código já está preparado** para verificar certificado quando disponível, mas Railway pode não expor essa informação.

---

## 📋 Checklist de Configuração

### No Meta Developer Console:
- [ ] Webhook URL configurado
- [ ] Token de verificação configurado
- [ ] Campos de assinatura marcados (`messages`)
- [ ] Webhook verificado com sucesso
- [ ] Certificado de cliente (opcional por enquanto)

### No Railway:
- [ ] `INSTAGRAM_ACCESS_TOKEN` adicionado
- [ ] `WEBHOOK_VERIFY_TOKEN` configurado
- [ ] Servidor rodando e acessível
- [ ] HTTPS funcionando (Railway já fornece)

---

## 🔍 Verificar se Funcionou

1. **No Meta Console:**
   - Clique em **Verificar e Salvar** no webhook
   - Deve aparecer "Verificado" ✅

2. **Testar Webhook:**
   - Clique em **Testar** no Meta Console
   - Verifique logs do Railway:
     ```bash
     railway logs --tail
     ```
   - Deve aparecer: `📨 Message from ...`

---

## 💡 Nota Importante

**Railway usa HTTPS automático**, mas pode não expor certificados de cliente para a aplicação. A verificação de token (`WEBHOOK_VERIFY_TOKEN`) é suficiente para segurança básica.

Se o Meta **exigir obrigatoriamente** o certificado de cliente, você pode precisar:
- Migrar para infraestrutura que suporta mTLS (AWS, GCP, etc.)
- Ou usar um proxy intermediário que faça a verificação

---

**Status:** ✅ Código preparado para verificação de certificado  
**Recomendação:** Configure webhook normalmente e adicione certificado depois se necessário

