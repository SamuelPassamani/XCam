"use strict";

/**
 * =====================================================================================
 * XCam Player - script.js
 * =====================================================================================
 *
 * @author      [Seu Nome/Empresa]
 * @version     3.1.0
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
 * 5. **Fallback Robusto**: Em caso de qualquer erro (API, usuário offline,
 * etc.), exibe um vídeo de erro local para que o iframe nunca quebre.
 *
 * =====================================================================================
 */

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
 * 3. Função de Fallback
 * Em caso de qualquer erro durante o processo, esta função é chamada para
 * carregar um vídeo de erro local, garantindo uma experiência consistente.
 */
function reloadWithFallback() {
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
      error: () => {
        console.warn(
          "JW Player encontrou um erro ao reproduzir o vídeo. Exibindo fallback local."
        );
        reloadWithFallback();
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
 * 6. Função Principal (Main)
 * Orquestra todo o processo: lê a URL, busca os dados e chama a montagem do player.
 */
(async function main() {
  try {
    // Etapa 1: Ler o nome de usuário da URL
    const params = new URLSearchParams(window.location.search);
    if (!params.has("user")) {
      throw new Error(
        "[ERRO v3] Nenhum parâmetro 'user' foi fornecido na URL."
      );
    }
    const username = params.get("user");

    // Etapa 2: Buscar dados da API
    const response = await fetch(
      `https://api.xcam.gay/?user=${encodeURIComponent(username)}`
    );
    if (!response.ok) {
      throw new Error(
        `[ERRO v3] A API retornou um status de erro: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    console.log("API Response Data:", data); // DEBUG: Exibe a resposta completa no console.

    if (!data) {
      throw new Error(
        "[ERRO v3] Resposta da API está vazia ou em formato inesperado."
      );
    }

    // Etapa 3: Determinar a fonte do vídeo com ordem de prioridade
    const videoSrc =
      data.streamInfo?.edgeURL ||
      data.streamInfo?.cdnURL ||
      data.graphData?.preview?.src;
    if (!videoSrc) {
      throw new Error(
        "[ERRO v3] Nenhuma fonte de vídeo (edgeURL, cdnURL, preview.src) foi encontrada."
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
    // Etapa de Erro: Se qualquer etapa acima falhar, exibe o fallback
    console.warn(
      `Falha ao carregar o player: ${err.message} Aplicando fallback local.`
    );
    reloadWithFallback();
  }
})();

/**
 * =====================================================================================
 * FIM DO SCRIPT
 * =====================================================================================
 *
 * @log de mudanças:
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
