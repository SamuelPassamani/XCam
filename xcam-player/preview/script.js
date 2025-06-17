"use strict";

/**
 * ==========================================================
 * XCam Player - script.js
 * ==========================================================
 * Descrição:
 * Este script monta e controla o JW Player de acordo com os seguintes requisitos:
 * - Busca apenas pelo parâmetro ?user={username} na URL
 * - Consulta a API: https://api.xcam.gay/?user={username}
 * - Monta o player SEMPRE SEM controles, SEM áudio, como preview/poster animado
 * - Utiliza "cdnURL" (preferencialmente) ou "edgeURL" para videoSrc
 * - Preview automático de 1 segundo ao carregar (muted)
 * - Hover: play mudo; Mouseleave: pause
 * - Clique: função de modal placeholder (desabilitada)
 * - Fallback automático para vídeo local em caso de erro
 * - Código auditável, comentado e organizado
 * ==========================================================
 */

/**
 * 1. Injeção de CSS para ocultar todos os controles/overlays do JW Player
 * Garante visual limpo, sem controles, overlays, tooltips etc.
 */
(function injectPlayerCSS() {
  const style = document.createElement('style');
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
 * 2. Mostra imagem animada de carregamento enquanto player não está pronto
 */
(function showLoading() {
  const preloadImage = new Image();
  preloadImage.src = "https://xcam.gay/src/loading.gif";
  const playerContainer = document.getElementById("player");
  if (playerContainer) {
    playerContainer.innerHTML =
      `<img src="${preloadImage.src}" alt="Carregando..." style="width:100vw;height:100vh;object-fit:contain;background:#000;" />`;
  }
})();

/**
 * 3. Função de fallback: player exibe vídeo local de erro caso haja falha
 * Player sem controles, mudo, em loop infinito
 */
function reloadWithFallback() {
  const player = document.getElementById("player");
  if (player) {
    player.innerHTML = "";
    jwplayer("player").setup({
      file: "https://xcam.gay/src/error.mp4",
      autostart: true,
      repeat: true,
      controls: false,
      mute: true,
    });
    jwplayer("player").setControls(false);
    jwplayer("player").setMute(true);
  }
}

/**
 * 4. Função principal que configura e monta o player
 * @param {Object} camera  - Objeto unificado com dados do usuário (username, tags, poster)
 * @param {string} videoSrc - URL do stream (cdnURL)
 */
function setupPlayer(camera, videoSrc) {
  // Remove a tela de carregamento
  const playerContainer = document.getElementById("player");
  if (playerContainer) playerContainer.innerHTML = "";

  // Configura o JW Player SEMPRE SEM controles e mudo
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
        description: (camera.tags || []).map(tag => `#${tag.name}`).join(" "),
        image: camera.poster || "https://xcam.gay/src/loading.gif",
        sources: [
          {
            file: videoSrc,
            type: "application/x-mpegURL",
            label: "HD"
          }
        ],
      },
    ],
    events: {
      // Em qualquer erro, faz fallback local
      error: () => {
        console.warn("JW Player encontrou um erro ao reproduzir o vídeo. Exibindo fallback local.");
        reloadWithFallback();
      },
    },
  });

  // Quando pronto: preview de 1s, configura eventos hover/click
  jwplayer("player").on("ready", () => {
    jwplayer("player").setControls(false);
    jwplayer("player").setMute(true);

    // Preview animado de 1 segundo (poster dinâmico)
    jwplayer("player").play(true);
    setTimeout(() => {
      jwplayer("player").pause(true);
    }, 2000);

    // Ativa eventos customizados: hover play/pause + clique para modal
    addHoverPlayPauseAndModal();
  });
}

/**
 * 5. Eventos customizados para player
 * - Hover: play mudo
 * - Mouseleave: pausa
 * - Clique: chama função placeholder de modal (desabilitada)
 */
function addHoverPlayPauseAndModal() {
  const playerContainer = document.getElementById("player");
  const jw = jwplayer("player");

  // Garante SEMPRE SEM controles
  jw.setControls(false);

  // Play mudo ao hover
  playerContainer.addEventListener("mouseenter", () => {
    jw.setControls(false);
    jw.setMute(true);
    jw.play(true);
  });

  // Pause ao tirar mouse
  playerContainer.addEventListener("mouseleave", () => {
    jw.pause(true);
    jw.setControls(false);
  });

  // Clique: chama modal (placeholder)
  playerContainer.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    abrirModalDeInformacoes();
  });
}

/**
 * 6. Função principal: busca os dados do usuário e monta o player
 * - Lê apenas o parâmetro ?user={username} da URL
 * - Busca na API: https://api.xcam.gay/?user={username}
 * - Usa cdnURL (preferencial) ou edgeURL para o vídeo
 */
(async function main() {
    try {
        const params = new URLSearchParams(window.location.search);
        if (!params.has("user")) {
            throw new Error("[ERRO v2] Nenhum parâmetro 'user' foi fornecido na URL.");
        }

        const username = params.get("user");
        const response = await fetch(`https://api.xcam.gay/?user=${encodeURIComponent(username)}`);

        if (!response.ok) {
            throw new Error(`[ERRO v2] A API retornou um status de erro: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response Data:", data); // DEBUG: Mostra a resposta da API no console

        if (!data || !data.streamInfo || !data.graphData) {
            throw new Error("[ERRO v2] Resposta da API está incompleta. Faltam 'streamInfo' ou 'graphData'.");
        }

        const videoSrc = data.streamInfo.cdnURL;

        if (!videoSrc) {
            throw new Error("[ERRO v2] A chave 'cdnURL' não foi encontrada ou está vazia dentro de 'streamInfo'.");
        }

        const camera = {
            username: data.graphData.username || data.user,
            tags: data.graphData.tags || [],
            poster: data.graphData.profileImageURL || data.profileInfo?.avatarUrl
        };

        setupPlayer(camera, videoSrc);

    } catch (err) {
        console.warn(`Falha ao carregar o player: ${err.message} Aplicando fallback local.`);
        reloadWithFallback();
    }
})();


/**
 * 7. Função placeholder: modal customizado (desabilitada)
 * Mantém no código para futura implementação, mas não faz nada
 */
function abrirModalDeInformacoes() {
  // Função desabilitada. Não faz nada por enquanto.
  // Para implementar: exiba um modal customizado aqui.
}
