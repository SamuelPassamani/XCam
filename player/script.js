"use strict";

/**
 * Exibe um vídeo de fallback local caso o stream não esteja disponível ou ocorra erro.
 */
function reloadWithFallback() {
  const loader = document.getElementById("loading-container");
  const player = document.getElementById("player");
  if (loader) loader.style.display = "none"; // Remove tela de carregamento
  if (player) {
    player.style.display = "block";
    player.innerHTML = ""; // Limpa conteúdo anterior
    jwplayer("player").setup({
      // Configura o player com vídeo de erro
      file: "https://drive.xcam.gay/0:/src/file/error.mp4",
      autostart: true,
      repeat: true,
      controls: false
    });
  }
}

// Pré-carregamento de recursos críticos (não bloqueiam a exibição inicial do loader).
const preloadImage = new Image();
preloadImage.src = "https://drive.xcam.gay/0:/src/img/loading.gif";
const preloadVideo = document.createElement("link");
preloadVideo.rel = "preload";
preloadVideo.as = "video";
preloadVideo.href = "https://drive.xcam.gay/0:/src/file/error.mp4";
document.head.appendChild(preloadVideo);

/**
 * Inicializa o JW Player com os dados da câmera e do stream.
 * @param {Object} camera - Dados da transmissão (do JSON da API).
 * @param {string} username - Nome de usuário da câmera.
 * @param {string} videoSrc - URL do stream M3U8.
 */
function setupPlayer(camera, username, videoSrc) {
  const loader = document.getElementById("loading-container");
  const playerContainer = document.getElementById("player");
  if (loader) loader.style.display = "none"; // Esconde loader
  if (playerContainer) {
    playerContainer.style.display = "block"; // Mostra o player
    playerContainer.innerHTML = ""; // Limpa conteúdo do player
  }

  const playerInstance = jwplayer("player");
  playerInstance.setup({
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
        sources: [{ file: videoSrc, type: "video/m3u8", label: "Source" }]
      }
    ]
  });
  // Associa o tratamento de erro usando on('error') para exibir mensagem e contagem
  playerInstance.on("error", handlePlayerError);

  addDownloadButton(playerInstance);
  alignTimeSlider(playerInstance);
}

/**
 * Lê parâmetros da URL e carrega dados via API. Se inválido, aplica fallback.
 */
const params = new URLSearchParams(window.location.search);
if (params.has("user") || params.has("id")) {
  const isUser = params.has("user");
  const key = isUser ? "username" : "id";
  const value = params.get(isUser ? "user" : "id");

  fetch("https://api.xcam.gay/?limit=1500&format=json")
    .then((res) => res.json())
    .then((data) => {
      const items = data?.broadcasts?.items || [];
      const camera = items.find((item) => item[key] === value);
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
 * Trata erros do JW Player exibindo mensagem contextual e contador regressivo.
 * @param {Object} event - Evento de erro do JW Player.
 */
function handlePlayerError(event) {
  console.error("Erro no JW Player:", event.message);
  const playerContainer = document.getElementById("player");
  let countdown = 5;

  // Mensagens de erro contextualizadas por código
  const errorMessages = {
    100000: "<strong>Erro desconhecido.</strong> O player falhou ao carregar.",
    100001: "<strong>Tempo limite.</strong> A configuração demorou muito.",
    100011: "<strong>Licença ausente.</strong> Chave de licença não fornecida.",
    100012: "<strong>Licença inválida.</strong> Chave de licença inválida.",
    100013: "<strong>Licença expirada.</strong> A chave de licença expirou.",
    101100: "<strong>Componente ausente.</strong> Falha ao carregar componente necessário.",
    224002: "<strong>Formato não suportado.</strong> O vídeo não é suportado.",
    224003: "<strong>Vídeo corrompido.</strong> O vídeo está danificado.",
    230000: "<strong>Erro de decodificação.</strong> Não foi possível decodificar o vídeo.",
    232001: "<strong>Erro de conexão.</strong> Não foi possível conectar ao servidor de vídeo.",
    232002: "<strong>Erro de rede.</strong> Falha na requisição de mídia.",
    232003: "<strong>Erro de mídia.</strong> O arquivo de vídeo pode estar corrompido.",
    232004: "<strong>Erro de DRM.</strong> Conteúdo protegido não pôde ser reproduzido.",
    232005: "<strong>Erro de CORS.</strong> O recurso solicitado não está acessível.",
    232006: "<strong>Erro de autenticação.</strong> Acesso não autorizado ao conteúdo.",
    232007: "<strong>Erro de licença.</strong> Falha ao validar a licença do conteúdo.",
    232008: "<strong>Token inválido.</strong> Token expirado ou corrompido.",
    232009: "<strong>Erro de assinatura.</strong> Verificação de integridade falhou.",
    232010: "<strong>Restrição geográfica.</strong> Conteúdo indisponível nesta região.",
    232011: "<strong>Erro de conexão.</strong> Problemas de rede ou navegador.",
    232012: "<strong>Erro de tempo limite.</strong> O conteúdo demorou muito para carregar.",
    232013: "<strong>Formato incompatível.</strong> O formato do vídeo não é compatível.",
    232014: "<strong>Erro de codec.</strong> Codec necessário não disponível.",
    232015: "<strong>Erro de resolução.</strong> Resolução não suportada.",
    232016: "<strong>Erro de bitrate.</strong> Taxa de bits muito alta para o dispositivo.",
    232017: "<strong>Erro de buffer.</strong> O vídeo não pôde ser carregado.",
    232018: "<strong>Erro de sincronização.</strong> Áudio e vídeo fora de sincronia.",
    232019: "<strong>Erro de renderização.</strong> O vídeo não pôde ser renderizado.",
    232020: "<strong>Erro desconhecido.</strong> Um erro não identificado ocorreu.",
    232600: "<strong>Erro no stream.</strong> Arquivo indisponível ou corrompido."
  };

  const message =
    errorMessages[event.code] ||
    "Erro desconhecido. Algo deu errado na reprodução.";
  if (playerContainer) {
    playerContainer.innerHTML = `
      <div style="color:#fff; background:#000; text-align:center; padding:20px;">
        <p><strong>${message}</strong></p>
        <p>Recarregando em <span id="countdown">${countdown}</span>s...</p>
      </div>`;
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
 * Adiciona um botão de download ao player JW Player.
 * @param {Object} playerInstance - Instância do JW Player.
 */
function addDownloadButton(playerInstance) {
  const buttonId = "download-video-button";
  const iconPath = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL..."; // Ícone SVG base64
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
 * Reposiciona o controle de tempo no player para ficar ao lado dos botões.
 * @param {Object} playerInstance - Instância do JW Player.
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
 * Exibe o modal de anúncios com contagem regressiva ao carregar a página.
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
