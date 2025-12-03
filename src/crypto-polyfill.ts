/**
 * Polyfill para crypto - necessário para @iqai/adk no Railway
 * Deve ser importado ANTES de qualquer import do @iqai/adk
 */

import * as nodeCrypto from "node:crypto";

// Garantir que crypto esteja disponível globalmente
if (typeof globalThis.crypto === "undefined") {
	(globalThis as any).crypto = nodeCrypto;
}

// Também garantir que esteja disponível como 'crypto' global
if (typeof (global as any).crypto === "undefined") {
	(global as any).crypto = nodeCrypto;
}

export {};

