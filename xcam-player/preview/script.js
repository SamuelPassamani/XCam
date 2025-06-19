"use strict";

/**
 * =====================================================================================
 * XCam Player - script.js
 * =====================================================================================
 *
 * @author      Samuel Passamani
 * @version     4.0.0
 * @lastupdate  18/06/2025
 *
 * @description Este script é responsável por montar e controlar o player de vídeo
 * individual que aparece dentro de um iframe. Ele é projetado para ser
 * um "preview" dinâmico e sem controles.
 *
 * @strategy    1. **Busca por Parâmetro**: O script identifica qual usuário exibir
 * através do parâmetro `?user={username}` na URL do iframe.
 * 2. **Consulta à API**: Faz uma chamada à API `api.xcam.gay` para obter
 * os dados da transmissão daquele usuário específico.
 * 3. **Player Limpo**: Monta o JW Player sem quaisquer controles visíveis,
 * sem áudio e com interações de mouse para play/pause.
 * 4. **Ordem de Prioridade de Vídeo**: Busca a fonte do vídeo na seguinte
 * ordem: `edgeURL`, `cdnURL`.
 * 5. **Fallback Robusto com Tentativas**: Em caso de erro, tenta recarregar
 * o player 3 vezes com um intervalo de 5 segundos antes de mostrar
 * um vídeo de erro final.
 *
 * =====================================================================================
 */

// === Variáveis de Controle de Tentativas ===
let retryCount = 0;
const MAX_RETRIES = 3; // [CONFIGURÁVEL] Número máximo de tentativas de recarregamento.
const RETRY_DELAY = 5000; // [CONFIGURÁVEL] Tempo de espera entre tentativas (em milissegundos).

/**
 * 1. Injeção de CSS para Ocultar a UI do JW Player
 * Esta função injeta estilos diretamente no <head> da página para garantir que
 * todos os elementos visuais do player (controles, logo, título) sejam
 * completamente ocultos, resultando em um visual limpo de apenas vídeo.
 */
(function injectPlayerCSS() {
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
})();

/**
 * 2. Exibição de Tela de Carregamento
 * Para melhorar a experiência do usuário, esta função exibe uma imagem de
 * "loading" animada enquanto os dados da API estão sendo buscados.
 */
(function showLoading() {
  const preloadImage = new Image();
  preloadImage.src = "https://xcam.gay/src/loading.gif";
  const playerContainer = document.getElementById("player");
  if (playerContainer) {
    playerContainer.innerHTML = `<img src="${preloadImage.src}" alt="Carregando..." style="width:100vw;height:100vh;object-fit:contain;background:#000;" />`;
  }
})();

/**
 * 3. Função de Fallback Final
 * Esta função é chamada SOMENTE após todas as tentativas de recarregamento falharem.
 * Ela carrega um vídeo de erro local que fica em loop.
 */
function showFinalFallback() {
  const player = document.getElementById("player");
  if (player) {
    player.innerHTML = "";
    jwplayer("player").setup({
      file: "https://xcam-drive.aserio.workers.dev/0:/files/loading.webm",
      autostart: true,
      repeat: true,
      controls: false,
      mute: true
    });
    jwplayer("player").setControls(false);
    jwplayer("player").setMute(true);
  }
}

/**
 * 4. Configuração e Montagem do Player
 * Função principal que recebe os dados da câmera e a URL do vídeo para
 * inicializar o JW Player com as configurações corretas.
 * @param {Object} camera  - Objeto com dados do usuário (username, tags, poster).
 * @param {string} videoSrc - A URL do stream de vídeo a ser reproduzido.
 */
function setupPlayer(camera, videoSrc) {
  const playerContainer = document.getElementById("player");
  if (playerContainer) playerContainer.innerHTML = ""; // Limpa a tela de loading

  retryCount = 0; // Reseta a contagem de tentativas em caso de sucesso

  jwplayer("player").setup({
    controls: false,
    autostart: false,
    mute: true,
    sharing: false,
    displaytitle: false,
    displaydescription: false,
    abouttext: "",
    aboutlink: "",
    skin: { name: "netflix" },
    playlist: [
      {
        title: `@${camera.username}`,
        description: "",
        image: camera.poster || "https://xcam.gay/src/loading.gif",
        sources: [
          { file: videoSrc, type: "application/x-mpegURL", label: "HD" }
        ]
      }
    ],
    events: {
      error: (e) => {
        console.warn("JW Player encontrou um erro:", e);
        handleRetry();
      }
    }
  });

  jwplayer("player").on("ready", () => {
    jwplayer("player").setControls(false);
    jwplayer("player").setMute(true);
    jwplayer("player").play(true);
    setTimeout(() => {
      if (jwplayer("player").getState() !== 'paused') {
        jwplayer("player").pause(true);
      }
    }, 500);
    addHoverPlayPause();
  });
}

/**
 * 5. Adiciona Eventos de Interação por Mouse
 */
function addHoverPlayPause() {
  const playerContainer = document.getElementById("player");
  const jw = jwplayer("player");

  playerContainer.addEventListener("mouseenter", () => {
    jw.play(true);
  });

  playerContainer.addEventListener("mouseleave", () => {
    jw.pause(true);
  });
}

/**
 * Gerencia a lógica de tentativas de recarregamento.
 */
function handleRetry() {
  retryCount++;
  if (retryCount <= MAX_RETRIES) {
    console.log(`Tentando recarregar... (${retryCount}/${MAX_RETRIES})`);
    setTimeout(initializePlayer, RETRY_DELAY);
  } else {
    console.error(`Máximo de tentativas atingido. Exibindo fallback.`);
    showFinalFallback();
  }
}

/**
 * 6. Função de Inicialização
 * Orquestra todo o processo.
 */
async function initializePlayer() {
  try {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("user");
    if (!username) {
      throw new Error("Parâmetro 'user' não encontrado na URL.");
    }

    const response = await fetch(`https://api.xcam.gay/user/${encodeURIComponent(username)}/liveInfo`);
    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response Data:", data);

    // CORREÇÃO: Busca as URLs diretamente no objeto 'data'
    const videoSrc = data.edgeURL || data.cdnURL;
    if (!videoSrc) {
      throw new Error("Nenhuma fonte de vídeo (edgeURL, cdnURL) encontrada na resposta da API.");
    }

    // CORREÇÃO: Monta o objeto 'camera' com os dados disponíveis.
    const camera = {
      username: username, // Usa o username da URL, que é confiável.
      poster: data.profileImageURL || "" // Tenta usar um poster se existir.
    };

    setupPlayer(camera, videoSrc);

  } catch (err) {
    console.warn(`Falha ao inicializar o player: ${err.message}`);
    handleRetry();
  }
}

// Inicia todo o processo de carregamento do player.
initializePlayer();

/**
 * =====================================================================================
 * FIM DO SCRIPT
 * =====================================================================================
 */
