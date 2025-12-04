# 📦 Sistema MIO - Migrado para Repositório Dedicado

## ⚠️ Importante

Todo o conteúdo do **Sistema MIO (Modelo de Identidade Operacional)** foi migrado para um repositório dedicado.

**Novo repositório:** `kauntdewn1/mio-system`  
**URL:** https://github.com/kauntdewn1/mio-system

---

## 📁 O Que Foi Migrado

- ✅ `infra/identities/` - Toda estrutura de identidades
- ✅ Scripts MIO (`register-identity.sh`, `list-identities.sh`, etc.)
- ✅ Documentação completa (MAPA_MIO.md, SISTEMA_MIO.md, etc.)
- ✅ GitHub Actions workflows
- ✅ Templates e guias

---

## 🔄 Para Continuar Trabalhando

**Use o repositório dedicado:**
```bash
cd /Users/nettomello/CODIGOS/bots_ia/mio-system
```

**Não commite mais nada relacionado ao MIO neste repositório (flowcloser).**

---

## 🗑️ Limpeza Local (Opcional)

Se quiser remover os arquivos locais do flowcloser (eles já estão no mio-system):

```bash
# CUIDADO: Isso remove os arquivos localmente
# Certifique-se de que tudo está no mio-system antes!
rm -rf infra/identities/
rm -f scripts/register-identity.sh scripts/list-identities.sh scripts/create-pr.sh
```

**Ou mantenha localmente** para referência - o `.gitignore` já está configurado para não commitar.

---

**Data da migração:** 2025-12-03  
**Status:** ✅ Migração completa

