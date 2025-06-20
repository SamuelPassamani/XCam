"use strict";

/**
 * =====================================================================================
 * XCam Player - Script Unificado (v6.2)
 * =====================================================================================
 *
 * @author      Samuel Passamani
 * @version     6.2.0
 * @lastupdate  19/06/2025
 *
 * @description Este script é o cérebro por trás do player de vídeo do XCam. Ele é
 * projetado para ser altamente modular e operar em dois modos distintos,
 * controlados pelo parâmetro de URL `?mode=preview`.
 *
 * @mode        1. **Modo Padrão (Player Completo):**
 * - Executado quando nenhum parâmetro `mode` é fornecido.
 * - Preserva TODA a funcionalidade original e estável, incluindo busca por `user` e `id`,
 * o modal de anúncio e o tratamento de erros detalhado.
 *
 * @mode        2. **Modo Preview (Poster Animado):**
 * - Ativado com `?mode=preview`.
 * - Ideal para ser usado em `iframes` numa grelha.
 * - Oculta toda a interface do player via CSS e executa uma lógica de preview.
 *
 * =====================================================================================
 */

// --- Roteador Principal ---
// Ponto de entrada que decide qual modo do player inicializar.
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const isPreviewMode = params.get("mode") === "preview";

  if (isPreviewMode) {
    initializePreviewPlayer();
  } else {
    // A lógica do modal de anúncio pertence apenas ao player principal.
    initializeAdModal();
    // A inicialização do player principal já mostra um loading.
    initializeMainPlayer();
  }
});


// =====================================================================================
// === MODO PREVIEW (Poster Animado) ===================================================
// =====================================================================================

const PREVIEW_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000,
  PREVIEW_DURATION: 500,
  API_ENDPOINT: "https://api.xcam.gay/user/",
  FALLBACK_VIDEO: "https://xcam-drive.aserio.workers.dev/0:/files/loading.webm",
  LOADING_GIF: "https://xcam.gay/src/loading.gif"
};

let previewRetryCount = 0;

function injectPreviewCSS() {
  const style = document.createElement("style");
  style.innerHTML = `
    body { background-image: none !important; }
    #player .jw-controls, #player .jw-display, #player .jw-display-container,
    #player .jw-preview, #player .jw-logo, #player .jw-title, #player .jw-nextup-container,
    #player .jw-playlist-container, #player .jw-captions, #player .jw-button-container,
    #player .jw-tooltip, #player .jw-rightclick, #player .jw-icon, #player .jw-controlbar {
        display: none !important; opacity: 0 !important; visibility: hidden !important;
        pointer-events: none !important; background: transparent !important;
    }
  `;
  document.head.appendChild(style);
}

