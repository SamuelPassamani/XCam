import { t } from "./i18n.js";

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
        carouselContainer.innerHTML = `<div class="empty-state">${t(
          "noBroadcasts.title"
        )}</div>`;
        return;
      }

      items.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "broadcast-card carousel-slide fade";
        if (index === 0) card.classList.add("active");

        card.innerHTML = `
          <a href="/cam/?user=${item.username}" class="card-thumbnail">
            <iframe
              src="https://live.xcam.gay/?user=${item.username}&mode=carousel"
              class="carousel-iframe"
              title="Prévia de @${item.username}"
              loading="lazy"
              allow="autoplay; encrypted-media"
              frameborder="0"
              tabindex="-1"
              aria-hidden="true"
              style="width:100%;height:100%;aspect-ratio:16/9;display:block;background:#000;border-radius:8px;"
            ></iframe>
            <div class="card-overlay">
              <button class="play-button" aria-label="${t("play")} @${item.username}">
                <i class="fas fa-play" aria-hidden="true"></i>
              </button>
            </div>
            <div class="live-badge" aria-label="${t("live")}">
              <span>${t("live")}</span>
            </div>
          </a>
          <div class="card-info">
            <div class="card-header">
              <h4 class="card-username">@${item.username}</h4>
              <div class="card-country">
                <img src="https://flagcdn.com/24x18/${item.country || "xx"}.png" title="${item.country}" />
              </div>
            </div>
            <div class="card-viewers">
              <i class="fas fa-eye"></i>
              <span>${item.viewers} ${t("viewers")}</span>
            </div>
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

        slideWrapper.appendChild(card);
        slides.push(card);

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

  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", () =>
      clearInterval(intervalId)
    );
    carouselContainer.addEventListener("mouseleave", () => startInterval());
  }

  fetchTopBroadcasts();
}