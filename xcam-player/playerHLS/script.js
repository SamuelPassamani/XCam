"use strict";

/**
 * =========================================================
 * XCam Player - script.js
 * =========================================================
 * Este script customiza o comportamento do JW Player para:
 * - Sempre ocultar controles, overlays e botões.
 * - Jamais permitir pausar/reproduzir por clique.
 * - Executar preview automático mudo no carregamento.
 * - Permitir play mudo por hover e pause em mouseleave.
 * - (Opcional) Clique pode abrir modal customizado.
 * - Garantir fallback local em caso de erro.
 * - Código organizado, robusto, auditável e extensível.
 * =========================================================
 */

/* =========================================================
 * 1. Injeção de CSS para ocultar todos os controles do JW Player
 * ---------------------------------------------------------
 * Garante que todos os controles, overlays, botões, títulos,
 * legendas, tooltips e overlays sejam sempre ocultos,
 * independente do estado ou atualização do player.
 * =========================================================
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

/* =========================================================
 * 2. Exibir imagem de carregamento enquanto player não está pronto
 * ---------------------------------------------------------
 * Carrega um GIF animado no container do player para indicar
 * ao usuário que a transmissão está sendo preparada/buscada.
 * =========================================================
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

/* =========================================================
 * 3. Fallback: exibe vídeo local de erro caso falhe o player
 * ---------------------------------------------------------
 * Em qualquer erro grave, limpa o player e exibe um vídeo
 * local de erro (mudo, sem controles, em loop). Garante
 * experiência amigável mesmo em caso de falha.
 * =========================================================
 */
function reloadWithFallback() {
  const player = document.getElementById("player");
  if (player) {
    // Limpa o conteúdo anterior
    player.innerHTML = "";
    // Configura JW Player para exibir o vídeo local de erro
    jwplayer("player").setup({
      file: "https://xcam.gay/src/error.mp4",
      autostart: true,
      repeat: true,
      controls: false,
      mute: true,
    });
    // Garante que controles estejam desabilitados e áudio mudo
    jwplayer("player").setControls(false);
    jwplayer("player").setMute(true);
  }
}

/* =========================================================
 * 4. Configuração principal do JW Player
 * ---------------------------------------------------------
 * - Remove tela de carregamento
 * - Configura player SEMPRE sem controles e mudo
 * - Adiciona playlist e thumbnail customizados
 * - Garante fallback em caso de erro
 * - Executa preview automático mudo de 1s ao carregar
 * - Ativa eventos customizados de hover/click
 * =========================================================
 * @param {Object} camera    Dados da transmissão
 * @param {string} username  Nome de usuário da câmera
 * @param {string} videoSrc  URL do stream m3u8
 */
function setupPlayer(camera, username, videoSrc) {
  const playerContainer = document.getElementById("player");
  if (playerContainer) playerContainer.innerHTML = "";

  jwplayer("player").setup({
    controls: false, // SEM CONTROLES
    autostart: false, // Autostart controlado manualmente
    mute: true,       // SEM ÁUDIO
    sharing: false,
    displaytitle: false,
    displaydescription: false,
    abouttext: "",
    aboutlink: "",
    skin: { name: "netflix" }, // Tema não afeta pois controles sempre ocultos
    playlist: [
      {
        title: `@${camera.username || username}`,
        description: camera.tags?.map((tag) => `#${tag.name}`).join(" ") || "",
        image: camera.preview?.poster || "https://xcam.gay/src/loading.gif",
        sources: [
          {
            file: videoSrc,
            type: "video/m3u8",
            label: "Source",
          },
        ],
      },
    ],
    events: {
      // Em qualquer erro, aciona fallback local
      error: () => {
        console.warn("Erro ao reproduzir vídeo. Exibindo fallback local.");
        reloadWithFallback();
      },
    },
  });

  // Garante SEMPRE mute, SEM controles e preview automático mudo
  jwplayer("player").on("ready", () => {
    jwplayer("player").setControls(false);
    jwplayer("player").setMute(true);

    // Preview automático de 1 segundo (MUDO)
    jwplayer("player").play(true);
    setTimeout(() => {
      jwplayer("player").pause(true);
    }, 1000);

    // Ativa eventos customizados: hover play/pause + clique para modal
    addHoverPlayPauseAndModal();
  });
}

/* =========================================================
 * 5. Eventos customizados: hover play/pause e clique para modal
 * ---------------------------------------------------------
 * - Hover: play mudo (NUNCA áudio)
 * - Mouseleave: pause
 * - Clique: abre modal customizado (NÃO pausa/reproduz)
 * =========================================================
 */
function addHoverPlayPauseAndModal() {
  const playerContainer = document.getElementById("player");
  const jw = jwplayer("player");

  // Garante SEMPRE SEM controles
  jw.setControls(false);

  // Play mudo ao passar mouse sobre o player
  playerContainer.addEventListener("mouseenter", () => {
    jw.setControls(false);
    jw.setMute(true);
    jw.play(true);
  });

  // Pause ao remover mouse do player
  playerContainer.addEventListener("mouseleave", () => {
    jw.pause(true);
    jw.setControls(false);
  });

  // Clique: chama função de modal (desabilitada, ver abaixo)
  playerContainer.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    abrirModalDeInformacoes();
  });
}

/* =========================================================
 * 6. Lógica principal: busca dados na API e inicializa player
 * ---------------------------------------------------------
 * - Lê parâmetros da URL (user/id)
 * - Busca lista de transmissões via API
 * - Encontra transmissão correta
 * - Inicializa player ou fallback caso erro
 * =========================================================
 */
(function main() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("user") || params.has("id")) {
    const isUser = params.has("user");
    const searchKey = isUser ? "username" : "id";
    const searchValue = params.get(isUser ? "user" : "id");

    fetch("https://api.xcam.gay/?limit=1500&format=json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao carregar lista de transmissões");
        }
        return response.json();
      })
      .then((data) => {
        const items = data?.broadcasts?.items || [];
        const camera = items.find((item) => item[searchKey] === searchValue);

        if (!camera) {
          console.warn(`Nenhuma câmera encontrada com o ${searchKey}:`, searchValue);
          reloadWithFallback();
          return;
        }

        if (!camera.preview?.src) {
          console.warn("Nenhum stream válido encontrado em preview.src. Aplicando fallback local.");
          reloadWithFallback();
          return;
        }

        setupPlayer(camera, camera.username, camera.preview.src);
      })
      .catch((err) => {
        console.error("Erro ao carregar a lista geral:", err);
        reloadWithFallback();
      });
  } else {
    console.warn("Nenhum parâmetro 'user' ou 'id' foi fornecido na URL.");
    reloadWithFallback();
  }
})();

/* =========================================================
 * 7. Função placeholder: abrir modal customizado de informações
 * ---------------------------------------------------------
 * Atualmente desabilitada. Permanece no código para futura
 * implementação de modal customizado ao clique no player.
 * =========================================================
 */
function abrirModalDeInformacoes() {
  // Função desabilitada; não faz nada por enquanto.
  // Para habilitar, implemente o modal customizado aqui.
  // Exemplo:
  // const modal = document.getElementById('video-info-modal');
  // if (modal) {
  //   modal.style.display = 'block';
  // }
  // else {
  //   alert("Modal de informações não implementado.");
  // }
}

/* =========================================================
 * FIM DO SCRIPT PRINCIPAL DO PLAYER XCam
 * =========================================================
 */