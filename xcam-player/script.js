// =====================================================================================
// XCam Player - Script Unificado (v6.2)
// =====================================================================================
// @author      Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
// @info        https://aserio.work/
// @version     6.2.1
// @lastupdate  29/06/2025
// @mode        1. Modo Padrão (Player Completo): Executado quando nenhum parâmetro `mode` é fornecido.
// @mode        2. Modo Preview (Poster Animado): Ativado com `?mode=preview`.
// @mode        3. Modo Carousel (Preview Automático): Ativado com `?mode=carousel`.
// @description
// Script modular para o player XCam, com múltiplos modos de operação controlados por URL.
// Todos os modos agora usam a endpoint unificada ?stream={username} para máxima eficiência.
// =====================================================================================

"use strict";

/* ============================================================================
 * 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
 * ========================================================================== */

// Configurações globais para o player e modos especiais
const PREVIEW_CONFIG = {
  MAX_RETRIES: 3, // Máximo de tentativas de retry em caso de erro
  RETRY_DELAY: 5000, // Delay entre tentativas de retry (ms)
  PREVIEW_DURATION: 3000, // Duração do preview antes de pausar (ms)
  API_ENDPOINT: "https://api.xcam.gay/", // Endpoint base da API
  FALLBACK_VIDEO: "https://cdn.xcam.gay/0:/src/files/error.mp4", // Vídeo de fallback
  LOADING_GIF: "https://cdn.xcam.gay/0:/src/files/loading.gif" // GIF de loading
};

// Variável de controle para tentativas de retry no preview/carousel
let previewRetryCount = 0;

// Mensagens de erro detalhadas para o JW Player
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

/* ============================================================================
 * 3. CORPO: FUNÇÕES E EXECUÇÃO PRINCIPAL
 * ========================================================================== */

/**
 * Roteador principal: decide qual modo do player inicializar com base no parâmetro ?mode.
 * Executa ao carregar o DOM.
 */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  if (mode === "preview") {
    initializePreviewPlayer(); // Modo preview animado
  } else if (mode === "carousel") {
    initializeCarouselPlayer(); // Modo carousel automático
  } else {
    initializeAdModal();        // Modal de anúncio (apenas modo padrão)
    initializeMainPlayer();     // Player completo padrão
  }
});

/**
 * Função utilitária para determinar a imagem ideal do player (playlist.image) para todos os modos.
 * Segue a ordem de prioridade:
 * 1. graphData.preview.poster
 * 2. posterInfo.poster[username].fileUrl
 * 3. graphData.profileImageURL (se não for default)
 * 4. PREVIEW_CONFIG.LOADING_GIF
 * @param {object} graphData - Dados do usuário (graphData)
 * @param {object} posterInfo - Dados do posterInfo retornado pela API
 * @param {string} username - Nome do usuário
 * @returns {string} URL da imagem ideal para o player
 */
function getBestPlaylistImage(graphData, posterInfo, username) {
  // 1. Tenta usar o poster do preview (mais atualizado)
  if (graphData?.preview?.poster && typeof graphData.preview.poster === "string" && graphData.preview.poster.trim() !== "") {
    return graphData.preview.poster;
  }
  // 2. Tenta usar o fileUrl do posterInfo (se existir)
  if (
    posterInfo &&
    posterInfo.poster &&
    posterInfo.poster[username] &&
    typeof posterInfo.poster[username].fileUrl === "string" &&
    posterInfo.poster[username].fileUrl.trim() !== ""
  ) {
    return posterInfo.poster[username].fileUrl;
  }
  // 3. Usa profileImageURL se não for a imagem default
  if (
    graphData?.profileImageURL &&
    typeof graphData.profileImageURL === "string" &&
    graphData.profileImageURL.trim() !== "" &&
    !graphData.profileImageURL.includes("default_Male.png")
  ) {
    return graphData.profileImageURL;
  }
  // 4. Se nada encontrado, retorna o GIF de loading
  return PREVIEW_CONFIG.LOADING_GIF;
}

/* === BLOCO: MODO PREVIEW (Poster Animado) ========================================= */

