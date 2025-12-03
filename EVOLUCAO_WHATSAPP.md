# 📊 Análise Comparativa: Projeto Atual vs WhatsApp Bot v2.0

## 🔍 Status Atual do Projeto

### ✅ O que já temos:
- ✅ Express.js configurado
- ✅ Webhook para Instagram Business API
- ✅ OAuth callback para Instagram
- ✅ Agente IQAI ADK configurado
- ✅ Sistema de sessões com SQLite (via ADK)
- ✅ Fallback de modelos LLM (GPT-4o-mini → Gemini)
- ✅ Tools básicas (qualify_lead, create_micro_offer, etc.)
- ✅ Health check endpoint
- ✅ Deploy no Railway

### ❌ O que falta para WhatsApp Bot v2.0:

#### 1. **Integração WhatsApp Business API**
- ❌ Cliente WhatsApp API (WhatsAppClient class)
- ❌ Webhook para WhatsApp (`/webhook` GET/POST)
- ❌ Suporte a templates do WhatsApp
- ❌ Marcação de mensagens como lidas

#### 2. **Fluxo Conversacional Estruturado**
- ❌ Sistema de steps (start → name → company → project_type → budget → urgency → contact_preference → process)
- ❌ Validação de respostas por step
- ❌ Gerenciamento de sessão manual (atualmente usa ADK session service)

#### 3. **Sistema de Follow-Up**
- ❌ Fila de follow-ups
- ❌ Cron jobs para follow-ups automáticos
- ❌ Mensagens de follow-up personalizadas

#### 4. **Integrações Web3/Descentralizadas**
- ❌ MCP Router (Kwil, Ceramic, IPFS)
- ❌ Geração de propostas no IPFS
- ❌ Salvamento de leads no Kwil DB
- ❌ Logs no Ceramic Network

#### 5. **Páginas Legais (Obrigatório para Meta)**
- ❌ Privacy Policy (`/privacy-policy`)
- ❌ Terms of Service (`/terms-of-service`)

#### 6. **Dependências Faltantes**
- ❌ `axios` (para chamadas HTTP)
- ❌ `node-cron` (para agendamento de tarefas)
- ❌ `pino` (logger estruturado)
- ❌ `crypto` (já vem com Node.js, mas precisa ser usado)

#### 7. **Variáveis de Ambiente Faltantes**
- ❌ `WHATSAPP_ACCESS_TOKEN`
- ❌ `WHATSAPP_PHONE_NUMBER_ID`
- ❌ `WHATSAPP_BUSINESS_ACCOUNT_ID`
- ❌ `KWIL_PROVIDER`
- ❌ `CERAMIC_NODE`
- ❌ `PINATA_JWT`
- ❌ `DID`
- ❌ `TREASURY_WALLET`

---

## 🎯 Plano de Evolução

### Fase 1: Adicionar Suporte WhatsApp (Essencial para Meta Dev)
**Prioridade: ALTA** ⚠️

1. Criar `src/services/whatsapp-client.ts`
2. Adicionar endpoints `/webhook` (GET e POST)
3. Adicionar variáveis de ambiente do WhatsApp
4. Testar webhook verification

### Fase 2: Implementar Fluxo Conversacional
**Prioridade: ALTA** ⚠️

1. Criar `src/flows/conversation-flow.ts` com os steps
2. Criar `src/services/session-manager.ts` (ou adaptar ADK session)
3. Implementar validação de respostas
4. Integrar com WhatsApp Client

### Fase 3: Sistema de Follow-Up
**Prioridade: MÉDIA**

1. Adicionar `node-cron` ao projeto
2. Criar `src/services/follow-up-manager.ts`
3. Implementar fila de follow-ups
4. Criar mensagens de follow-up

### Fase 4: Páginas Legais (Obrigatório para Meta)
**Prioridade: ALTA** ⚠️

1. Criar endpoint `/privacy-policy`
2. Criar endpoint `/terms-of-service`
3. Adicionar links no Meta Developer Console

### Fase 5: Integrações Web3 (Opcional)
**Prioridade: BAIXA**

1. Criar `src/core/mcp-router.ts` (se necessário)
2. Integrar com Kwil DB
3. Integrar com IPFS (Pinata)
4. Integrar com Ceramic Network

---

## 📋 Checklist para Aprovação no Meta Developer

### ✅ Requisitos Obrigatórios:

- [ ] **Webhook configurado e funcionando**
  - [ ] GET `/webhook` com verificação (`hub.verify_token`)
  - [ ] POST `/webhook` recebendo mensagens
  - [ ] Resposta rápida (< 20 segundos)

- [ ] **Privacy Policy**
  - [ ] Endpoint `/privacy-policy` acessível publicamente
  - [ ] Conteúdo em português (ou idioma do público-alvo)
  - [ ] Informações sobre coleta de dados
  - [ ] Conformidade com LGPD

- [ ] **Terms of Service**
  - [ ] Endpoint `/terms-of-service` acessível publicamente
  - [ ] Conteúdo em português
  - [ ] Termos de uso do serviço

- [ ] **WhatsApp Business API**
  - [ ] Token de acesso configurado
  - [ ] Phone Number ID configurado
  - [ ] Business Account ID configurado
  - [ ] Webhook URL configurada no Meta Developer Console

- [ ] **Testes**
  - [ ] Webhook verification funcionando
  - [ ] Recebimento de mensagens funcionando
  - [ ] Envio de mensagens funcionando
  - [ ] Templates aprovados (se usar)

---

## 🚀 Próximos Passos Recomendados

1. **Imediato**: Implementar Fase 1 (WhatsApp) e Fase 4 (Páginas Legais)
2. **Curto Prazo**: Implementar Fase 2 (Fluxo Conversacional)
3. **Médio Prazo**: Implementar Fase 3 (Follow-Up)
4. **Longo Prazo**: Implementar Fase 5 (Web3) se necessário

---

## ⚠️ Observações Importantes

1. **Instagram vs WhatsApp**: O projeto atual usa Instagram, mas o código passado é para WhatsApp. Você precisa decidir:
   - Manter ambos (Instagram + WhatsApp)?
   - Migrar apenas para WhatsApp?
   - Criar dois bots separados?

2. **ADK Session vs Manual Session**: O código passado usa sessões manuais, mas o projeto atual usa ADK session service. Precisamos decidir qual abordagem seguir ou como integrar.

3. **MCP Router**: O código passado usa um `MCPRouter` customizado que não existe no projeto atual. Isso precisa ser criado ou adaptado.

4. **Meta Developer Console**: Para aprovar o app, você precisa:
   - Configurar o webhook URL no console
   - Adicionar Privacy Policy URL
   - Adicionar Terms of Service URL
   - Testar o webhook
   - Submeter para revisão

---

## 📝 Decisões Necessárias

Antes de começar a implementação, precisamos decidir:

1. **Canal**: Instagram, WhatsApp ou ambos?
2. **Sessões**: Usar ADK session service ou criar manual?
3. **Fluxo**: Conversacional estruturado (como código passado) ou deixar o agente livre?
4. **Web3**: Implementar integrações Web3 agora ou depois?
5. **Follow-Up**: Implementar sistema de follow-up agora ou depois?

