// translations-reverse.js

import { translations, countryNames } from "./translations.js";

// Geração de Maps reversos baseados no conteúdo de translations.js

// Reverso de countryNames
export const reverseCountryNames = Object.fromEntries(
  Object.entries(countryNames).map(([code, name]) => [name, code])
);

// Reversos por campo dentro de translations
export const reverseTranslations = {};

for (const [field, map] of Object.entries(translations)) {
  reverseTranslations[field] = Object.fromEntries(
    Object.entries(map).map(([key, value]) => [value, key])
  );
}

// Função para obter o código do país a partir do nome
export function getCountryCode(countryName) {
  return reverseCountryNames[countryName] || countryName.toLowerCase();
}

// Função para obter o valor bruto de um campo traduzido
export function reverseTranslate(field, translatedValue) {
  return reverseTranslations[field]?.[translatedValue] || "unknown";
}
