"use strict";

// Obtendo os parâmetros 'user' e 'id' da URL
// [REMOVIDO] Lógica de roteamento obsoleta substituída pela lógica unificada abaixo


// [REMOVIDO] Função obsoleta 'fetchCameraDataByUsername' substituída por lógica unificada
/**
 * Busca os dados da câmera pelo nome de usuário e configura o player.
 * @param {string} username
 */
function fetchCameraDataByUsername(username) {
  fetch(`https://api.xcam.gay/user/${username}/liveInfo`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro ao acessar liveInfo do usuário: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const videoSrc = data.edgeURL || data.cdnURL;
      if (!videoSrc) {
        console.warn("Nenhum stream válido encontrado. Aplicando fallback local.");
        reloadWithFallback();
        return;
      }

      // Constrói objeto 'camera' parcial para manter compatibilidade com setupPlayer
      const camera = {
        username: username,
        preview: {
          poster: "https://drive.xcam.gay/0:/logo2.png"
        },
        tags: []
      };

      setupPlayer(camera, username, videoSrc); // videoSrc passado explicitamente
    })
    .catch((error) => {
      console.error("Erro ao carregar informações do usuário:", error);
      reloadWithFallback();
    });
}

/**
 * Configura o JW Player com o vídeo fornecido.
 * Se `videoSrc` for fornecido, ele será usado diretamente.
 * Se não, usa `camera.preview.src` e aplica fallback se necessário.
 * @param {Object} camera
 * @param {string} username
 * @param {string} [videoSrc]
 */
function setupPlayer(camera, username, videoSrc) {
  const source = videoSrc || camera.preview?.src;

  if (!source) {
    console.warn("Nenhum stream válido encontrado. Aplicando fallback local.");
    reloadWithFallback();
  } else {
    initializeJWPlayer(camera, source);
  }
}

/**
 * Inicializa o JW Player com o arquivo de vídeo fornecido.
 * @param {Object} camera
 * @param {string} videoSrc
 */
function initializeJWPlayer(camera, videoSrc) {
  const playerInstance = jwplayer("player").setup({
    controls: true,
    sharing: true,
    autostart: false,
    displaytitle: true,
    displaydescription: true,
    abouttext: "Buy me a coffee ☕",
    aboutlink: "https://xcam.gay/",
    skin: { name: "netflix" },
    logo: {
      file: "https://drive.xcam.gay/0:/logo2.png",
      link: "https://xcam.gay",
    },
    captions: {
      color: "#efcc00",
      fontSize: 16,
      backgroundOpacity: 0,
      edgeStyle: "raised",
    },
    playlist: [
      {
        title: `@${camera.username}`,
        description: camera.tags?.map((tag) => `#${tag.name}`).join(" ") || "",
        image: camera.preview.poster,
        sources: [
          {
            file: videoSrc,
            type: "video/m3u8",
            label: "Source",
          },
        ],
      },
    ],
  });

  // Tratamento de erros do JW Player
  playerInstance.on("error", handlePlayerError);

  // Configurações adicionais quando o player estiver pronto
  playerInstance.on("ready", () => {
    addDownloadButton(playerInstance);
    alignTimeSlider(playerInstance);
    // addForwardButton(playerInstance); // Botão desativado
  });
}

/**
 * Lida com erros no JW Player.
 * @param {Object} event
 */
function handlePlayerError(event) {
  console.error("Erro no JW Player:", event.message);

  const playerContainer = document.getElementById("player");
  let countdown = 5;

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

  const reloadWithFallback = () => {
    jwplayer("player").setup({
      file: "https://drive.xcam.gay/0:/src/file/error.mp4",
      autostart: true,
      repeat: true,
      controls: false,
    });
  };

  if (event.code === 232600) {
    displayErrorMessage(
      "<strong>Erro ao reproduzir o vídeo.</strong> O arquivo está indisponível ou corrompido."
    );
  } else if (event.code === 232011) {
    displayErrorMessage(
      "<strong>Erro de conexão.</strong> Não foi possível carregar o vídeo devido a problemas de rede ou configurações do navegador."
    );
  } else if (event.code === 232001) {
    displayErrorMessage(
      "<strong>Erro de conexão com o servidor.</strong> Não foi possível se conectar ao servidor do vídeo."
    );
  }
}

/**
 * Adiciona botão de download ao player.
 * @param {Object} playerInstance
 */
function addDownloadButton(playerInstance) {
  const buttonId = "download-video-button";
  const iconPath =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL[...]";
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
  buttonContainer.replaceChild(timeSlider, spacer);
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


// === Gerencia carregamento de dados baseado nos parâmetros da URL ===
const params = new URLSearchParams(window.location.search);

if (params.has("user") || params.has("id")) {
  const isUser = params.has("user");
  const searchKey = isUser ? "username" : "id";
  const searchValue = params.get(searchKey);

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

      // Se preview.src estiver ausente, fazer fallback inteligente via liveInfo
      if (!camera.preview?.src) {
        fetch(`https://api.xcam.gay/user/${camera.username}/liveInfo`)
          .then((res) => res.json())
          .then((liveData) => {
            const streamURL = liveData.edgeURL || liveData.cdnURL;
            if (!streamURL) {
              console.warn("Nenhum stream válido encontrado via liveInfo.");
              reloadWithFallback();
              return;
            }
            setupPlayer(camera, camera.username, streamURL);
          })
          .catch((err) => {
            console.error("Erro ao buscar stream em liveInfo:", err);
            reloadWithFallback();
          });
      } else {
        // Caso padrão: usar preview.src
        setupPlayer(camera, camera.username, camera.preview.src);
      }
    })
    .catch((err) => {
      console.error("Erro ao carregar a lista geral:", err);
      reloadWithFallback();
    });
}
