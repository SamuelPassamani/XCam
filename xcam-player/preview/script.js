"use strict";

/**
 * =====================================================================================
 * XCam Player - script.js
 * =====================================================================================
 *
 * @author      [Seu Nome/Empresa]
 * @version     3.2.0
 * @lastupdate  17/06/2025
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
 * ordem: `edgeURL`, `cdnURL`, `preview.src`.
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
    #player .jw-controls,
    #player .jw-display,
    #player .jw-display-container,
    #player .jw-preview,
    #player .jw-logo,
    #player .jw-title,
    #player .jw-nextup-container,
    #player .jw-playlist-container,
    #player .jw-captions,
    #player .jw-button-container,
    #player .jw-tooltip,
    #player .jw-rightclick,
    #player .jw-icon,
    #player .jw-controlbar {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        background: transparent !important;
    }
    #player .jw-state-paused .jw-preview,
    #player .jw-flag-paused .jw-preview,
    #player .jw-preview {
      opacity: 1 !important;
      filter: none !important;
      background: none !important;
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

  // Reseta a contagem de tentativas em caso de sucesso
  retryCount = 0;

  // Configuração do JW Player
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
        description: (camera.tags || []).map((tag) => `#${tag.name}`).join(" "),
        image: camera.poster || "https://xcam.gay/src/loading.gif", // Poster
        sources: [
          {
            file: videoSrc,
            type: "application/x-mpegURL", // Tipo de stream
            label: "HD"
          }
        ]
      }
    ],
    events: {
      // Gatilho de erro do player
      error: (e) => {
        console.warn("JW Player encontrou um erro ao reproduzir o vídeo.", e);
        handleRetry();
      }
    }
  });

  // Evento que dispara quando o player está pronto
  jwplayer("player").on("ready", () => {
    jwplayer("player").setControls(false);
    jwplayer("player").setMute(true);

    // Preview animado: Toca por 2 segundos e pausa
    jwplayer("player").play(true);
    setTimeout(() => {
      jwplayer("player").pause(true);
    }, 2000); // [CONFIGURÁVEL] Duração do preview em milissegundos.

    // Adiciona os eventos de mouse
    addHoverPlayPause();
  });
}

/**
 * 5. Adiciona Eventos de Interação por Mouse
 * Esta função adiciona os listeners para play (ao passar o mouse) e
 * pause (ao retirar o mouse).
 */
function addHoverPlayPause() {
  const playerContainer = document.getElementById("player");
  const jw = jwplayer("player");

  // Garante que os controles estão desabilitados
  jw.setControls(false);

  // Play mudo ao passar o mouse
  playerContainer.addEventListener("mouseenter", () => {
    jw.setControls(false);
    jw.setMute(true);
    jw.play(true);
  });

  // Pausa ao retirar o mouse
  playerContainer.addEventListener("mouseleave", () => {
    jw.pause(true);
    jw.setControls(false);
  });
}

/**
 * Gerencia a lógica de tentativas de recarregamento.
 */
function handleRetry() {
  retryCount++;
  if (retryCount < MAX_RETRIES) {
    console.log(
      `Tentando recarregar o player em ${
        RETRY_DELAY / 1000
      } segundos... (Tentativa ${retryCount}/${MAX_RETRIES})`
    );
    setTimeout(initializePlayer, RETRY_DELAY);
  } else {
    console.error(
      `Número máximo de tentativas (${MAX_RETRIES}) atingido. Exibindo fallback final.`
    );
    showFinalFallback(); // Desiste e mostra o vídeo de erro.
  }
}

/**
 * 6. Função de Inicialização (Anteriormente 'main')
 * Orquestra todo o processo: lê a URL, busca os dados e chama a montagem do player.
 */
async function initializePlayer() {
  try {
    // Etapa 1: Ler o nome de usuário da URL
    const params = new URLSearchParams(window.location.search);
    if (!params.has("user")) {
      throw new Error("Nenhum parâmetro 'user' foi fornecido na URL.");
    }
    const username = params.get("user");

    // Etapa 2: Buscar dados da API
    const response = await fetch(
      `https://api.xcam.gay/user/${encodeURIComponent(username)}/liveInfo`
    );
    if (!response.ok) {
      throw new Error(
        `A API retornou um status de erro: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    console.log("API Response Data:", data); // DEBUG: Exibe a resposta completa no console.

    if (!data) {
      throw new Error("Resposta da API está vazia ou em formato inesperado.");
    }

    // Etapa 3: Determinar a fonte do vídeo com ordem de prioridade
    const videoSrc =
      data.streamInfo?.edgeURL ||
      data.streamInfo?.cdnURL ||
      data.graphData?.preview?.src;
    if (!videoSrc) {
      throw new Error(
        "Nenhuma fonte de vídeo (edgeURL, cdnURL, preview.src) foi encontrada."
      );
    }

    // Etapa 4: Montar um objeto unificado com os dados da câmera
    const camera = {
      username: data.graphData?.username || data.user,
      tags: data.graphData?.tags || [],
      poster: data.graphData?.profileImageURL || data.profileInfo?.avatarUrl
    };

    // Etapa 5: Chamar a função para montar o player
    setupPlayer(camera, videoSrc);
  } catch (err) {
    // Etapa de Erro: Se qualquer etapa acima falhar, aciona a lógica de nova tentativa.
    console.warn(`Falha ao carregar o player: ${err.message}.`);
    handleRetry();
  }
}

// Inicia todo o processo de carregamento do player pela primeira vez.
initializePlayer();

/**
 * =====================================================================================
 * FIM DO SCRIPT
 * =====================================================================================
 *
 * @log de mudanças:
 * - v3.2.0: Adicionada lógica de tentativas automáticas (retry) em caso de falha.
 * - v3.1.0: Adicionada documentação completa (cabeçalho, rodapé, comentários).
 * - v3.0.0: Removidas funções de modal. Adicionada nova ordem de prioridade de
 * vídeo (edgeURL > cdnURL > preview.src).
 * - v2.0.0: Script adaptado para a nova estrutura de resposta da API.
 * - v1.0.0: Versão inicial.
 *
 * @roadmap futuro:
 * - Otimizar o tempo de carregamento inicial.
 * - Adicionar um tratamento de erro mais granular para diferentes respostas da API.
 *
 * =====================================================================================
 */
