// modal.js - Refatorado para padrão visual e comportamental do novo modal

import { getCountryName } from "./translations.js";
import { t } from "./i18n.js";

// Armazena a lista de transmissões para "relacionados" ou uso externo
let allBroadcasts = [];

/**
 * Permite atualizar a lista de transmissões de fora do módulo
 */
export function setModalBroadcasts(data) {
  allBroadcasts = data;
}

/**
 * Inicializa os listeners globais para abrir e fechar o modal
 * - Clique em cards
 * - Clique em fechar
 * - Clique na overlay
 * - Tecla ESC
 */
export function setupModal() {
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Clique em card de transmissão
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".broadcast-card");
    if (card && card.dataset.username) {
      const username = card.dataset.username;

      fetch(`https://api.xcam.gay/user/${username}`)
        .then((res) => res.json())
        .then((broadcast) => {
          if (broadcast?.username) {
            openModal(broadcast);
          } else {
            console.warn("Transmissão não encontrada para username:", username);
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar dados da transmissão:", err);
        });
    }
  });

  // Fechar modal ao clicar na overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Fechar modal via botão (delegação pois botão é renderizado dinamicamente)
  modalContent.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("modal-close") ||
      (e.target.closest("button") && e.target.closest("button").classList.contains("modal-close"))
    ) {
      closeModal();
    }
  });

  // Fechar modal via tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });
}

/**
 * Renderiza o modal com os dados do usuário/transmissão
 * Estrutura e estilos baseados no novo modal.html
 */
