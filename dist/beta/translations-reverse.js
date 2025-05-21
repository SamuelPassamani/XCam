// translations-reverse.js
// Utilitário para tradução reversa dos valores exibidos na UI para os formatos esperados pela API XCam

import { translations, countryNames } from "./translations.js";

/**
 * Gera um mapa reverso de nomes de países para códigos ISO 3166-1 alpha-2.
 * Exemplo: { "Brasil": "br", "Estados Unidos": "us" }
 */
export const reverseCountryNames = Object.fromEntries(
  Object.entries(countryNames).map(([code, name]) => [name, code])
);

/**
 * Gera mapas reversos para cada campo traduzido, a partir de `translations`.
 * Exemplo: { gender: { "Homem": "male", "Mulher": "female" }, ... }
 */
export const reverseTranslations = {};
for (const [field, map] of Object.entries(translations)) {
  reverseTranslations[field] = Object.fromEntries(
    Object.entries(map).map(([slug, label]) => [label, slug])
  );
}

/**
 * Obtém o código do país (ISO 3166-1 alpha-2) a partir do nome apresentado na UI.
 * Se não encontrar, retorna o valor original convertido para minúsculo (fallback).
 *
 * @param {string} countryName - Nome do país exibido na UI (ex: "Brasil")
 * @returns {string} - Código do país (ex: "br")
 */
export function getCountryCode(countryName) {
  if (!countryName) return "";
  return reverseCountryNames[countryName] || countryName.toLowerCase();
}

/**
 * Traduz um label exibido na interface para o valor esperado pela API (slug/código).
 * Se o valor não existir no mapa de traduções, retorna string vazia.
 *
 * @param {string} field - Campo de tradução ("gender", "sexPreference", etc)
 * @param {string} translatedValue - Valor exibido na UI (ex: "Homem")
 * @returns {string} - Valor esperado pela API (ex: "male")
 */
export function reverseTranslate(field, translatedValue) {
  if (!field || !translatedValue) return "";
  return reverseTranslations[field]?.[translatedValue] || "";
}
