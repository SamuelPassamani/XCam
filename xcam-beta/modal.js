/**
 * xcam-beta/modal.js
 *
 * Modal universal do XCam:
 * - Abre ao clicar em qualquer card de transmissão da grade (broadcasts.js).
 * - Exibe um iframe com o player XCam: https://modal.xcam.gay/?user={username}
 * - Modal centralizado, responsivo, acessível (tecla ESC, overlay, botão X).
 * - Estrutura desacoplada: não depende dos dados do grid ou dos filtros.
 * - Integrado ao fluxo de atualização incremental da grade, sem dependências de fetchs individuais.
 *
 * @author SamuelPassamani
 * @ajustes XCam 2025: compatível com grade incremental, modularidade e UX.
 */

// ========== VARIÁVEL DE CONTROLE ==========
let currentUsername = null; // Usuário atualmente exibido no modal

// ========== FUNÇÃO PRINCIPAL DE SETUP ==========
/**
 * Inicializa listeners globais para abrir e fechar o modal.
 * Chame uma única vez na inicialização do app (main.js).
 * Compatível com cards adicionados dinamicamente (delegação de eventos).
 */
export function setupModal() {
  ensureModalStructure();

  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Ao clicar em um card de transmissão da grade, abre o modal
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".broadcast-card");
    if (card && card.dataset.username) {
      openModal(card.dataset.username);
    }
  });

  // Fecha ao clicar no overlay fora do conteúdo do modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Fecha pelo botão "X"
  modalContent.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("modal-close") ||
      e.target.closest(".modal-close")
    ) {
      closeModal();
    }
  });

  // Fecha ao pressionar ESC (acessibilidade)
  document.addEventListener("keydown", (e) => {
    if (
      modal.classList.contains("active") &&
      (e.key === "Escape" || e.key === "Esc")
    ) {
      closeModal();
    }
  });

  // Acessibilidade: foca modal ao abrir
  document.addEventListener("modal:opened", () => {
    modalContent.setAttribute("tabindex", "-1");
    modalContent.focus();
  });
}

/**
 * Garante que a estrutura base do modal exista no DOM.
 * Cria overlay e container de conteúdo se não existirem.
 */
function ensureModalStructure() {
  if (!document.getElementById("broadcast-modal")) {
    const modal = document.createElement("div");
    modal.id = "broadcast-modal";
    modal.className = "modal-overlay";
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("role", "dialog");
    modal.style.display = "none";
    modal.innerHTML = `<div id="modal-content" class="modal-content" tabindex="-1"></div>`;
    document.body.appendChild(modal);
  }
}

/**
 * Abre o modal, exibindo o iframe com o player do usuário informado.
 * @param {string} username - Username da transmissão.
 */
function openModal(username) {
  currentUsername = username;
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Renderiza botão X e iframe centralizado
  modalContent.innerHTML = `
    <button class="modal-close" title="Fechar (ESC)" aria-label="Fechar modal">
      <span aria-hidden="true">&times;</span>
    </button>
    <div class="modal-iframe-container">
      <iframe
        src="https://modal.xcam.gay/?user=${encodeURIComponent(username)}"
        frameborder="0"
        allowfullscreen
        class="modal-iframe"
        title="Live de @${username}">
      </iframe>
    </div>
  `;

  // Ativa o modal e impede scroll do fundo
  modal.style.display = "flex";
  setTimeout(() => {
    modal.classList.add("active");
    document.body.classList.add("modal-open");
    modalContent.focus();
    // Evento custom para acessibilidade
    document.dispatchEvent(new CustomEvent("modal:opened"));
  }, 10);
  modalContent.scrollTop = 0;
}

/**
 * Fecha o modal e limpa o conteúdo do iframe para evitar mídia em background.
 */
function closeModal() {
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    modalContent.innerHTML = "";
    currentUsername = null;
    modal.style.display = "none";
  }, 300); // Aguarda transição (se houver)
}

/**
 * Compatibilidade com interface antiga (mantido para legado, não utilizado).
 * @deprecated
 */
export function setModalBroadcasts(data) {
  // Sem uso; legado para integração futura.
}

/*
Resumo das melhorias/correções (2025):
- Completamente integrado ao fluxo otimizado da grade: funciona para qualquer card, mesmo os adicionados dinamicamente.
- Modal centralizado, responsivo, totalmente acessível (foco, ARIA, role, tabindex, ESC, overlay, botão X).
- Sem dependência de dados externos além do username.
- Sempre limpa o conteúdo ao fechar, evitando vazamento de mídia/background.
- Pronto para novas features (status, analytics, loading, etc).
*/