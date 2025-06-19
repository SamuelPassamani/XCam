"use strict";

/**
 * =====================================================================================
 * XCam Player - Script Unificado (v5.6)
 * =====================================================================================
 *
 * @author      Samuel Passamani
 * @version     5.6.0
 * @lastupdate  19/06/2025
 *
 * @description Este script é o cérebro por trás do player de vídeo do XCam. Ele é
 * projetado para ser altamente modular e operar em dois modos distintos,
 * controlados pelo parâmetro de URL `?mode=preview`.
 *
 * @mode        1. **Modo Padrão (Player Completo):**
 * - Ativado por defeito.
 * - Exibe um player de vídeo completo com todos os controlos,
 * logo, opções de partilha e um modal de anúncio inicial.
 * - Suporta o carregamento de transmissões por `?user=` ou `?id=`.
 *
 * @mode        2. **Modo Preview (Poster Animado):**
 * - Ativado com a adição de `?mode=preview` à URL.
 * - Ideal para ser embutido em `iframes` numa grelha de utilizadores.
 * - Oculta completamente a interface do player via injeção de CSS.
 * - Comportamento: Autoplay mudo por um tempo configurável, pausa,
 * e reativa com a passagem do rato (hover).
 * - Implementa um sistema robusto de tentativas em caso de erro.
 *
 * =====================================================================================
 */

// --- Roteador Principal ---
// Este evento é o ponto de entrada. Ele espera o DOM estar pronto e então decide
// qual modo do player inicializar com base nos parâmetros da URL.
document.addEventListener("DOMContentLoaded", () => {
  // Cria um objeto para facilitar a manipulação dos parâmetros da URL.
  const params = new URLSearchParams(window.location.search);
  // Verifica se o parâmetro `mode` com o valor `preview` existe.
  const isPreviewMode = params.get("mode") === "preview";

  if (isPreviewMode) {
    // --- LÓGICA PARA MODO PREVIEW ---
    // Ajusta a visibilidade inicial dos elementos para evitar o "piscar" do modal.
    const adModal = document.getElementById("ad-modal");
    const playerWrapper = document.getElementById("player");
    if (adModal) adModal.style.display = "none"; // Esconde o modal de anúncio.
    if (playerWrapper) playerWrapper.style.display = "block"; // Mostra o contêiner do player.
    
    // Chama a função que inicializa o player no modo de preview.
    initializePreviewPlayer();
  } else {
    // --- LÓGICA PARA MODO PADRÃO ---
    // Chama a função que inicializa o player completo.
    initializeMainPlayer();
  }
});


// =====================================================================================
// === MODO PREVIEW ====================================================================
// =====================================================================================

// Objeto de configuração para o modo preview, centralizando os valores ajustáveis.
const PREVIEW_CONFIG = {
  MAX_RETRIES: 7,       // [CONFIGURÁVEL] Número máximo de tentativas de recarregamento.
  RETRY_DELAY: 5000,    // [CONFIGURÁVEL] Tempo de espera entre as tentativas (em ms).
  PREVIEW_DURATION: 3000, // [CONFIGURÁVEL] Duração do autoplay inicial (em ms).
  API_ENDPOINT: "https://api.xcam.gay/user/", // Endpoint da API para o preview.
  FALLBACK_VIDEO: "https://xcam-drive.aserio.workers.dev/0:/files/loading.webm", // Vídeo de erro.
  LOADING_GIF: "https://xcam.gay/src/loading.gif" // Imagem de carregamento.
};

// Contador para as tentativas de recarregamento no modo preview.
let previewRetryCount = 0;

// Injeta o CSS que oculta toda a interface do JW Player.
function injectPreviewCSS() {
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
}

// Exibe a imagem de carregamento enquanto os dados são buscados.
function showPreviewLoading() {
  const playerContainer = document.getElementById("player");
  if (playerContainer) {
    playerContainer.innerHTML = `<img src="${PREVIEW_CONFIG.LOADING_GIF}" alt="Carregando..." style="width:100%;height:100%;object-fit:contain;background:#000;" />`;
  }
}

// Exibe o vídeo de fallback final após todas as tentativas falharem.
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

