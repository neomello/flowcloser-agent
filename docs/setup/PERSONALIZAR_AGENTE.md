# 🎯 Como Personalizar o Agente FlowCloser

## 📍 De Onde Vêm as Informações

O agente usa informações de **3 fontes principais**:

### 1. **Instruções Hardcoded** (arquivo `src/agents/flowcloser/agent.ts`)

As instruções principais estão nas linhas **73-222** do arquivo `agent.ts`. Incluem:
- Identidade do agente
- Fluxo de conversa
- Regras de comportamento
- Adaptação por canal
- Segmentação de leads

### 2. **Variáveis de Ambiente** (arquivo `.env`)

Informações dinâmicas que podem ser configuradas:
- `PORTFOLIO_URL` - Link do portfólio visual (Canva)
- `PROPOSAL_TEMPLATE_LINK` - Link do template de proposta
- `LLM_MODEL` - Modelo de IA usado
- Outras configurações

### 3. **Histórico da Conversa** (via Session Service)

O ADK mantém automaticamente o histórico via `sessionService`, mas pode não estar sendo usado perfeitamente.

---

## ⚠️ Problema Identificado: Repetição de Perguntas

Na sua conversa, o agente repetiu perguntas similares:
- "O que você está buscando resolver com seu projeto digital?"
- "O que você precisa resolver com esse projeto digital?"

**Causa:** O histórico pode não estar sendo passado corretamente ou o agente não está seguindo as instruções de não repetir.

---

## 🔧 Como Personalizar

### Opção 1: Adicionar Informações da Empresa no Prompt

Edite o arquivo `src/agents/flowcloser/agent.ts` e adicione informações específicas:

```typescript
let instruction = `
<identity>
Você é o FlowCloser, um closer digital de alta conversão. Você é estratégico, emocional e direto.
Você trabalha para a FlowOff (flowoff.xyz), especializada em presença digital de elite.
</identity>

<company_info>
EMPRESA: FlowOff / NEOFLOW
SITE: flowoff.xyz
ESPECIALIDADE: Sites, PWAs, micro SaaS, webapps de alta qualidade
DIFERENCIAL: Produção de elite, design que converte, arquitetura que escala
</company_info>
...
```

### Opção 2: Melhorar as Instruções de Não-Repetição

No arquivo `agent.ts`, linha **120-130**, você pode tornar as instruções mais específicas:

```typescript
2. DIAGNÓSTICO (3 perguntas - UMA DE CADA VEZ):
   a) "O que você precisa resolver com esse projeto digital?"
   b) "Já tem identidade visual ou vai do zero?"
   c) "Em quanto tempo precisa disso rodando?"
   
   CRÍTICO: 
   - Faça UMA pergunta por vez
   - Espere a resposta antes de fazer a próxima
   - Se o usuário já respondeu algo nas mensagens anteriores, pule essa pergunta
   - Use as respostas anteriores para fazer perguntas mais específicas
   - NUNCA faça perguntas que soam similares - se já perguntou sobre "objetivo", não pergunte sobre "o que precisa resolver"
   - Se o usuário disse "quero atualizar meu site", já sabe o objetivo - pule direto para a próxima pergunta
```

### Opção 3: Adicionar Variáveis de Ambiente para Personalização

Você pode criar variáveis no `.env` para informações da empresa:

```env
# Informações da Empresa
COMPANY_NAME=FlowOff
COMPANY_WEBSITE=flowoff.xyz
COMPANY_EMAIL=privacy@flowoff.xyz
COMPANY_SPECIALTY=Sites, PWAs, micro SaaS, webapps
COMPANY_DIFFERENTIAL=Produção de elite, design que converte
```

E usar no código:

```typescript
const companyName = process.env.COMPANY_NAME || "FlowOff";
const companyWebsite = process.env.COMPANY_WEBSITE || "flowoff.xyz";

let instruction = `
<company_info>
EMPRESA: ${companyName}
SITE: ${companyWebsite}
...
`;
```

---

## 🎯 Melhorias Recomendadas

### 1. Melhorar Detecção de Contexto

O agente precisa entender melhor quando o usuário já respondeu algo. Vou melhorar as instruções:

```typescript
<context_understanding>
CONTEXTO É CRÍTICO - Use o histórico da conversa para manter continuidade:

- SEMPRE leia o histórico antes de responder
- Se o usuário já mencionou algo, NÃO pergunte novamente - use essa informação
- Se o usuário disse "quero atualizar meu site", você JÁ SABE:
  * O objetivo: atualizar site
  * NÃO pergunte "o que você precisa resolver" - ele já disse que quer atualizar
  * Avance para: "Já tem identidade visual ou vai do zero?" ou "Em quanto tempo precisa?"
- Se o usuário disse "nada" ou "não quero", respeite e mude de abordagem imediatamente
- Avance na conversa baseado no que já foi dito - não volte para trás
- Se já fez uma pergunta e recebeu resposta, use essa resposta para fazer a próxima pergunta

REGRAS DE NÃO-REPETIÇÃO (CRÍTICO):
- NUNCA faça a mesma pergunta duas vezes
- NUNCA faça perguntas que soam similares (ex: "o que precisa resolver" e "o que você está buscando resolver")
- NUNCA repita a mesma frase de abertura se já conversaram
- Se já perguntou algo, use a resposta para avançar - não pergunte novamente
- Se o usuário já mencionou interesse em site/projeto, vá direto para diagnóstico ou proposta
- Se o usuário disse "quero atualizar meu site", pule a pergunta sobre objetivo e vá para a próxima
</context_understanding>
```

### 2. Adicionar Informações Específicas da Empresa

Vou adicionar uma seção com informações da FlowOff no prompt.

---

## 📝 O Que Você Quer Personalizar?

Me diga quais informações específicas você quer que o agente use:

1. **Nome da empresa?** (FlowOff, NEOFLOW, etc.)
2. **Serviços específicos?** (sites, PWAs, etc.)
3. **Diferenciais?** (produção de elite, design que converte, etc.)
4. **Links específicos?** (site, portfólio, etc.)
5. **Tom de voz?** (mais formal, mais descontraído, etc.)

Com essas informações, posso atualizar o prompt do agente para usar essas informações e evitar repetições.

---

## 🔍 Sobre o Histórico

O ADK mantém o histórico automaticamente via `sessionService`, mas para garantir que está sendo usado, podemos:

1. **Verificar se o histórico está sendo passado** (o ADK faz isso automaticamente)
2. **Melhorar as instruções** para o agente usar melhor o histórico
3. **Adicionar logs** para ver o que está sendo passado

Quer que eu faça essas melhorias agora?