function showPreviewLoading() {
    const playerContainer = document.getElementById("player");
    if (playerContainer) {
        playerContainer.innerHTML = `<img src="${PREVIEW_CONFIG.LOADING_GIF}" alt="Carregando..." style="width:100%;height:100%;object-fit:contain;background:#000;" />`;
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
  if (!playerContainer) return;
  
  playerContainer.innerHTML = "";
  previewRetryCount = 0;

  jwplayer("player").setup({
    controls: false,
    autostart: true,
    mute: true,
    hlsjsConfig: { withCredentials: true },
    playlist: [{
      title: `@${camera.username}`,
      image: camera.poster,
      sources: [{ file: videoSrc, type: "application/x-mpegURL" }]
    }],
    events: {
      error: handlePreviewPlayerError
    }
  });

  jwplayer("player").on("ready", () => {
    setTimeout(() => {
      if (jwplayer("player")?.getState() !== 'paused') {
        jwplayer("player").pause(true);
      }
    }, PREVIEW_CONFIG.PREVIEW_DURATION);
    addPreviewHoverEvents();
  });
}

function addPreviewHoverEvents() {
    const playerContainer = document.getElementById("player");
    const jw = jwplayer("player");
    let playTimeout;
    playerContainer.addEventListener("mouseenter", () => {
        clearTimeout(playTimeout);
        playTimeout = setTimeout(() => jw.play(true), 200);
    });
    playerContainer.addEventListener("mouseleave", () => {
        clearTimeout(playTimeout);
        jw.pause(true);
    });
}

function handlePreviewRetry() {
  previewRetryCount++;
  if (previewRetryCount <= PREVIEW_CONFIG.MAX_RETRIES) {
    setTimeout(initializePreviewPlayer, PREVIEW_CONFIG.RETRY_DELAY);
  } else {
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
// === MODO PADRÃO (Player Completo - LÓGICA ORIGINAL PRESERVADA) ======================
// =====================================================================================

function initializeMainPlayer() {
  const playerContainer = document.getElementById("player");
  if (playerContainer) {
    playerContainer.innerHTML =
      `<img src="https://xcam.gay/src/loading.gif" alt="Carregando..." style="width:100vw;height:100vh;object-fit:contain;background:#000;display:block;" />`;
  }
  
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
          console.warn("Nenhum stream válido encontrado para o usuário. Aplicando fallback local.");
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
        if (!camera || !camera.preview?.src) {
          console.warn(`Nenhuma câmera encontrada com o id: ${searchValue}`);
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

    const playerInstance = jwplayer("player").setup({
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
            error: handleMainPlayerError
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

// =====================================================================================
// === TRATAMENTO DE ERROS (Lógica original preservada e expandida) ====================
// =====================================================================================

const ERROR_MESSAGES = {
    100000: "<strong>Erro desconhecido.</strong> O player falhou ao carregar.",
    100001: "<strong>Tempo limite.</strong> A configuração do player demorou muito.",
    100011: "<strong>Licença ausente.</strong> Chave de licença não fornecida.",
    100012: "<strong>Licença inválida.</strong> Chave de licença inválida.",
    100013: "<strong>Licença expirada.</strong> A chave de licença expirou.",
    101100: "<strong>Componente ausente.</strong> Falha ao carregar um componente necessário do player.",
    224002: "<strong>Formato não suportado.</strong> O formato do vídeo não é suportado.",
    224003: "<strong>Vídeo corrompido.</strong> O vídeo está em formato inválido ou danificado.",
    230000: "<strong>Erro de decodificação.</strong> O player não conseguiu decodificar o vídeo.",
    232001: "<strong>Erro de conexão com o servidor.</strong> Não foi possível se conectar ao servidor do vídeo.",
    232002: "<strong>Erro de rede.</strong> Falha na solicitação de mídia.",
    232003: "<strong>Erro de mídia.</strong> O arquivo de vídeo pode estar corrompido.",
    232004: "<strong>Erro de DRM.</strong> Conteúdo protegido não pôde ser reproduzido.",
    232005: "<strong>Erro de acesso (CORS).</strong> O recurso solicitado não está acessível a partir desta página.",
    232006: "<strong>Erro de autenticação.</strong> Acesso não autorizado ao conteúdo.",
    232007: "<strong>Erro de licença.</strong> Falha ao validar a licença do conteúdo.",
    232008: "<strong>Token inválido.</strong> Token de acesso expirado ou corrompido.",
    232009: "<strong>Erro de assinatura.</strong> Verificação de integridade do conteúdo falhou.",
    232010: "<strong>Restrição geográfica.</strong> O conteúdo não está disponível na sua região.",
    232011: "<strong>Erro de conexão.</strong> Problemas de rede ou configurações do navegador.",
    232012: "<strong>Erro de tempo limite.</strong> O conteúdo demorou muito para carregar.",
    232013: "<strong>Formato incompatível.</strong> O formato do vídeo não é compatível.",
    232014: "<strong>Erro de codec.</strong> Codec necessário não está disponível.",
    232015: "<strong>Erro de resolução.</strong> Resolução de vídeo não suportada.",
    232016: "<strong>Erro de bitrate.</strong> A taxa de bits é muito alta para o dispositivo.",
    232017: "<strong>Erro de buffer.</strong> O vídeo não pode ser carregado corretamente.",
    232018: "<strong>Erro de sincronização.</strong> Falha ao sincronizar áudio e vídeo.",
    232019: "<strong>Erro de renderização.</strong> O vídeo não pôde ser renderizado.",
    232020: "<strong>Erro desconhecido na reprodução.</strong> Um erro não identificado ocorreu.",
    232600: "<strong>Erro no stream.</strong> O arquivo está indisponível ou corrompido."
};

function displayErrorMessage(event, fallbackAction) {
  console.error("Erro no JW Player:", event.message);

  const playerContainer = document.getElementById("player");
  let countdown = 5;

  const message = ERROR_MESSAGES[event.code] || `<strong>Erro desconhecido (${event.code}).</strong>`;

  const display = () => {
    if(playerContainer) {
        playerContainer.innerHTML = `
          <div style="color: #FFF; background: #333; text-align: center; padding: 20px; font-family: sans-serif; height: 100%; display: flex; flex-direction: column; justify-content: center;">
            <p style="margin: 0; font-size: 14px;">${message}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">A tentar novamente em <span id="countdown">${countdown}</span>s...</p>
          </div>`;
    }
    const interval = setInterval(() => {
        countdown--;
        const countdownSpan = document.getElementById("countdown");
        if(countdownSpan) countdownSpan.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(interval);
            fallbackAction();
        }
    }, 1000);
  };
  
  display();
}

function handleMainPlayerError(event) {
    displayErrorMessage(event, reloadWithFallback);
}

function handlePreviewPlayerError(event) {
    displayErrorMessage(event, handlePreviewRetry);
}

// =====================================================================================
// === LÓGICA DO MODAL DE ANÚNCIO (Apenas para Modo Padrão) ============================
// =====================================================================================

function initializeAdModal() {
    const adModal = document.getElementById("ad-modal");
    const closeAdButton = document.getElementById("close-ad-btn");
    const countdownElement = document.getElementById("ad-countdown");
    const player = document.getElementById("player");

    if (!adModal || !closeAdButton || !countdownElement || !player) return;

    // Remove a imagem de fundo do body e mostra o modal.
    document.body.style.backgroundImage = 'none';
    adModal.style.display = "flex";
    player.style.display = "none";

    let countdown = 10;
    countdownElement.textContent = countdown;
    const interval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(interval);
            closeAdButton.textContent = "Fechar";
            closeAdButton.removeAttribute("disabled");
            closeAdButton.style.cursor = "pointer";
        }
    }, 1000);

    closeAdButton.addEventListener("click", () => {
        if (countdown <= 0) {
            adModal.style.display = "none";
            player.style.display = "block";
        }
    });
}


// =====================================================================================
// === Funções Auxiliares Preservadas do Script Original ===============================
// =====================================================================================

function addDownloadButton(playerInstance) {
  const buttonId = "download-video-button";
  const iconPath = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL[...]";
  const tooltipText = "Download Video";

  playerInstance.addButton(
    iconPath,
    tooltipText,
    () => {
      const playlistItem = playerInstance.getPlaylistItem();
      const anchor = document.createElement("a");
      anchor.setAttribute("href", playlistItem.file);
      anchor.setAttribute("download", playlistItem.file.split("/").pop());
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    },
    buttonId
  );
}

function alignTimeSlider(playerInstance) {
  const playerContainer = playerInstance.getContainer();
  const buttonContainer = playerContainer.querySelector(".jw-button-container");
  const spacer = buttonContainer.querySelector(".jw-spacer");
  const timeSlider = playerContainer.querySelector(".jw-slider-time");
  if (spacer && timeSlider) {
    buttonContainer.replaceChild(timeSlider, spacer);
  }
}

/**
 * =====================================================================================
 * FIM DO SCRIPT
 * =====================================================================================
 *
 * @log
 * - v5.8: Restaurada a lógica completa do player principal (busca por ID, erros, etc.)
 * e corrigida a inicialização para evitar "race conditions".
 * - v5.7: Melhorada a lógica de hover no modo preview com debounce.
 * - v5.6: Integrado tratamento de erros detalhado para ambos os modos.
 * - v5.5: Restaurada a lógica completa do player principal (busca por ID, erros, etc.).
 * - v5.4: Implementação da arquitetura de modo duplo (padrão vs. preview).
 *
 * @roadmap
 * - Considerar a implementação de um sistema de cache no lado do servidor (com
 * Cloudflare Workers e KV) para diminuir a carga na API principal.
 * - Adicionar funcionalidade de "Favoritos" com persistência em localStorage.
 *
 * =====================================================================================
 */
