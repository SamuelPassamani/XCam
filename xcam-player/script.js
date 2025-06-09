"use strict";

/**
 * Fallback local em caso de erro no player.
 * Exibe um vídeo de erro simples caso não seja possível carregar o stream.
 */
function reloadWithFallback() {
  const player = document.getElementById("player");
  if (player) {
    player.innerHTML = ""; // Limpa qualquer conteúdo anterior
    jwplayer("player").setup({
      file: "https://xcam.gay/src/error.mp4",
      autostart: true,
      repeat: true,
      controls: false
    });
  }
}

// === Pré-carregamento de assets e exibição de imagem de carregamento ===
const preloadImage = new Image();
preloadImage.src = "https://xcam.gay/src/loading.gif";

const preloadVideo = document.createElement("link");
preloadVideo.rel = "preload";
preloadVideo.as = "fetch";
preloadVideo.href = "https://xcam.gay/src/error.mp4";
document.head.appendChild(preloadVideo);

// Exibe a imagem de loading até o player ser carregado
const playerContainer = document.getElementById("player");
playerContainer.innerHTML =
  '<img src="' +
  preloadImage.src +
  '" alt="Carregando..." style="width:100vw;height:100vh;object-fit:contain;background:#000;" />';

/**
 * Configura o JW Player com os dados da câmera e a URL do vídeo.
 * @param {Object} camera - Objeto contendo os dados da transmissão.
 * @param {string} username - Nome de usuário da câmera.
 * @param {string} videoSrc - URL do vídeo m3u8.
 */
function setupPlayer(camera, username, videoSrc) {
  // Remove tela de carregamento, se existir
  const playerContainer = document.getElementById("player");
  playerContainer.innerHTML = ""; // Limpa o conteúdo

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
    playlist: [
      {
        title: `@${camera.username || username}`,
        description: camera.tags?.map((tag) => `#${tag.name}`).join(" ") || "",
        image: camera.preview?.poster || "https://xcam.gay/src/loading.gif",
        sources: [
          {
            file: videoSrc,
            type: "video/m3u8",
            label: "Source"
          }
        ]
      }
    ],
    events: {
      error: () => {
        console.warn("Erro ao reproduzir vídeo. Exibindo fallback local.");
        reloadWithFallback();
      }
    }
  });
}

// === Lógica principal: leitura da URL e carregamento dos dados ===
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
        console.warn(
          `Nenhuma câmera encontrada com o ${searchKey}:`,
          searchValue
        );
        reloadWithFallback();
        return;
      }

      if (!camera.preview?.src) {
        console.warn(
          "Nenhum stream válido encontrado em preview.src. Aplicando fallback local."
        );
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

/**
 * Lida com erros no JW Player.
 * @param {Object} event
 */
function handlePlayerError(event) {
  console.error("Erro no JW Player:", event.message);

  const playerContainer = document.getElementById("player");
  let countdown = 5;

  // Tabela de mensagens de erro por código
  const errorMessages = {
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
    232005: "<strong>Erro de CORS.</strong> O recurso solicitado não está acessível.",
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

  const displayErrorMessage = (message) => {
    playerContainer.innerHTML = `
      <div style="color: #FFF; background: #333; text-align: center; padding: 20px;">
        <p>${message}</p>
        <p>Recarregando o player em <span id="countdown">${countdown}</span> segundos...</p>
      </div>
    `;

    const interval = setInterval(() => {
      countdown -= 1;
      document.getElementById("countdown").textContent = countdown;

      if (countdown === 0) {
        clearInterval(interval);
        reloadWithFallback();
      }
    }, 1000);
  };

  const message = errorMessages[event.code];
  if (message) {
    displayErrorMessage(message);
  } else {
    displayErrorMessage(
      "<strong>Erro desconhecido.</strong> Algo deu errado na reprodução."
    );
  }
}

/**
 * Adiciona botão de download ao player.
 * @param {Object} playerInstance
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
 * Alinha o time slider com outros controles.
 * @param {Object} playerInstance
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

/**
 * Exibe o modal de anúncios com contagem regressiva.
 */
document.addEventListener("DOMContentLoaded", () => {
  const adModal = document.getElementById("ad-modal");
  const closeAdButton = document.getElementById("close-ad-btn");
  const countdownElement = document.getElementById("ad-countdown");
  const player = document.getElementById("player");

  let countdown = 10;

  const interval = setInterval(() => {
    countdown -= 1;
    countdownElement.textContent = countdown;

    if (countdown === 0) {
      clearInterval(interval);
      closeAdButton.textContent = "Fechar";
      closeAdButton.classList.add("enabled");
      closeAdButton.removeAttribute("disabled");
      closeAdButton.style.cursor = "pointer";
    }
  }, 1000);

  closeAdButton.addEventListener("click", () => {
    if (countdown === 0) {
      adModal.style.display = "none"; // Oculta o modal
      player.style.display = "block"; // Exibe o player
    }
  });
});