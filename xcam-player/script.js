"use strict";

/**
 * =====================================================================================
 * XCam Player - Script Unificado (v5.2)
 * =====================================================================================
 *
 * @author      Samuel Passamani
 * @version     5.2.0
 * @lastupdate  18/06/2025
 *
 * @description Este script controla o player de vídeo do XCam e opera em dois modos,
 * definidos pelo parâmetro de URL `?mode=preview`.
 *
 * @mode        1. **Modo Padrão (Player Completo):**
 * - Executado quando nenhum parâmetro `mode` é fornecido.
 * - Exibe um player de vídeo completo com todos os controlos,
 * logo, informações de partilha e um modal de anúncio inicial.
 * - Busca os dados da transmissão por `?user=` ou `?id=`.
 *
 * 2. **Modo Preview (Poster Animado):**
 * - Ativado com `?mode=preview`.
 * - Ideal para ser usado em `iframes` numa grelha.
 * - Oculta toda a interface do player via CSS.
 * - Comportamento: Autoplay mudo por 3000ms, pausa, e reativa com hover.
 * - Implementa um sistema robusto de 3 tentativas em caso de erro.
 *
 * =====================================================================================
 */

// --- LÓGICA DE INICIALIZAÇÃO ---

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const isPreviewMode = params.get("mode") === "preview";

  if (isPreviewMode) {
    // CORREÇÃO: Ajusta a visibilidade dos elementos imediatamente para o modo preview.
    const adModal = document.getElementById("ad-modal");
    const playerWrapper = document.getElementById("player");
    if (adModal) adModal.style.display = "none";
    if (playerWrapper) playerWrapper.style.display = "block";

    // Se o modo preview estiver ativo, executa a lógica do player de preview.
    initializePreviewPlayer();
  } else {
    // Caso contrário, executa a lógica do player principal completo.
    initializeMainPlayer();
  }
});


// =====================================================================================
// === MODO PREVIEW (se ?mode=preview estiver na URL) =================================
// =====================================================================================

const PREVIEW_CONFIG = {
  MAX_RETRIES: 7,
  RETRY_DELAY: 5000,
  PREVIEW_DURATION: 3000,
  API_ENDPOINT: "https://api.xcam.gay/user/",
  FALLBACK_VIDEO: "https://xcam-drive.aserio.workers.dev/0:/files/loading.webm",
  LOADING_GIF: "https://xcam.gay/src/loading.gif"
};

let previewRetryCount = 0;

function injectPreviewCSS() {
  const style = document.createElement("style");
  style.innerHTML = `
    #player .jw-controls, #player .jw-display, #player .jw-display-container,
    #player .jw-preview, #player .jw-logo, #player .jw-title, #player .jw-nextup-container,
    #player .jw-playlist-container, #player .jw-captions, #player .jw-button-container,
    #player .jw-tooltip, #player .jw-rightclick, #player .jw-icon, #player .jw-controlbar {
        display: none !important; opacity: 0 !important; visibility: hidden !important;
        pointer-events: none !important; background: transparent !important;
    }
    #player .jw-state-paused .jw-preview, #player .jw-flag-paused .jw-preview, #player .jw-preview {
      opacity: 1 !important; filter: none !important; background: none !important;
    }
    #player .jw-display-container { background: transparent !important; }
  `;
  document.head.appendChild(style);
}

function showPreviewLoading() {
  const playerContainer = document.getElementById("player");
  if (playerContainer) {
    playerContainer.innerHTML = `<img src="${PREVIEW_CONFIG.LOADING_GIF}" alt="Carregando..." style="width:100vw;height:100vh;object-fit:contain;background:#000;" />`;
  }
}

function showPreviewFallback() {
  const player = document.getElementById("player");
  if (player) {
    player.innerHTML = "";
    jwplayer("player").setup({
      file: PREVIEW_CONFIG.FALLBACK_VIDEO,
      autostart: true,
      repeat: true,
      controls: false,
      mute: true
    });
  }
}