// Configura e monta o player no modo preview.
function setupPreviewPlayer(camera, videoSrc) {
  const playerContainer = document.getElementById("player");
  if (playerContainer) playerContainer.innerHTML = "";
  previewRetryCount = 0; // Reseta o contador de tentativas em caso de sucesso.

  jwplayer("player").setup({
    controls: false,
    autostart: true, // Começa a tocar automaticamente para o efeito de preview.
    mute: true,
    hlsjsConfig: { withCredentials: true },
    playlist: [{
      title: `@${camera.username}`,
      image: camera.poster,
      sources: [{ file: videoSrc, type: "application/x-mpegURL" }]
    }],
    events: {
      error: handlePreviewPlayerError // Usa o handler de erro específico do modo preview.
    }
  });

  // Quando o player está pronto, define o comportamento de autoplay/pause.
  jwplayer("player").on("ready", () => {
    setTimeout(() => {
      // Pausa o vídeo após a duração do preview, se ainda estiver a tocar.
      if (jwplayer("player")?.getState() !== 'paused') {
        jwplayer("player").pause(true);
      }
    }, PREVIEW_CONFIG.PREVIEW_DURATION);
    addPreviewHoverEvents(); // Adiciona os eventos de interação do rato.
  });
}

// Adiciona os eventos de "play" ao passar o rato e "pause" ao retirar.
function addPreviewHoverEvents() {
  const playerContainer = document.getElementById("player");
  const jw = jwplayer("player");
  playerContainer.addEventListener("mouseenter", () => jw.play(true));
  playerContainer.addEventListener("mouseleave", () => jw.pause(true));
}

// Gerencia a lógica de múltiplas tentativas em caso de erro no modo preview.
function handlePreviewRetry() {
  previewRetryCount++;
  if (previewRetryCount <= PREVIEW_CONFIG.MAX_RETRIES) {
    console.log(`Tentando recarregar... (${previewRetryCount}/${PREVIEW_CONFIG.MAX_RETRIES})`);
    setTimeout(initializePreviewPlayer, PREVIEW_CONFIG.RETRY_DELAY);
  } else {
    console.error(`Máximo de tentativas atingido. Exibindo fallback.`);
    showPreviewFallback();
  }
}

// Função de inicialização para o modo preview.
async function initializePreviewPlayer() {
  injectPreviewCSS();
  showPreviewLoading();
  try {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("user");
    if (!username) throw new Error("Parâmetro 'user' não encontrado.");

    const response = await fetch(`${PREVIEW_CONFIG.API_ENDPOINT}${encodeURIComponent(username)}/liveInfo`);
    if (!response.ok) throw new Error(`API retornou status ${response.status}`);
    
    const data = await response.json();
    const videoSrc = data.edgeURL || data.cdnURL;
    if (!videoSrc) throw new Error("Nenhuma fonte de vídeo encontrada.");

    const camera = { username: username, poster: "" };
    setupPreviewPlayer(camera, videoSrc);
  } catch (err) {
    console.warn(`Falha ao inicializar o preview player: ${err.message}`);
    handlePreviewRetry();
  }
}


// =====================================================================================
// === MODO PADRÃO (Player Completo - Lógica Original Preservada) ======================
// =====================================================================================

// Função de inicialização para o modo principal.
function initializeMainPlayer() {
    const playerContainer = document.getElementById("player");
    if (playerContainer) {
        playerContainer.innerHTML =
            `<img src="https://xcam.gay/src/loading.gif" alt="Carregando..." style="width:100%;height:100%;object-fit:contain;background:#000;" />`;
    }
    
    // Chama a lógica do modal, que só pertence a este modo.
    initializeAdModal();
    
    const params = new URLSearchParams(window.location.search);

    // Fluxo 1: Carrega por nome de utilizador.
    if (params.has("user")) {
        const username = params.get("user");
        fetch(`https://api.xcam.gay/?user=${encodeURIComponent(username)}`)
            .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
            .then(data => {
                const graphData = data.graphData || {};
                const streamInfo = data.streamInfo || {};
                const videoSrc = streamInfo.cdnURL || streamInfo.edgeURL || graphData.preview?.src;

                if (!videoSrc) {
                    reloadWithFallback();
                    return;
                }

                const poster = graphData.preview?.poster || graphData.profileImageURL || "https://xcam.gay/src/loading.gif";
                const camera = {
                    username: graphData.username || username,
                    tags: graphData.tags || [],
                };
                setupMainPlayer(camera, username, videoSrc, poster);
            })
            .catch(err => {
                console.error("Erro ao buscar dados do usuário:", err);
                reloadWithFallback();
            });
    // Fluxo 2: Carrega por ID da transmissão.
    } else if (params.has("id")) {
        const searchValue = params.get("id");
        fetch("https://api.xcam.gay/?limit=3333&format=json")
            .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
            .then(data => {
                const items = data?.broadcasts?.items || [];
                const camera = items.find(item => item.id == searchValue);
                if (!camera || !camera.preview?.src) {
                    reloadWithFallback();
                    return;
                }
                const poster = camera.preview?.poster || camera.profileImageURL || "https://xcam.gay/src/loading.gif";
                setupMainPlayer(camera, camera.username, camera.preview.src, poster);
            })
            .catch(err => {
                console.error("Erro ao carregar a lista geral:", err);
                reloadWithFallback();
            });
    // Fluxo 3: Nenhum parâmetro válido.
    } else {
        reloadWithFallback();
    }
}

