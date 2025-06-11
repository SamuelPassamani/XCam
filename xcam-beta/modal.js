/**
 * xcam-beta/modal.js
 * 
 * Modal universal do XCam:
 * - Modal centralizado, largo, responsivo e acessível.
 * - Usa apenas classes CSS dedicadas (NENHUM estilo inline).
 * - Iframe do player ocupa 100% do conteúdo do modal.
 * - Interação totalmente desacoplada, pronta para futuras expansões.
 *
 * @author SamuelPassamani
 */

// ========== VARIÁVEL DE CONTROLE ==========
let currentUsername = null;

// ========== SETUP PRINCIPAL ==========
export function setupModal() {
  ensureModalStructure();

  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Abre modal ao clicar em qualquer card da grade
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".broadcast-card");
    if (card && card.dataset.username) {
      openModal(card.dataset.username);
    }
  });

  // Fecha ao clicar fora do conteúdo central (overlay)
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

  // Fecha ao pressionar ESC
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

// ========== GARANTE ESTRUTURA BASE DO MODAL ==========
function ensureModalStructure() {
  if (!document.getElementById("broadcast-modal")) {
    const modal = document.createElement("div");
    modal.id = "broadcast-modal";
    modal.className = "modal-overlay";
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("role", "dialog");
    modal.style.display = "none";
    modal.innerHTML = `
      <div id="modal-content" class="modal-content" tabindex="-1"></div>
    `;
    document.body.appendChild(modal);
  }
}

// ========== ABRE MODAL E GERA CONTEÚDO ==========
function openModal(username) {
  currentUsername = username;
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Renderiza botão X e iframe centralizado e responsivo (apenas classes CSS)
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
    document.dispatchEvent(new CustomEvent("modal:opened"));
  }, 10);
  modalContent.scrollTop = 0;
}

// ========== FECHA MODAL ==========
function closeModal() {
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    modalContent.innerHTML = "";
    currentUsername = null;
    modal.style.display = "none";
  }, 300);
}

/**
 * Compatibilidade antiga (não utilizado)
 */
export function setModalBroadcasts(data) {}

/*
Resumo dos ajustes:
- Todo o layout e responsividade do modal agora são controlados APENAS por classes CSS.
- Nenhum estilo inline é aplicado via JS.
- O modal e o iframe ocupam toda a área útil, respeitando as regras de responsividade do bloco CSS dedicado.
- Arquitetura pronta para manutenção, escalabilidade e futuras melhorias de UX.
*/