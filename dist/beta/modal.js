import { getCountryName } from "./translations.js";
import { t } from "./i18n.js";

let allBroadcasts = [];

/**
 * Atualiza a lista de transmissões disponíveis para uso no modal.
 * Usado como fallback ou referência para buscas locais.
 */
export function setModalBroadcasts(data) {
  allBroadcasts = data;
}

/**
 * Inicializa o modal: eventos de clique em cards e fechamento.
 */
export function setupModal() {
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Detecta clique em um card de transmissão
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".broadcast-card");
    if (card && card.dataset.broadcastId) {
      const broadcastId = card.dataset.broadcastId;

      // Busca os dados da transmissão individual na API
      fetch(`https://api.xcam.gay/user/${broadcast.username}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.broadcast) {
            openModal(data.broadcast);
          } else {
            console.warn("Transmissão não encontrada.");
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar dados da transmissão:", err);
        });
    }
  });

  // Fechar modal ao clicar fora da área de conteúdo
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Fechar modal ao clicar no botão "X"
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });
}

/**
 * Abre o modal e insere o conteúdo da transmissão selecionada.
 */
function openModal(broadcast) {
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Dados principais
  const poster = broadcast.preview?.poster || "";
  const profileImage = broadcast.profileImageURL || "";
  const countryCode = broadcast.country || "xx";
  const countryName = getCountryName(countryCode);
  const tags = Array.isArray(broadcast.tags) ? broadcast.tags : [];
  const gender = broadcast.gender || "";
  const orientation = broadcast.sexualOrientation || "";
  const viewers = broadcast.viewers || 0;

  // Renderiza tags em HTML
  const tagHTML = tags
    .map((tag) => `<span class="tag">#${tag.name || tag}</span>`)
    .join("");

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">@${broadcast.username}</h2>
      <button class="modal-close"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <div class="modal-player">
        <!-- Iframe do player XCam já implantado -->
        <div class="player-container" id="player-container">
          <iframe 
            src="https://player.xcam.gay/?id=${broadcast.id}" 
            frameborder="0" 
            allowfullscreen 
            class="player-iframe"
          ></iframe>
        </div>

        <!-- Informações do transmissor -->
        <div class="modal-info">
          <div class="streamer-info">
            <img src="${profileImage}" alt="${
    broadcast.username
  }" class="streamer-avatar">
            <div class="streamer-details">
              <p><strong>@${broadcast.username}</strong></p>
              <p>
                <img src="https://flagcdn.com/w20/${countryCode}.png" 
                     alt="${countryName}" 
                     title="${countryName}">
                ${countryName}
              </p>
              <p><i class="fas fa-eye"></i> ${viewers} ${t("viewers")}</p>
            </div>
          </div>

          <div class="modal-tags">${tagHTML}</div>

          <div class="modal-meta">
            <span><i class="fas fa-venus-mars"></i> ${t(gender)}</span>
            <span><i class="fas fa-heart"></i> ${t(orientation)}</span>
          </div>
        </div>
      </div>

      <!-- Transmissões relacionadas -->
      <div class="related-broadcasts">
        <h3>${t("related.title")}</h3>
        <div id="related-grid"></div>
      </div>
    </div>
  `;

  modal.classList.add("active");
  document.body.classList.add("modal-open");
  modalContent.scrollTop = 0;

  loadRelatedBroadcasts(broadcast);
}

/**
 * Fecha o modal e limpa seu conteúdo após a animação.
 */
function closeModal() {
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  modal.classList.remove("active");
  document.body.classList.remove("modal-open");

  setTimeout(() => {
    modalContent.innerHTML = "";
  }, 300);
}

/**
 * Carrega e exibe até 4 transmissões relacionadas (por país ou gênero).
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
            (b.country === current.country || b.gender === current.gender)
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
                <img src="https://flagcdn.com/w20/${b.country}.png" 
                     alt="${getCountryName(b.country)}">
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