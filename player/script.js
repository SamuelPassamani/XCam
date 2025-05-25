"use strict";

/**
 * Exibe um vídeo local de fallback caso o stream não esteja disponível.
 */
function reloadWithFallback() {
  const player = document.getElementById("player");
  const loader = document.getElementById("loading-container");

  if (loader) loader.style.display = "none";
  if (player) {
    player.style.display = "block";
    player.innerHTML = "";
    jwplayer("player").setup({
      file: "https://drive.xcam.gay/0:/src/file/error.mp4",
      autostart: true,
      repeat: true,
      controls: false
    });
  }
}

// === Pré-carregamento de recursos críticos ===
const preloadImage = new Image();
preloadImage.src = "https://drive.xcam.gay/0:/src/img/loading.gif";

const preloadVideo = document.createElement("link");
preloadVideo.rel = "preload";
preloadVideo.as = "video";
preloadVideo.href = "https://drive.xcam.gay/0:/src/file/error.mp4";
document.head.appendChild(preloadVideo);

// Exibe imagem de carregamento antes do player
const loadingContainer = document.getElementById("loading-container");
if (loadingContainer) {
  loadingContainer.innerHTML = `
    <img src="${preloadImage.src}" alt="Carregando..."
      style="width:100vw;height:100vh;object-fit:contain;background:#000;" />
  `;
}

/**
 * Inicializa o JW Player com as informações da câmera e do stream.
 * @param {Object} camera - Objeto da câmera contendo dados da transmissão.
 * @param {string} username - Nome de usuário.
 * @param {string} videoSrc - URL do vídeo m3u8.
 */
function setupPlayer(camera, username, videoSrc) {
  const loader = document.getElementById("loading-container");
  const playerContainer = document.getElementById("player");

  if (loader) loader.style.display = "none";
  if (playerContainer) {
    playerContainer.style.display = "block";
    playerContainer.innerHTML = "";
  }

  const playerInstance = jwplayer("player").setup({
    controls: true,
    autostart: false,
    sharing: true,
    displaytitle: true,
    displaydescription: true,
    abouttext: "Buy me a coffee ☕",
    aboutlink: "https://xcam.gay/",
    skin: { name: "netflix" },
    logo: {
      file: "https://drive.xcam.gay/0:/logo2.png",
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
        image: camera.preview?.poster || preloadImage.src,
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
      error: handlePlayerError
    }
  });

  addDownloadButton(playerInstance);
  alignTimeSlider(playerInstance);
}

/**
 * Extração e tratamento dos parâmetros da URL (?user= ou ?id=)
 */
const params = new URLSearchParams(window.location.search);

if (params.has("user") || params.has("id")) {
  const isUser = params.has("user");
  const key = isUser ? "username" : "id";
  const value = params.get(isUser ? "user" : "id");

  fetch("https://api.xcam.gay/?limit=1500&format=json")
    .then((res) => res.json())
    .then((data) => {
      const camera = data?.broadcasts?.items?.find(
        (item) => item[key] === value
      );
      if (!camera || !camera.preview?.src) {
        console.warn("Câmera não encontrada ou stream ausente.");
        reloadWithFallback();
        return;
      }
      setupPlayer(camera, camera.username, camera.preview.src);
    })
    .catch((err) => {
      console.error("Erro ao carregar dados da API:", err);
      reloadWithFallback();
    });
} else {
  console.warn("Parâmetro 'user' ou 'id' não fornecido na URL.");
  reloadWithFallback();
}

/**
 * Lida com erros do JW Player com mensagens e fallback após contagem.
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

  const message =
    errorMessages[event.code] ||
    "Erro desconhecido. Algo deu errado na reprodução.";

  if (player) {
    player.innerHTML = `
      <div style="color:#fff;background:#000;text-align:center;padding:20px;">
        <p><strong>${message}</strong></p>
        <p>Recarregando em <span id="countdown">${countdown}</span>s...</p>
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
  }
}

/**
 * Adiciona botão de download ao player.
 */
function addDownloadButton(playerInstance) {
  const buttonId = "download-video-button";
  const iconPath = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL..."; // Substituir por ícone real
  const tooltipText = "Download Video";

  playerInstance.addButton(
    iconPath,
    tooltipText,
    () => {
      const playlistItem = playerInstance.getPlaylistItem();
      const anchor = document.createElement("a");
      anchor.href = playlistItem.file;
      anchor.download = playlistItem.file.split("/").pop();
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    },
    buttonId
  );
}

/**
 * Realinha o controle do tempo com os botões do player.
 */
function alignTimeSlider(playerInstance) {
  const container = playerInstance.getContainer();
  const buttonContainer = container.querySelector(".jw-button-container");
  const spacer = buttonContainer?.querySelector(".jw-spacer");
  const timeSlider = container.querySelector(".jw-slider-time");
  if (spacer && timeSlider) {
    buttonContainer.replaceChild(timeSlider, spacer);
  }
}

/**
 * Exibe o modal de anúncio com contagem regressiva.
 */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("ad-modal");
  const closeBtn = document.getElementById("close-ad-btn");
  const countdownText = document.getElementById("ad-countdown");
  const player = document.getElementById("player");

  let time = 10;

  const interval = setInterval(() => {
    time--;
    countdownText.textContent = time;
    if (time === 0) {
      clearInterval(interval);
      closeBtn.textContent = "Fechar";
      closeBtn.classList.add("enabled");
      closeBtn.removeAttribute("disabled");
      closeBtn.style.cursor = "pointer";
    }
  }, 1000);

  closeBtn.addEventListener("click", () => {
    if (time === 0) {
      modal.style.display = "none";
      player.style.display = "block";
    }
  });
});