function setupPreviewPlayer(camera, videoSrc) {
  const playerContainer = document.getElementById("player");
  if (playerContainer) playerContainer.innerHTML = "";
  previewRetryCount = 0;

  jwplayer("player").setup({
    controls: false,
    autostart: true, // Inicia automaticamente para o preview
    mute: true,
    hlsjsConfig: { withCredentials: true },
    playlist: [{
      title: `@${camera.username}`,
      image: camera.poster,
      sources: [{ file: videoSrc, type: "application/x-mpegURL" }]
    }],
    events: {
      error: (e) => {
        console.warn("Preview Player Error:", e);
        handlePreviewRetry();
      }
    }
  });

  jwplayer("player").on("ready", () => {
    setTimeout(() => {
      if (jwplayer("player").getState() !== 'paused') {
        jwplayer("player").pause(true);
      }
    }, PREVIEW_CONFIG.PREVIEW_DURATION);
    addPreviewHoverEvents();
  });
}

function addPreviewHoverEvents() {
  const playerContainer = document.getElementById("player");
  const jw = jwplayer("player");
  playerContainer.addEventListener("mouseenter", () => jw.play(true));
  playerContainer.addEventListener("mouseleave", () => jw.pause(true));
}

function handlePreviewRetry() {
  previewRetryCount++;
  if (previewRetryCount <= PREVIEW_CONFIG.MAX_RETRIES) {
    console.log(`Tentando recarregar... (${previewRetryCount}/${PREVIEW_CONFIG.MAX_RETRIES})`);
    setTimeout(initializePreviewPlayer, PREVIEW_CONFIG.RETRY_DELAY);
  } else {
    console.error(`Máximo de tentativas atingido. Exibindo fallback.`);
    showPreviewFallback();
  }
}

async function initializePreviewPlayer() {
  injectPreviewCSS();
  showPreviewLoading();
  try {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("user");
    if (!username) throw new Error("Parâmetro 'user' não encontrado.");

    const response = await fetch(`${PREVIEW_CONFIG.API_ENDPOINT}${encodeURIComponent(username)}/liveInfo`);
    if (!response.ok) throw new Error(`API retornou status ${response.status}`);
    
    const data = await response.json();
    console.log("API Response (Preview Mode):", data);

    const videoSrc = data.cdnURL || data.edgeURL;
    if (!videoSrc) throw new Error("Nenhuma fonte de vídeo encontrada.");

    const camera = { username: username, poster: "" };
    setupPreviewPlayer(camera, videoSrc);
  } catch (err) {
    console.warn(`Falha ao inicializar o preview player: ${err.message}`);
    handlePreviewRetry();
  }
}


// =====================================================================================
// === MODO PADRÃO (Player Completo, código original) =================================
// =====================================================================================