function openModal(broadcast) {
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Dados principais
  const {
    username,
    userId,
    profileImageUrl = "",
    countryId = "xx",
    viewers = 0,
    gender = "",
    sexPreference = "",
    group = "",
    tags = [],
    bio = "",
    socials = {}, // Ex: { twitter: "url", instagram: "url" }
  } = broadcast;

  const countryName = getCountryName(countryId);

  // Renderização de tags com clique (exemplo: pode-se adicionar filtro na tag)
  const tagHTML = Array.isArray(tags)
    ? tags
        .map(
          (tag) =>
            `<span class="tag" tabindex="0" title="${tag.name || tag}"
              onclick="window.dispatchEvent(new CustomEvent('modalTagClick', { detail: '${tag.name || tag}' }))">
                #${tag.name || tag}
             </span>`
        )
        .join("")
    : "";

  // Renderização de redes sociais com ícones SVG (exemplo para Twitter e Instagram)
  function renderSocialLinks(socials) {
    const icons = {
      twitter: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M22.46 5.9c-.79.35-1.65.58-2.54.69A4.15 4.15 0 0021.84 4c-.8.48-1.69.83-2.63 1-1.4-1.5-3.77-1.57-5.33-.22C11.32 6.33 11 7.14 11 8c0 .32.03.63.09.93-3.31-.17-6.25-1.75-8.21-4.17-.36.64-.57 1.38-.57 2.17 0 1.5.77 2.82 1.95 3.59-.72-.02-1.4-.22-2-.55v.06c0 2.1 1.48 3.85 3.44 4.25-.36.09-.74.14-1.13.14-.28 0-.55-.03-.81-.08.55 1.71 2.16 2.97 4.06 3a8.33 8.33 0 01-5.14 1.76c-.34 0-.67-.02-1-.06A11.76 11.76 0 007.29 21c7.55 0 11.69-6.26 11.69-11.69 0-.18 0-.36-.01-.53.8-.57 1.5-1.29 2.05-2.11z"/></svg>`,
      instagram: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm6.13.38a1.13 1.13 0 1 1-2.25 0a1.13 1.13 0 0 1 2.25 0z"/></svg>`,
    };
    return Object.entries(socials)
      .map(([key, url]) => {
        if (!icons[key]) return "";
        return `<a href="${url}" class="social-link" target="_blank" rel="noopener" aria-label="${key}">${icons[key]}</a>`;
      })
      .join("");
  }

  // Estrutura do modal conforme o modelo visual
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">
        <span>@${username}</span>
      </h2>
      <button class="modal-close" aria-label="${t("close")}">
        <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#222"/><path d="M7 7l10 10M17 7l-10 10" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="modal-grid">
        <!-- Player (esquerda no desktop) -->
        <div class="modal-player">
          <div class="player-logo">
            <img src="/assets/logo.svg" alt="XCam" width="32" height="32" />
          </div>
          <div class="player-aspect">
            <iframe src="https://player.xcam.gay/?id=${userId}" frameborder="0" allowfullscreen class="player-iframe" loading="lazy"></iframe>
          </div>
        </div>
        <!-- Info (direita no desktop) -->
        <div class="user-info">
          <div class="user-avatar">
            <img src="${profileImageUrl}" alt="@${username}" />
          </div>
          <div class="user-meta">
            <h3>@${username}</h3>
            <div class="user-country">
              <img src="https://flagcdn.com/w20/${countryId}.png" alt="${countryName}" title="${countryName}" />
              <span>${countryName}</span>
            </div>
            <div class="user-viewers">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4C4.5 4 2 12 2 12s2.5 8 10 8 10-8 10-8-2.5-8-10-8zm0 14c-4.42 0-7.54-3.3-8.71-6 1.17-2.7 4.29-6 8.71-6s7.54 3.3 8.71 6c-1.17 2.7-4.29 6-8.71 6zm0-10a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4z"></path></svg>
              <span>${viewers} ${t("viewers")}</span>
            </div>
          </div>
          <div class="user-stats">
            <span title="${t("gender")}"><i class="fas fa-venus-mars"></i> ${t(gender)}</span>
            <span title="${t("orientation")}"><i class="fas fa-heart"></i> ${t(sexPreference)}</span>
            <span title="${t("group")}"><i class="fas fa-users"></i> ${t(group)}</span>
          </div>
          <div class="user-tags">${tagHTML}</div>
          <div class="user-bio">
            <h4>${t("about")}</h4>
            <p>${bio || t("noBio")}</p>
          </div>
          <div class="user-socials">
            <h4>${t("socials")}</h4>
            <div class="social-links">${renderSocialLinks(socials)}</div>
          </div>
        </div>
      </div>
      <div class="related-broadcasts">
        <h3>${t("related.title")}</h3>
        <div id="related-grid"></div>
      </div>
    </div>
  `;

  // Ativa modal e bloqueia scroll do body
  modal.classList.add("active");
  document.body.classList.add("modal-open");
  modalContent.scrollTop = 0;

  // Inicializa relacionadas
  loadRelatedBroadcasts(broadcast);

  // Acessibilidade: foco no header do modal
  setTimeout(() => {
    const header = modalContent.querySelector(".modal-header");
    if (header) header.focus();
  }, 100);
}

/**
 * Fecha o modal e limpa seu conteúdo, removendo overlay e desbloqueando o body
 */
function closeModal() {
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    modalContent.innerHTML = "";
  }, 300); // Deixe a animação de saída ocorrer
}

/**
 * Busca e exibe transmissões relacionadas
 * Exibe até 4 cards no grid
 */
function loadRelatedBroadcasts(current) {
  const grid = document.getElementById("related-grid");
  fetch("https://api.xcam.gay/?limit=100")
    .then((res) => res.json())
    .then((data) => {
      const items = data?.broadcasts?.items || [];
      const related = items
        .filter(
          (b) =>
            b.id !== current.id &&
            (b.gender === current.gender || b.countryId === current.countryId)
        )
        .slice(0, 4);

      if (!related.length) {
        grid.innerHTML = `<p>${t("related.none")}</p>`;
        return;
      }

      grid.innerHTML = "";
      related.forEach((b) => {
        const el = document.createElement("div");
        el.className = "related-card";
        el.innerHTML = `
          <div class="related-thumbnail">
            <img src="${b.preview?.poster}" alt="${b.username}" loading="lazy">
            <div class="related-overlay">
              <div class="related-play"><i class="fas fa-play"></i></div>
            </div>
            <div class="related-badge">AO VIVO</div>
          </div>
          <div class="related-info">
            <h4>@${b.username}</h4>
            <div class="related-meta">
              <span class="related-country">
                <img src="https://flagcdn.com/w20/${
                  b.countryId || "xx"
                }.png" alt="${getCountryName(b.countryId || "xx")}">
              </span>
              <span class="related-viewers">
                <i class="fas fa-eye"></i> ${b.viewers}
              </span>
            </div>
          </div>
        `;
        el.addEventListener("click", () => {
          closeModal();
          setTimeout(() => openModal(b), 300);
        });
        grid.appendChild(el);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar relacionadas:", err);
      grid.innerHTML = `<p>${t("error.description")}</p>`;
    });
}

// Listener global para clique em tags do modal (exemplo: filtro)
window.addEventListener("modalTagClick", (e) => {
  const tag = e.detail;
  // Implemente aqui: ação ao clicar em uma tag, como filtrar transmissões
  alert(`Filtro por tag: #${tag}`);
});

/* 
 * Observações:
 * - Certifique-se de que o CSS do modal esteja atualizado conforme o novo padrão visual.
 * - O HTML base do modal deve ter <div id="broadcast-modal"><div id="modal-content"></div></div>
 * - Integre a função de filtro de tags conforme as necessidades do projeto.
 */