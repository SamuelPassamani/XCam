/**
 * a11y.js — utilitário de acessibilidade para XCam
 * Funções para facilitar a implementação de boas práticas de acessibilidade em componentes JS.
 */

/**
 * Força foco visível ao elemento fornecido.
 * @param {HTMLElement} el 
 */
export function focusElement(el) {
  if (el && typeof el.focus === "function") {
    el.focus({ preventScroll: true });
  }
}

/**
 * Garante que apenas elementos dentro do container sejam focáveis (trap focus).
 * Ideal para modais/dialogs.
 * Retorna função para desfazer o trap.
 * 
 * @param {HTMLElement} container 
 * @returns {Function} untrap - função para remover o trap focus
 */
export function trapFocus(container) {
  if (!container) return () => {};
  const focusableSelectors = [
    "a[href]", "area[href]", "input:not([disabled])", "select:not([disabled])",
    "textarea:not([disabled])", "button:not([disabled])", "iframe", "object",
    "embed", "[contenteditable]", "[tabindex]:not([tabindex='-1'])"
  ];
  const focusableEls = container.querySelectorAll(focusableSelectors.join(","));
  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];

  function handleTab(e) {
    if (e.key !== "Tab") return;
    if (focusableEls.length === 0) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else { // Tab
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }
  container.addEventListener("keydown", handleTab);

  // Foca no primeiro elemento focável ao abrir
  focusElement(firstEl);

  // Retorna função para remover trap
  return function untrap() {
    container.removeEventListener("keydown", handleTab);
  };
}

/**
 * Define atributos ARIA em um elemento de forma segura.
 * @param {HTMLElement} el 
 * @param {Object} ariaAttrs - Exemplo: { "aria-label": "Descrição", role: "button" }
 */
export function setAriaAttributes(el, ariaAttrs = {}) {
  if (!el) return;
  for (const [attr, value] of Object.entries(ariaAttrs)) {
    el.setAttribute(attr, value);
  }
}

/**
 * Marca um elemento como área de status dinâmica, para screen readers.
 * @param {HTMLElement} el 
 * @param {string} politeness - "polite" (default) ou "assertive"
 */
export function markAsStatus(el, politeness = "polite") {
  if (el) {
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", politeness);
  }
}

/**
 * Gera um ID único para uso em elementos interativos.
 * @param {string} [prefix="a11y-"]
 * @returns {string}
 */
export function genA11yId(prefix = "a11y-") {
  return prefix + Math.random().toString(36).substr(2, 9);
}

/**
 * Retorna todos elementos focáveis dentro de um container.
 * @param {HTMLElement} container 
 * @returns {HTMLElement[]}
 */
export function getFocusableElements(container) {
  if (!container) return [];
  const focusableSelectors = [
    "a[href]", "area[href]", "input:not([disabled])", "select:not([disabled])",
    "textarea:not([disabled])", "button:not([disabled])", "iframe", "object",
    "embed", "[contenteditable]", "[tabindex]:not([tabindex='-1'])"
  ];
  return Array.from(container.querySelectorAll(focusableSelectors.join(",")));
}

/**
 * Restaura o foco para o elemento anterior salvo (ex: ao fechar modal).
 * @param {HTMLElement} el 
 */
export function restoreFocus(el) {
  if (el && typeof el.focus === "function") {
    el.focus({ preventScroll: true });
  }
}
