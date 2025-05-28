/**
 * XCam - filters.js
 * Gerenciamento dos filtros de busca na interface, integração modular com broadcasts.js e UX consistente.
 * -----------------------------------------------------------------------------
 * - Captura, normaliza e aplica filtros de país, gênero, orientação, tags, etc.
 * - Compatível com o novo padrão visual e UX do modal.html/style.css.
 * - Modular, limpo, preparado para extensão futura de filtros.
 * - Comentários explicativos para onboarding e manutenção.
 */

import { reverseTranslate, getCountryCode } from "./translations-reverse.js";
import { applyBroadcastFilters } from "./broadcasts.js";

/**
 * Configura listeners de filtros e aplica-os na grade de transmissões.
 * O botão de filtro coleta valores, normaliza para o formato esperado pela API/backend,
 * e dispara atualização de transmissões.
 */
export function setupFilters() {
  const button = document.getElementById("apply-filters");

  // (Opcional: campos extras, se implementar minViewers/tags)
  // const minViewersInput = document.getElementById("min-viewers");
  // const tagsInput = document.getElementById("tags");

  button.addEventListener("click", () => {
    // Captura valores dos campos do filtro
    const genderLabel = document.getElementById("gender-filter").value;
    const orientationLabel = document.getElementById("orientation-filter").value;
    const countryLabel = document.getElementById("country-filter").value;

    // Se quiser expandir para minViewers/tags, descomente acima.
    // const minViewers = minViewersInput ? minViewersInput.value : null;
    // const tags = tagsInput ? tagsInput.value : "";

    const filters = {};

    // Gênero (transformar label para valor aceito pela API)
    const genderValue = reverseTranslate("gender", genderLabel);
    if (genderValue && genderValue !== "all") filters.gender = genderValue;

    // Orientação sexual (também transformar label)
    const orientationValue = reverseTranslate("sexPreference", orientationLabel);
    if (orientationValue && orientationValue !== "all") filters.orientation = orientationValue;

    // País (converter label para código ISO)
    const countryValue = getCountryCode(countryLabel);
    if (countryValue && countryValue !== "all") filters.country = countryValue;

    // (Opcional) Número mínimo de viewers
    // if (minViewers && !isNaN(parseInt(minViewers, 10))) {
    //   filters.minViewers = parseInt(minViewers, 10);
    // }

    // (Opcional) Tags, normalizadas em array
    // if (tags && typeof tags === "string") {
    //   filters.tags = tags
    //     .split(",")
    //     .map((t) => t.trim().toLowerCase())
    //     .filter((t) => !!t);
    // }

    // Aplica filtros na grade de transmissões (broadcasts.js)
    applyBroadcastFilters(filters);
  });
}

/**
 * EXPLICAÇÕES DOS AJUSTES:
 * - Normalização dos valores dos filtros para evitar inconsistências
 * - Pronto para expansão futura (minViewers, tags, outros campos)
 * - Função desacoplada, fácil de testar e integrar com outros módulos
 * - Garantido alinhamento visual e de UX com os novos padrões da interface (modal.html/style.css)
 */