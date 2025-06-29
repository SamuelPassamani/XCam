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
 * Inicializa o player de preview animado, configurando poster, vídeo e eventos de hover.
 * @param {Object} camera - Objeto com dados da câmera (username).
 * @param {string} videoSrc - URL do vídeo HLS.
 */
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
    pipIcon: false,
    playlist: [{
      title: `@${camera.username}`,
      image: `https://poster.xcam.gay/${camera.username.toLowerCase().trim()}.jpg`,
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
 */
function addPreviewHoverEvents() {
  const playerContainer = document.getElementById("player");
  const jw = jwplayer("player");
  let playTimeout;
  let hasPlayedOnHover = false;

  playerContainer.addEventListener("mouseenter", () => {
    clearTimeout(playTimeout);
    if (!hasPlayedOnHover) {
      jw.play(true);
      hasPlayedOnHover = true;
    } else {
      playTimeout = setTimeout(() => jw.play(true), 200);
    }
  });

  playerContainer.addEventListener("mouseleave", () => {
    clearTimeout(playTimeout);
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

/**
 * Inicializa o modo preview: injeta CSS, mostra loading, busca dados e monta o player.
 * Agora utiliza a endpoint unificada ?stream={username}.
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

    // Seleciona a melhor URL disponível
    const videoSrc =
      streamInfo.cdnURL ||
      streamInfo.edgeURL ||
      (graphData.preview && graphData.preview.src);

    if (!videoSrc) throw new Error("Nenhuma fonte de vídeo encontrada.");

    const camera = { username: username, poster: graphData.preview?.poster || "" };
    setupPreviewPlayer(camera, videoSrc);
  } catch (err) {
    console.warn(`Falha ao inicializar o preview player: ${err.message}`);
    handlePreviewRetry();
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
 * Inicializa o player do modo carousel, sem eventos de hover.
 * @param {Object} camera - Objeto com dados da câmera (username).
 * @param {string} videoSrc - URL do vídeo HLS.
 */
function setupCarouselPlayer(camera, videoSrc) {
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
      image: `https://poster.xcam.gay/${camera.username.toLowerCase().trim()}.jpg`,
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

/**
 * Lida com erros no modo carousel, exibindo mensagem e tentando retry.
 * @param {Object} event - Evento de erro do JW Player.
 */
function handleCarouselPlayerError(event) {
  displayErrorMessage(event, handleCarouselRetry);
}

/**
 * Lógica de retry para o modo carousel.
 */
function handleCarouselRetry() {
  previewRetryCount++;
  if (previewRetryCount <= PREVIEW_CONFIG.MAX_RETRIES) {
    setTimeout(initializeCarouselPlayer, PREVIEW_CONFIG.RETRY_DELAY);
  } else {
    showCarouselFallback();
  }
}

/**
 * Inicializa o modo carousel: injeta CSS, mostra loading, busca dados e monta o player.
 * Agora utiliza a endpoint unificada ?stream={username}.
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

    // Seleciona a melhor URL disponível
    const videoSrc =
      streamInfo.cdnURL ||
      streamInfo.edgeURL ||
      (graphData.preview && graphData.preview.src);

    if (!videoSrc) throw new Error("Nenhuma fonte de vídeo encontrada.");

    const camera = { username: username, poster: graphData.preview?.poster || "" };
    setupCarouselPlayer(camera, videoSrc);
  } catch (err) {
    console.warn(`Falha ao inicializar o carousel player: ${err.message}`);
    handleCarouselRetry();
  }
}

/* === BLOCO: MODO PADRÃO (Player Completo - Lógica Original) ======================== */

/**
 * Inicializa o player principal completo, com busca por user/id, modal de anúncio e fallback.
 * Agora utiliza a endpoint unificada ?stream={username} para busca por usuário.
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
        // Seleciona a melhor URL disponível
        const videoSrc =
          streamInfo.cdnURL ||
          streamInfo.edgeURL ||
          (graphData.preview && graphData.preview.src);

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
        const poster = camera.preview?.poster || camera.profileImageURL || "https://xcam.gay/src/loading.gif";
        setupMainPlayer(camera, camera.username, videoSrc, poster);
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
 * @param {string} poster - URL do poster.
 */
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
    playlist: [{
      title: `@${camera?.username || username || "Unknown"}`,
      description: Array.is