/**
 * Injeta CSS para ocultar toda a interface do player no modo preview/carousel.
 */
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

/**
 * Exibe o GIF de loading enquanto o preview é carregado.
 */
function showPreviewLoading() {
  const playerContainer = document.getElementById("player");
  if (playerContainer) {
    playerContainer.innerHTML = `<img src="${PREVIEW_CONFIG.LOADING_GIF}" alt="Carregando..." style="width:100%;height:100%;object-fit:contain;background:#000;" />`;
  }
}

/**
 * Exibe o vídeo de fallback caso o preview falhe.
 */
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

/**
 * Inicializa o modo preview: injeta CSS, mostra loading, busca dados e monta o player.
 * Agora utiliza a endpoint unificada ?stream={username} e aplica a regra global de imagem.
 */
async function initializePreviewPlayer() {
  injectPreviewCSS();
  showPreviewLoading();
  try {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("user");
    if (!username) throw new Error("Parâmetro 'user' não encontrado.");

    // Busca dados completos do usuário/transmissão
    const response = await fetch(`${PREVIEW_CONFIG.API_ENDPOINT}?stream=${encodeURIComponent(username)}`);
    if (!response.ok) throw new Error(`API retornou status ${response.status}`);

    const data = await response.json();
    const graphData = data.graphData || {};
    const streamInfo = data.streamInfo || {};
    const posterInfo = data.posterInfo || {};

    // Seleciona a melhor URL disponível para o vídeo
    const videoSrc =
      streamInfo.cdnURL ||
      streamInfo.edgeURL ||
      (graphData.preview && graphData.preview.src);

    if (!videoSrc) throw new Error("Nenhuma fonte de vídeo encontrada.");

    // Usa a função utilitária para determinar a imagem ideal
    const image = getBestPlaylistImage(graphData, posterInfo, username);

    const camera = { username: username, poster: image };
    setupPreviewPlayer(camera, videoSrc, image);
  } catch (err) {
    console.warn(`Falha ao inicializar o preview player: ${err.message}`);
    handlePreviewRetry();
  }
}

/**
 * Inicializa o player de preview animado, configurando poster, vídeo e eventos de hover.
 * @param {Object} camera - Objeto com dados da câmera (username, poster).
 * @param {string} videoSrc - URL do vídeo HLS.
 * @param {string} image - URL da imagem ideal para o player.
 */
function setupPreviewPlayer(camera, videoSrc, image) {
  const playerContainer = document.getElementById("player");
  if (!playerContainer) return;

  playerContainer.innerHTML = "";
  previewRetryCount = 0;

  jwplayer("player").setup({
    controls: false,
    autostart: true,
    mute: true,
    hlsjsConfig: { withCredentials: true },
    pipIcon: false,
    playlist: [{
      title: `@${camera.username}`,
      image: image,
      sources: [{ file: videoSrc, type: "application/x-mpegURL" }]
    }],
    events: {
      error: handlePreviewPlayerError
    }
  });

  jwplayer("player").on("ready", () => {
    // Desabilita PiP no elemento <video> nativo
    const video = document.querySelector("#player video");
    if (video) {
      video.setAttribute("disablepictureinpicture", "");
      video.setAttribute("controlsList", "nodownload nofullscreen noremoteplayback nopictureinpicture");
    }
    // Pausa o vídeo após o tempo de preview
    setTimeout(() => {
      if (jwplayer("player")?.getState() !== 'paused') {
        jwplayer("player").pause(true);
      }
    }, PREVIEW_CONFIG.PREVIEW_DURATION);
    addPreviewHoverEvents();
  });
}

/**
 * Adiciona eventos de hover para pausar e retomar o preview animado.
 * Usa requestAnimationFrame e só executa jw.play(true) se o player não estiver tocando.
 * Corrigido: autoplay já no primeiro mouseenter.
 */
