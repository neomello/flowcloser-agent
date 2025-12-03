# 🔒 Certificado de Cliente - Meta Webhooks

**App ID:** 1338892407681784  
**Instagram App ID:** 2706639773011042  
**Instagram:** neoflowoff.eth

---

## ⚠️ Situação Atual

O Meta está pedindo para **anexar um certificado de cliente** às requisições de webhook. Isso é uma medida de segurança adicional (mTLS - mutual TLS).

---

## 🎯 Solução para Railway

**Railway não suporta configuração direta de mTLS no nível do Nginx.**

### O Que Foi Implementado:

✅ **Código preparado** para verificar certificado quando disponível  
✅ **Verificação de token** como segurança primária (funciona sempre)  
✅ **Verificação de certificado** como segurança adicional (quando disponível)

---

## 📋 O Que Fazer no Meta Developer Console

### Opção 1: Configurar SEM Certificado (Recomendado para Railway)

1. **Configure o webhook normalmente:**
   - URL: `https://flowcloser-agent-production.up.railway.app/api/webhooks/instagram`
   - Token: `flowcloser_webhook_neo`
   - Campos: `messages`

2. **Sobre o certificado:**
   - Se o Meta permitir, **pule a configuração de certificado** por enquanto
   - Use apenas o **token de verificação** como segurança
   - O código já está preparado para verificar certificado quando disponível

3. **Clique em "Verificar e Salvar"**
   - Meta vai fazer uma requisição GET
   - Deve funcionar mesmo sem certificado configurado

### Opção 2: Se Meta Exigir Obrigatoriamente

Se o Meta **não permitir** configurar sem certificado:

**Soluções possíveis:**

1. **Usar Proxy com mTLS:**
   - Cloudflare (não suporta mTLS diretamente)
   - AWS API Gateway com mTLS
   - Nginx próprio com configuração customizada

2. **Migrar Infraestrutura:**
   - AWS Application Load Balancer (ALB) com mTLS
   - Google Cloud Load Balancer com mTLS
   - Outros serviços que suportam mTLS nativamente

---

## 🔍 Como Verificar se Funcionou

### 1. No Meta Console:
- Clique em **Verificar e Salvar**
- Deve aparecer "Webhook verificado" ✅

### 2. Testar Webhook:
- Clique em **Testar** no Meta Console
- Verifique logs do Railway:
  ```bash
  railway logs --tail
  ```
- Deve aparecer: `📨 Message from ...`

---

## 📝 Nota Importante

**A verificação de token (`WEBHOOK_VERIFY_TOKEN`) é suficiente** para segurança básica dos webhooks. O certificado de cliente é uma camada adicional de segurança que o Meta está recomendando, mas pode não ser obrigatório para todos os casos.

**Se o Meta aceitar a configuração sem certificado**, você pode:
- Usar normalmente com apenas o token
- Adicionar certificado depois se necessário
- Migrar para infraestrutura que suporta mTLS quando escalar

---

## ✅ Status

- ✅ Código preparado para verificar certificado
- ✅ Verificação de token funcionando
- ⚠️ Railway não suporta mTLS diretamente
- 💡 Configure webhook normalmente e veja se Meta aceita sem certificado

---

**Recomendação:** Tente configurar o webhook normalmente. Se o Meta aceitar sem certificado, está tudo certo. Se não aceitar, considere as opções acima.

