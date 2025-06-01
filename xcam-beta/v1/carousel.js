/**
 * XCam - carousel.js
 * Carrossel de destaques da home: integração visual, UX e compatibilidade com novo modal
 * -----------------------------------------------------------------------------
 * - Modular, desacoplado, preparado para integração com o novo padrão do modal
 * - Clean Architecture e comentários detalhados para devs
 * - Foco em acessibilidade, performance e clareza
 */

import { t } from "./i18n.js";

/**
 * Inicializa o carrossel de transmissões em destaque.
 * 
 * - Busca as transmissões no endpoint /?limit=10
 * - Renderiza slides com estrutura e classes do novo padrão visual
 * - Integração com modal: clique no card ou play button dispara evento customizado
 * - Suporte a navegação, autoplay e acessibilidade
 */
export function setupCarousel({ intervalMs = 6000 } = {}) {
  const carouselContainer = document.querySelector(".carousel-container");
  const slideWrapper = document.querySelector(".carousel-wrapper");
  const indicatorsWrapper = document.querySelector(".carousel-indicators");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");

  let slides = [];
  let indicators = [];
  let currentIndex = 0;
  let intervalId = null;

  async function fetchTopBroadcasts() {
    try {
      const response = await fetch("https://api.xcam.gay/?limit=10");
      const data = await response.json();
      const items = data?.broadcasts?.items || [];

      if (!items.length) {
        carouselContainer.innerHTML = `<div class="empty-state">${t("noBroadcasts.title")}</div>`;
        return;
      }

      items.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "broadcast-card carousel-slide fade";
        if (index === 0) card.classList.add("active");

        // Card HTML no novo padrão visual; tags, viewers, botão play etc.
        card.innerHTML = `
          <div class="carousel-image">
            <img src="${item.preview?.poster}" alt="Prévia de ${item.username}" loading="lazy" />
            <div class="carousel-overlay"></div>
            <div class="carousel-badge" aria-label="${t("live")}">
              <span>${t("live")}</span>
            </div>
            <div class="carousel-username">@${item.username}</div>
            <div class="carousel-info">
              <span class="carousel-country">
                <img src="https://flagcdn.com/24x18/${item.country || "xx"}.png" title="${item.country}" />
              </span>
              <span class="carousel-viewers">
                <i class="fas fa-eye"></i>
                <span>${item.viewers} ${t("viewers")}</span>
              </span>
            </div>
            <button class="carousel-button" aria-label="${t("play")} @${item.username}">
              <i class="fas fa-play" aria-hidden="true"></i> ${t("play")}
            </button>
          </div>
          <div class="carousel-content">
            <div class="card-tags">
              ${
                Array.isArray(item.tags)
                  ? item.tags
                      .map(
                        (tag) =>
                          `<span class="tag">#${
                            typeof tag === "string" ? tag : tag.name
                          }</span>`
                      )
                      .join(" ")
                  : ""
              }
            </div>
          </div>
        `;

        // Integração com novo modal: clique no card OU no botão play dispara evento customizado
        card.addEventListener("click", (e) => {
          // Só dispara se clicar no botão play ou em área interativa do card
          if (
            e.target.closest(".carousel-button") ||
            e.target.closest(".carousel-image")
          ) {
            const openEvent = new CustomEvent("open-broadcast-modal", {
              detail: { id: item.id, username: item.username }
            });
            window.dispatchEvent(openEvent);
            e.preventDefault();
          }
        });

        // Acessibilidade: Enter/Espaço ativam o modal se focar o slide
        card.tabIndex = 0;
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            const openEvent = new CustomEvent("open-broadcast-modal", {
              detail: { id: item.id, username: item.username }
            });
            window.dispatchEvent(openEvent);
            e.preventDefault();
          }
        });

        slideWrapper.appendChild(card);
        slides.push(card);

        // Indicadores (dots) do carrossel
        const dot = document.createElement("span");
        dot.className = "carousel-indicator";
        if (index === 0) dot.classList.add("active");
        dot.addEventListener("click", () => {
          currentIndex = index;
          updateDisplay();
          resetInterval();
        });
        indicatorsWrapper.appendChild(dot);
        indicators.push(dot);
      });

      updateDisplay();
      startInterval();
    } catch (error) {
      console.error("Erro ao carregar o carrossel:", error);
    }
  }

  function changeSlide(delta) {
    currentIndex = (currentIndex + delta + slides.length) % slides.length;
    updateDisplay();
  }

  function updateDisplay() {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentIndex);
    });
    indicators.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  }

  function startInterval() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => changeSlide(1), intervalMs);
  }

  function resetInterval() {
    clearInterval(intervalId);
    startInterval();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      changeSlide(-1);
      resetInterval();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      changeSlide(1);
      resetInterval();
    });
  }

  // Pausa autoplay ao passar mouse (UX)
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", () =>
      clearInterval(intervalId)
    );
    carouselContainer.addEventListener("mouseleave", () => startInterval());
  }

  fetchTopBroadcasts();
}

/**
 * EXPLICAÇÕES DOS AJUSTES:
 * - Slides do carrossel agora integram o novo padrão visual (estrutura, botões, badge ao vivo, tags)
 * - Clique e teclado nos slides/botão play disparam evento customizado para o novo modal.js
 * - Total desacoplamento entre carrossel e lógica do modal (clean, testável, escalável)
 * - Mantidas animação, autoplay, controles, indicadores e acessibilidade
 * - Modular, pronto para expansão e integração futura
 */