function addPreviewHoverEvents() {
  const playerContainer = document.getElementById("player");
  const jw = jwplayer("player");
  let playTimeout;

  playerContainer.addEventListener("mouseenter", () => {
    if (playTimeout) {
      cancelAnimationFrame(playTimeout);
      playTimeout = null;
    }
    if (jw.getState() !== "playing") {
      playTimeout = requestAnimationFrame(() => jw.play(true));
    }
  });

  playerContainer.addEventListener("mouseleave", () => {
    if (playTimeout) {
      cancelAnimationFrame(playTimeout);
      playTimeout = null;
    }
    jw.pause(true);
  });
}

/**
 * Lida com tentativas de retry no preview animado.
 */
function handlePreviewRetry() {
  previewRetryCount++;
  if (previewRetryCount <= PREVIEW_CONFIG.MAX_RETRIES) {
    setTimeout(initializePreviewPlayer, PREVIEW_CONFIG.RETRY_DELAY);
  } else {
    showPreviewFallback();
  }
}

/* === BLOCO: MODO CAROUSEL (Preview Automático, sem hover) ========================== */

/**
 * Injeta CSS do preview para o modo carousel.
 */
function injectCarouselCSS() {
  injectPreviewCSS();
}

/**
 * Exibe fallback no modo carousel.
 */
function showCarouselFallback() {
  showPreviewFallback();
}

/**
 * Inicializa o modo carousel: injeta CSS, mostra loading, busca dados e monta o player.
 * Agora utiliza a endpoint unificada ?stream={username} e aplica a regra global de imagem.
 */
async function initializeCarouselPlayer() {
  injectCarouselCSS();
  showPreviewLoading();
  try {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("user");
    if (!username) throw new Error("Parâmetro 'user' não encontrado.");

    // Busca dados completos do usuário/transmissão
    const response = await fetch(`${PREVIEW_CONFIG.API_ENDPOINT}?stream=${encodeURIComponent(username)}`);
    if (!response.ok) throw new Error(`API retornou status ${response.status}`);

    const data = await response.json();
    const graphData = data.graphData || {};
    const streamInfo = data.streamInfo || {};
    const posterInfo = data.posterInfo || {};

    // Seleciona a melhor URL disponível para o vídeo
    const videoSrc =
      streamInfo.cdnURL ||
      streamInfo.edgeURL ||
      (graphData.preview && graphData.preview.src);

    if (!videoSrc) throw new Error("Nenhuma fonte de vídeo encontrada.");

    // Usa a função utilitária para determinar a imagem ideal
    const image = getBestPlaylistImage(graphData, posterInfo, username);

    const camera = { username: username, poster: image };
    setupCarouselPlayer(camera, videoSrc, image);
  } catch (err) {
    console.warn(`Falha ao inicializar o carousel player: ${err.message}`);
    handleCarouselRetry();
  }
}

/**
 * Inicializa o player do modo carousel, sem eventos de hover.
 * @param {Object} camera - Objeto com dados da câmera (username, poster).
 * @param {string} videoSrc - URL do vídeo HLS.
 * @param {string} image - URL da imagem ideal para o player.
 */
function setupCarouselPlayer(camera, videoSrc, image) {
  const playerContainer = document.getElementById("player");
  if (!playerContainer) return;

  playerContainer.innerHTML = "";
  previewRetryCount = 0;

  jwplayer("player").setup({
    controls: false,
    autostart: true,
    mute: true,
    hlsjsConfig: { withCredentials: true },
    pipIcon: false,
    playlist: [{
      title: `@${camera.username}`,
      image: image,
      sources: [{ file: videoSrc, type: "application/x-mpegURL" }]
    }],
    events: {
      error: handleCarouselPlayerError
    }
  });

  jwplayer("player").on("ready", () => {
    const video = document.querySelector("#player video");
    if (video) {
      video.setAttribute("disablepictureinpicture", "");
      video.setAttribute("controlsList", "nodownload nofullscreen noremoteplayback nopictureinpicture");
    }
  });
  // Não adiciona eventos de hover, nunca pausa o vídeo
}

/* === BLOCO: MODO PADRÃO (Player Completo - Lógica Original) ======================== */

