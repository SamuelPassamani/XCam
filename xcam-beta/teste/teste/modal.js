/**
 * xcam-beta/modal.js
 *
 * Modal universal do XCam:
 * - Ao clicar em uma transmissão da grade, abre um modal com iframe para https://modal.xcam.gay/?user={username}.
 * - Modal NÃO ocupa tela toda, é centralizado e responsivo.
 * - Fechamento por "X", clique fora ou tecla ESC.
 * - Estrutura criada dinamicamente se não existir no DOM.
 *
 * NÃO carrega mais info customizada, apenas o iframe.
 *
 * @author SamuelPassamani
 */

// ==================== VARIÁVEIS DE CONTROLE ======================
let currentUsername = null; // Armazena o usuário atualmente exibido no modal

// ==================== FUNÇÕES DE INTEGRAÇÃO (caso necessário) ======================
export function setModalBroadcasts(data) {
  // Mantido para compatibilidade, mas não usado neste modal universal
}

// ==================== SETUP PRINCIPAL DO MODAL ======================
/**
 * Inicializa listeners globais para abrir e fechar o modal.
 * Deve ser chamada uma única vez no início do app.
 */
export function setupModal() {
  // Cria estrutura do modal se ainda não existir
  ensureModalStructure();

  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // 1. Clique em um card de transmissão abre o modal com o iframe correto
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".broadcast-card");
    if (card && card.dataset.username) {
      const username = card.dataset.username;
      openModal(username);
    }
  });

  // 2. Fechar ao clicar no overlay (fora do conteúdo do modal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // 3. Fechar pelo botão X
  modalContent.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("modal-close") ||
      e.target.closest(".modal-close")
    ) {
      closeModal();
    }
  });

  // 4. Fechar ao pressionar ESC
  document.addEventListener("keydown", (e) => {
    if (
      modal.classList.contains("active") &&
      (e.key === "Escape" || e.key === "Esc")
    ) {
      closeModal();
    }
  });
}

/**
 * Garante que a estrutura base do modal existe no DOM.
 * Cria o overlay e o container do conteúdo caso não existam.
 */
function ensureModalStructure() {
  if (!document.getElementById("broadcast-modal")) {
    const modal = document.createElement("div");
    modal.id = "broadcast-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `<div id="modal-content" class="modal-content"></div>`;
    document.body.appendChild(modal);
  }
}

/**
 * Abre o modal, exibindo um iframe da transmissão do usuário informado.
 * @param {string} username - Nome de usuário da transmissão.
 */
function openModal(username) {
  currentUsername = username;
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Renderiza botão X e iframe centralizado (apenas isso!)
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
  modal.classList.add("active");
  document.body.classList.add("modal-open");
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
  }, 300); // aguarda transição (se houver)
}