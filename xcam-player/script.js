"use strict";

/**
 * Exibe imediatamente a imagem de loading ao abrir a página,
 * garantindo feedback visual ao usuário durante o carregamento.
 * 
 * Ajuste solicitado: 
 * - Adicionada propriedade 'display:block;' ao style da imagem de loading
 * - Mantido todo o restante do fluxo original
 */
const playerContainer = document.getElementById("player");
if (playerContainer) {
  playerContainer.innerHTML =
    `<img src="https://xcam.gay/src/loading.gif" alt="Carregando..." style="width:100vw;height:100vh;object-fit:contain;background:#000;display:block;" />`;
}

/**
 * Função utilitária para exibir o fallback local de erro,
 * acionando um vídeo local caso o stream não seja carregado.
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

/**
 * Função responsável por configurar o JW Player com os dados recebidos.
 * @param {Object} camera - Dados principais da câmera/transmissão.
 * @param {string} username - Nome de usuário a exibir no título.
 * @param {string} videoSrc - URL do stream de vídeo (m3u8).
 * @param {string} poster - URL da imagem de poster (preview).
 */
function setupPlayer(camera, username, videoSrc, poster) {
  const playerContainer = document.getElementById("player");
  if (playerContainer) playerContainer.innerHTML = ""; // Remove loading

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
        title: `@${camera?.username || username || "Unknown"}`,
        description: Array.isArray(camera?.tags)
          ? camera.tags.map((tag) => `#${tag.name}`).join(" ")
          : "",
        image: poster || "https://xcam.gay/src/loading.gif",
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

/**
 * Função principal responsável por iniciar o player de vídeo.
 * - Verifica os parâmetros da URL para decidir qual fonte de dados utilizar.
 * - Busca os dados na API, processa a resposta e inicializa o player.
 * - Aplica fallback local caso não seja possível reproduzir a transmissão.
 */
function initializePlayer() {
  // Obtém os parâmetros da query string da URL atual (?user=... ou ?id=...)
  const params = new URLSearchParams(window.location.search);

  // --- Fluxo 1: Busca por usuário específico ---
  if (params.has("user")) {
    // Extrai o nome de usuário do parâmetro
    const username = params.get("user");

    // Chama a API específica para dados do usuário
    fetch(`https://api.xcam.gay/?user=${encodeURIComponent(username)}`)
      .then((response) => {
        // Verifica se a resposta foi bem sucedida
        if (!response.ok) throw new Error("Erro ao carregar dados do usuário.");
        return response.json(); // Converte a resposta para JSON
      })
      .then((data) => {
        // Desestrutura os dados recebidos para facilitar o acesso
        const graphData = data.graphData || {};
        const streamInfo = data.streamInfo || {};

        // Seleciona a melhor URL de vídeo disponível (ordem de prioridade: cdnURL > edgeURL > preview.src)
        const videoSrc = streamInfo.cdnURL
          || streamInfo.edgeURL
          || (graphData.preview && graphData.preview.src);

        // Caso não exista uma URL de vídeo válida, ativa o fallback local
        if (!videoSrc) {
          console.warn("Nenhum stream válido encontrado para o usuário. Aplicando fallback local.");
          reloadWithFallback();
          return;
        }

        // Seleciona a melhor imagem de poster para o player
        // Ordem: poster do preview > imagem de perfil > gif de loading padrão
        const poster = graphData.preview?.poster
          || graphData.profileImageURL
          || "https://xcam.gay/src/loading.gif";

        // Monta o objeto de informações da câmera para o player (inclui tags se existirem)
        const camera = {
          username: graphData.username || username,
          tags: graphData.tags || [],
          preview: { poster }
        };

        // Inicializa o player JWPlayer com os dados processados
        setupPlayer(camera, username, videoSrc, poster);
      })
      .catch((err) => {
        // Caso ocorra algum erro na requisição, reporta no console e ativa fallback
        console.error("Erro ao buscar dados do usuário:", err);
        reloadWithFallback();
      });

  // --- Fluxo 2: Busca por ID da transmissão na lista geral ---
  } else if (params.has("id")) {
    // Extrai o ID da transmissão do parâmetro
    const searchValue = params.get("id");

    // Chama a API para obter a lista geral de transmissões (limitada e em formato JSON)
    fetch("https://api.xcam.gay/?limit=3333&format=json")
      .then((response) => {
        // Verifica se a resposta foi bem sucedida
        if (!response.ok) throw new Error("Erro ao carregar lista de transmissões");
        return response.json(); // Converte a resposta para JSON
      })
      .then((data) => {
        // Obtém a lista de transmissões disponíveis
        const items = data?.broadcasts?.items || [];

        // Procura a câmera/transmissão cujo ID corresponda ao buscado
        const camera = items.find((item) => item.id == searchValue);

        // Caso não encontre uma câmera correspondente, ativa fallback
        if (!camera) {
          console.warn(`Nenhuma câmera encontrada com o id: ${searchValue}`);
          reloadWithFallback();
          return;
        }

        // Se não houver fonte de vídeo válida, ativa fallback
        if (!camera.preview?.src) {
          console.warn("Nenhum stream válido encontrado em preview.src. Aplicando fallback local.");
          reloadWithFallback();
          return;
        }

        // Seleciona o poster da transmissão (ordem: poster > imagem de perfil > gif padrão)
        const poster = camera.preview?.poster
          || camera.profileImageURL
          || "https://xcam.gay/src/loading.gif";

        // Inicializa o player JWPlayer com os dados da transmissão encontrada
        setupPlayer(camera, camera.username, camera.preview.src, poster);
      })
      .catch((err) => {
        // Caso ocorra erro ao carregar a lista, ativa fallback
        console.error("Erro ao carregar a lista geral:", err);
        reloadWithFallback();
      });

  // --- Fluxo 3: Nenhum parâmetro válido encontrado, aplica fallback imediatamente ---
  } else {
    console.warn("Nenhum parâmetro 'user' ou 'id' foi fornecido na URL.");
    reloadWithFallback();
  }
}

// Executa lógica principal após DOM pronto
document.addEventListener("DOMContentLoaded", initializePlayer);

/**
 * Função para tratamento detalhado de erros do JW Player (mantida do original).
 * Exibe mensagens customizadas e countdown para fallback.
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
 * (Opcional) Função para adicionar botão de download ao player.
 * Pode ser vinculada em eventos JW Player se desejado.
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
 * (Opcional) Função para alinhar o time slider do player
 * Pode ser chamada após setupPlayer se desejado customizar UI.
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
 * Exibe o modal de anúncios com contagem regressiva (mantido do original).
 */
document.addEventListener("DOMContentLoaded", () => {
  const adModal = document.getElementById("ad-modal");
  const closeAdButton = document.getElementById("close-ad-btn");
  const countdownElement = document.getElementById("ad-countdown");
  const player = document.getElementById("player");

  if (!adModal || !closeAdButton || !countdownElement || !player) return;

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