/**
 * Inicializa o player principal completo, com busca por user/id, modal de anúncio e fallback.
 * Agora utiliza a endpoint unificada ?stream={username} para busca por usuário e aplica a regra global de imagem.
 */
function initializeMainPlayer() {
  const playerContainer = document.getElementById("player");
  if (playerContainer) {
    playerContainer.innerHTML =
      `<img src="https://xcam.gay/src/loading.gif" alt="Carregando..." style="width:100vw;height:100vh;object-fit:contain;background:#000;display:block;" />`;
  }

  const params = new URLSearchParams(window.location.search);

  // Busca por usuário
  if (params.has("user")) {
    const username = params.get("user");
    fetch(`https://api.xcam.gay/?stream=${encodeURIComponent(username)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao carregar dados do usuário.");
        return response.json();
      })
      .then((data) => {
        const graphData = data.graphData || {};
        const streamInfo = data.streamInfo || {};
        const posterInfo = data.posterInfo || {};

        // Seleciona a melhor URL disponível para o vídeo
        const videoSrc =
          streamInfo.cdnURL ||
          streamInfo.edgeURL ||
          (graphData.preview && graphData.preview.src);

        if (!videoSrc) {
          console.warn("Nenhum stream válido encontrado para o usuário. Aplicando fallback local.");
          reloadWithFallback();
          return;
        }
        // Usa a função utilitária para determinar a imagem ideal
        const image = getBestPlaylistImage(graphData, posterInfo, username);

        const camera = {
          username: graphData.username || username,
          tags: graphData.tags || [],
          preview: { poster: image }
        };
        setupMainPlayer(camera, username, videoSrc, image);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados do usuário:", err);
        reloadWithFallback();
      });

  // Busca por ID de transmissão (mantém lógica original)
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
        // Usa diretamente a URL HLS original, sem proxy reverso
        const videoSrc = camera.preview?.src;
        // Para busca por ID, mantém o fluxo antigo para imagem
        const image = camera.preview?.poster ||
          (camera.profileImageURL && !camera.profileImageURL.includes("default_Male.png") ? camera.profileImageURL : PREVIEW_CONFIG.LOADING_GIF);

        setupMainPlayer(camera, camera.username, videoSrc, image);
      })
      .catch((err) => {
        console.error("Erro ao carregar a lista geral:", err);
        reloadWithFallback();
      });
  } else {
    // Nenhum parâmetro relevante, exibe fallback
    console.warn("Nenhum parâmetro 'user' ou 'id' foi fornecido na URL.");
    reloadWithFallback();
  }
}

/**
 * Monta e inicializa o player principal do JWPlayer com todos os controles e informações.
 * @param {Object} camera - Objeto da câmera (username, tags, preview).
 * @param {string} username - Nome do usuário.
 * @param {string} videoSrc - URL do vídeo HLS.
 * @param {string} image - URL da imagem ideal para o player.
 */
function setupMainPlayer(camera, username, videoSrc, image) {
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
    playlist: [{
      title: `@${camera?.username || username || "Unknown"}`,
      description: Array.isArray(camera?.tags) ? camera.tags.map((tag) => `#${tag.name}`).join(" ") : "",
      image: image,
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

/**
 * Exibe vídeo de fallback local caso não seja possível carregar o stream.
 */
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

/* === BLOCO: TRATAMENTO DE ERROS (Lógica original preservada e expandida) =========== */

/**
 * Exibe mensagem de erro detalhada e executa ação de fallback após contagem regressiva.
 * @param {Object} event - Evento de erro do JW Player.
 * @param {Function} fallbackAction - Função a ser chamada após o erro.
 */
function displayErrorMessage(event, fallbackAction) {
  console.error("Erro no JW Player:", event.message);

  const playerContainer = document.getElementById("player");
  let countdown = 5;

  // Oculta o player para não sobrepor a mensagem
  if (playerContainer) playerContainer.style.display = "none";

  // Cria overlay de erro fullscreen se não existir
  let errorOverlay = document.getElementById("xcam-error-overlay");
  if (!errorOverlay) {
    errorOverlay = document.createElement("div");
    errorOverlay.id = "xcam-error-overlay";
    errorOverlay.style.position = "fixed";
    errorOverlay.style.top = "0";
    errorOverlay.style.left = "0";
    errorOverlay.style.width = "100vw";
    errorOverlay.style.height = "100vh";
    errorOverlay.style.display = "flex";
    errorOverlay.style.flexDirection = "column";
    errorOverlay.style.justifyContent = "center";
    errorOverlay.style.alignItems = "center";
    errorOverlay.style.background = "rgba(51,51,51,0.85)";
    errorOverlay.style.color = "#FFF";
    errorOverlay.style.fontFamily = "sans-serif";
    errorOverlay.style.zIndex = "9999";
    document.body.appendChild(errorOverlay);
  }

  // Mensagem de erro detalhada
  const message = ERROR_MESSAGES[event.code] || `<strong>Erro desconhecido (${event.code}).</strong>`;

  // Exibe mensagem e inicia contagem regressiva para fallback
  errorOverlay.innerHTML = `
    <div style="font-size:1.4em;margin-bottom:1em;">${message}</div>
    <div>Recarregando em <span id="countdown">${countdown}</span> segundos...</div>
  `;

  const interval = setInterval(() => {
    countdown--;
    const countdownSpan = document.getElementById("countdown");
    if (countdownSpan) countdownSpan.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(interval);
      // Remove overlay e mostra o player novamente
      if (errorOverlay) errorOverlay.remove();
      if (playerContainer) playerContainer.style.display = "";
      fallbackAction();
    }
  }, 1000);
}

/**
 * Handler de erro do player principal.
 * @param {Object} event - Evento de erro do JW Player.
 */
function handleMainPlayerError(event) {
  displayErrorMessage(event, reloadWithFallback);
}

/**
 * Handler de erro do player preview.
 * @param {Object} event - Evento de erro do JW Player.
 */
function handlePreviewPlayerError(event) {
  displayErrorMessage(event, handlePreviewRetry);
}

/* === BLOCO: MODAL DE ANÚNCIO (Apenas para Modo Padrão) ============================= */

/**
 * Inicializa o modal de anúncio exibido antes do player principal.
 */
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

/* === BLOCO: FUNÇÕES AUXILIARES PRESERVADAS DO SCRIPT ORIGINAL ====================== */

/**
 * Adiciona botão de download ao player JWPlayer.
 * @param {Object} playerInstance - Instância do JWPlayer.
 */
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

/**
 * Realinha o time slider do player para melhor UX.
 * @param {Object} playerInstance - Instância do JWPlayer.
 */
function alignTimeSlider(playerInstance) {
  const playerContainer = playerInstance.getContainer();
  const buttonContainer = playerContainer.querySelector(".jw-button-container");
  const spacer = buttonContainer.querySelector(".jw-spacer");
  const timeSlider = playerContainer.querySelector(".jw-slider-time");
  if (spacer && timeSlider) {
    buttonContainer.replaceChild(timeSlider, spacer);
  }
}

/* ============================================================================
 * 4. RODAPÉ / FIM DO CÓDIGO
 * ========================================================================== */
/**
 * =====================================================================================
 * FIM DO SCRIPT
 * =====================================================================================
 *
 * @log de mudanças:
 * - v6.2.1: Todos os modos agora usam a endpoint unificada ?stream={username}.
 * - v5.8: Restaurada a lógica completa do player principal (busca por ID, erros, etc.)
 * - v5.7: Melhorada a lógica de hover no modo preview com debounce.
 * - v5.6: Integrado tratamento de erros detalhado para ambos os modos.
 * - v5.5: Restaurada a lógica completa do player principal (busca por ID, erros, etc.).
 * - v5.4: Implementação da arquitetura de modo duplo (padrão vs. preview).
 *
 * @roadmap futuro:
 * - Considerar a implementação de um sistema de cache no lado do servidor (com
 *   Cloudflare Workers e KV) para diminuir a carga na API principal.
 * - Adicionar funcionalidade de "Favoritos" com persistência em localStorage.
 *
 * =====================================================================================
 */