function initializeMainPlayer() {
  const playerContainer = document.getElementById("player");
  if (playerContainer) {
    // A visibilidade inicial do player é controlada pelo CSS e pelo initializeAdModal
    playerContainer.innerHTML =
      `<img src="https://xcam.gay/src/loading.gif" alt="Carregando..." style="width:100%;height:100%;object-fit:contain;background:#000;display:block;" />`;
  }
  
  initializeAdModal();
  
  const params = new URLSearchParams(window.location.search);

  if (params.has("user")) {
    const username = params.get("user");
    fetch(`https://api.xcam.gay/?user=${encodeURIComponent(username)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao carregar dados do usuário.");
        return response.json();
      })
      .then((data) => {
        const graphData = data.graphData || {};
        const streamInfo = data.streamInfo || {};
        const videoSrc = streamInfo.cdnURL || streamInfo.edgeURL || (graphData.preview && graphData.preview.src);

        if (!videoSrc) {
          console.warn("Nenhum stream válido encontrado. Aplicando fallback.");
          reloadWithFallback();
          return;
        }

        const poster = graphData.preview?.poster || graphData.profileImageURL || "https://xcam.gay/src/loading.gif";
        const camera = {
          username: graphData.username || username,
          tags: graphData.tags || [],
          preview: { poster }
        };

        setupMainPlayer(camera, username, videoSrc, poster);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados do usuário:", err);
        reloadWithFallback();
      });

  } else if (params.has("id")) {
    const searchValue = params.get("id");
    fetch("https://api.xcam.gay/?limit=3333&format=json")
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao carregar lista de transmissões");
        return response.json();
      })
      .then((data) => {
        const items = data?.broadcasts?.items || [];
        const camera = items.find((item) => item.id == searchValue);
        if (!camera) {
          console.warn(`Nenhuma câmera encontrada com o id: ${searchValue}`);
          reloadWithFallback();
          return;
        }
        if (!camera.preview?.src) {
          console.warn("Nenhum stream válido encontrado em preview.src. Aplicando fallback local.");
          reloadWithFallback();
          return;
        }
        const poster = camera.preview?.poster || camera.profileImageURL || "https://xcam.gay/src/loading.gif";
        setupMainPlayer(camera, camera.username, camera.preview.src, poster);
      })
      .catch((err) => {
        console.error("Erro ao carregar a lista geral:", err);
        reloadWithFallback();
      });

  } else {
    console.warn("Nenhum parâmetro 'user' ou 'id' foi fornecido na URL.");
    reloadWithFallback();
  }
}

function setupMainPlayer(camera, username, videoSrc, poster) {
  const playerContainer = document.getElementById("player");
  if (playerContainer) playerContainer.innerHTML = "";

  jwplayer("player").setup({
    controls: true,
    sharing: true,
    autostart: false,
    displaytitle: true,
    displaydescription: true,
    abouttext: "Buy me a coffee ☕",
    aboutlink: "https://xcam.gay/",
    skin: { name: "netflix" },
    logo: {
      file: "https://xcam.gay/src/logo.png",
      link: "https://xcam.gay"
    },
    captions: {
      color: "#efcc00",
      fontSize: 16,
      backgroundOpacity: 0,
      edgeStyle: "raised"
    },
    hlsjsConfig: {
      withCredentials: true
    },
    playlist: [{
      title: `@${camera?.username || username || "Unknown"}`,
      description: Array.isArray(camera?.tags) ? camera.tags.map((tag) => `#${tag.name}`).join(" ") : "",
      image: poster || "https://xcam.gay/src/loading.gif",
      sources: [{
        file: videoSrc,
        type: "application/x-mpegURL",
        label: "Source"
      }]
    }],
    events: {
      error: (e) => {
          console.warn("Erro ao reproduzir vídeo. Exibindo fallback local.", e);
          reloadWithFallback();
      }
    }
  });
}

function reloadWithFallback() {
  const player = document.getElementById("player");
  if (player) {
    player.innerHTML = "";
    jwplayer("player").setup({
      file: "https://xcam.gay/src/error.mp4",
      autostart: true,
      repeat: true,
      controls: false
    });
  }
}

function initializeAdModal() {
    const adModal = document.getElementById("ad-modal");
    const closeAdButton = document.getElementById("close-ad-btn");
    const countdownElement = document.getElementById("ad-countdown");
    const player = document.getElementById("player");

    if (!adModal || !closeAdButton || !countdownElement || !player) return;

    let countdown = 10;
    countdownElement.textContent = countdown;

    const interval = setInterval(() => {
        countdown -= 1;
        countdownElement.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(interval);
            closeAdButton.textContent = "Fechar";
            closeAdButton.classList.add("enabled");
            closeAdButton.removeAttribute("disabled");
            closeAdButton.style.cursor = "pointer";
        }
    }, 1000);

    closeAdButton.addEventListener("click", () => {
        if (countdown <= 0) {
            adModal.style.display = "none";
            // O player já começa com display:none no HTML,
            // então precisamos torná-lo visível.
            player.style.display = "block";
        }
    });
}