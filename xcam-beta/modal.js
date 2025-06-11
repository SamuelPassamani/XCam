/**
 * xcam-beta/modal.js
 *
 * Modal universal do XCam:
 * - Ao clicar em uma transmissão da grade, abre um modal com iframe para https://modal.xcam.gay/?user={username}.
 * - Modal NÃO ocupa tela toda, é centralizado e responsivo.
 * - Fechamento por "X", clique fora ou tecla ESC.
 * - Estrutura criada dinamicamente se não existir no DOM.
 *
 * O modal é totalmente desacoplado dos dados da grade e dos filtros, funcionando para qualquer card de transmissão exibido.
 * Não carrega info customizada, apenas carrega o iframe de modal do player XCam.
 * Integrado com o fluxo de atualização da grade e reatividade dos filtros.
 *
 * @author SamuelPassamani
 * @ajustes XCam 2025: revisão para robustez, acessibilidade e compatibilidade com grid incremental.
 */

// ==================== VARIÁVEL DE CONTROLE ======================
let currentUsername = null; // Usuário exibido no modal

// ==================== SETUP PRINCIPAL DO MODAL ======================
/**
 * Inicializa listeners globais para abrir e fechar o modal.
 * Chame uma única vez na inicialização do app.
 */
export function setupModal() {
  ensureModalStructure();

  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Abre modal ao clicar num card da grade (usa delegation para funcionamento incremental)
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".broadcast-card");
    if (card && card.dataset.username) {
      openModal(card.dataset.username);
    }
  });

  // Fecha modal ao clicar no overlay (fora do conteúdo central)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Fecha pelo botão X
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

  // Garante acessibilidade: foca modal ao abrir
  document.addEventListener("modal:opened", () => {
    modalContent.setAttribute("tabindex", "-1");
    modalContent.focus();
  });
}

/**
 * Garante que a estrutura base do modal existe no DOM.
 * Cria overlay e container do conteúdo se não existirem.
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
 * Abre o modal, exibindo o player do usuário informado.
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
 * Fecha o modal e limpa o conteúdo do iframe para evitar áudio/vídeo em background.
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
 * Mantido para compatibilidade de interface antiga.
 * @deprecated Não utilizado no modal universal.
 */
export function setModalBroadcasts(data) {
  // Sem uso; legado para integração futura.
}

/*
Resumo dos ajustes/correções (2025):
- Estrutura e listeners desacoplados totalmente dos dados do grid, funcionando para qualquer card exibido.
- Garantia de acessibilidade: foco, ARIA, role, tabindex.
- Compatibilidade com grade incremental, filtros dinâmicos, e reconstrução de cards.
- Modal é centralizado, responsivo e sem dependência de dados externos além do username.
- Sempre limpa o conteúdo ao fechar para evitar vazamentos de mídia/background.
- Pronto para futuras expansões (ex: exibir status, loading, integração com analytics).
*/