// Configura e monta o player no modo principal.
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
        hlsjsConfig: { withCredentials: true },
        playlist: [{
            title: `@${camera?.username || username || "Unknown"}`,
            description: Array.isArray(camera?.tags) ? camera.tags.map(tag => `#${tag.name}`).join(" ") : "",
            image: poster,
            sources: [{
                file: videoSrc,
                type: "application/x-mpegURL",
                label: "Source"
            }]
        }],
        events: {
            error: handleMainPlayerError // Usa o handler de erro detalhado para o modo principal.
        }
    });
}

// Função de fallback simples para o modo principal.
function reloadWithFallback() {
    const player = document.getElementById("player");
    if (player) {
        player.innerHTML = "";
        jwplayer("player").setup({
            file: "https://xcam.gay/src/error.mp4",
            autostart: true,
            repeat: true,
            controls: false
        });
    }
}

// =====================================================================================
// === TRATAMENTO DE ERROS UNIFICADO ===================================================
// =====================================================================================

// Mapeamento completo dos códigos de erro do JW Player para mensagens amigáveis.
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

/**
 * Exibe uma mensagem de erro detalhada no player e inicia um countdown para uma ação de fallback.
 * @param {object} event - O objeto de erro do JW Player.
 * @param {function} fallbackAction - A função a ser chamada após o countdown (ex: reloadWithFallback ou handlePreviewRetry).
 */
function displayErrorMessage(event, fallbackAction) {
    console.error("Erro no JW Player:", event);
    const playerContainer = document.getElementById("player");
    let countdown = 5;
    const message = ERROR_MESSAGES[event.code] || `<strong>Erro desconhecido (${event.code}).</strong>`;
    
    playerContainer.innerHTML = `
      <div style="color: #FFF; background: #333; text-align: center; padding: 20px; font-family: sans-serif; height: 100%; display: flex; flex-direction: column; justify-content: center;">
        <p style="margin: 0; font-size: 14px;">${message}</p>
        <p style="margin: 10px 0 0 0; font-size: 12px;">A tentar novamente em <span id="countdown">${countdown}</span>s...</p>
      </div>`;

    const interval = setInterval(() => {
        countdown--;
        const countdownSpan = document.getElementById("countdown");
        if(countdownSpan) countdownSpan.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(interval);
            fallbackAction();
        }
    }, 1000);
}

// Handler de erro específico para o modo principal, que chama o fallback simples.
function handleMainPlayerError(event) {
    displayErrorMessage(event, reloadWithFallback);
}

// Handler de erro específico para o modo preview, que chama a lógica de múltiplas tentativas.
function handlePreviewPlayerError(event) {
    displayErrorMessage(event, handlePreviewRetry);
}


// =====================================================================================
// === LÓGICA DO MODAL DE ANÚNCIO (Apenas para Modo Padrão) ============================
// =====================================================================================

function initializeAdModal() {
    const adModal = document.getElementById("ad-modal");
    const closeAdButton = document.getElementById("close-ad-btn");
    const countdownElement = document.getElementById("ad-countdown");
    const player = document.getElementById("player");

    if (!adModal || !closeAdButton || !countdownElement || !player) return;

    // Torna o modal visível, já que ele agora começa escondido no HTML.
    adModal.style.display = "flex"; 
    // Esconde o player para dar espaço ao modal.
    player.style.display = "none";

    let countdown = 10;
    countdownElement.textContent = countdown;

    const interval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(interval);
            closeAdButton.textContent = "Fechar";
            closeAdButton.removeAttribute("disabled");
            closeAdButton.style.cursor = "pointer";
        }
    }, 1000);

    closeAdButton.addEventListener("click", () => {
        if (countdown <= 0) {
            adModal.style.display = "none";
            player.style.display = "block";
        }
    });
}


/**
 * =====================================================================================
 * FIM DO SCRIPT
 * =====================================================================================
 *
 * @log
 * - v5.6: Adicionado tratamento de erros detalhado e unificado para ambos os modos.
 * - v5.5: Restaurada a lógica completa do player principal (busca por ID, erros, etc.).
 * - v5.4: Implementação da arquitetura de modo duplo (padrão vs. preview).
 *
 * @roadmap
 * - Implementar "Infinite Scrolling" na grelha de `broadcasts.js`.
 * - Adicionar funcionalidade de "Favoritos" com persistência em `localStorage`.
 *
 * =====================================================================================
 */
