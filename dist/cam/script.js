"use strict";

// Obtendo os parâmetros 'user' e 'id' da URL
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("user");
const videoId = urlParams.get("id");


/**
 * Busca os dados da câmera pelo ID e configura o player.
 * @param {string} videoId
 */
function fetchCameraDataById(videoId) {
  fetch("https://api.xcam.gay/?limit=1500&format=json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro ao acessar o arquivo JSON: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const camera = data?.broadcasts?.items?.find((item) => item.id === videoId);
      if (!camera) {
        console.error(`Nenhuma câmera encontrada com o ID: ${videoId}`);
        return;
      }
      setupPlayer(camera, camera.username); // Passa o username para fallback
    })
    .catch((error) =>
      console.error("Erro ao carregar o arquivo JSON:", error)
    );
}

/**
 * Configura o JW Player com o vídeo fornecido.
 * Se `camera.preview.src` for inválido, realiza um fallback para buscar `edgeURL` ou `cdnURL`.
 * @param {Object} camera
 * @param {string} username
 */
function setupPlayer(camera, username) {
  // Verifica se `camera.preview.src` é válido
  if (!camera.preview?.src) {
    console.warn("Nenhum stream válido encontrado em preview.src. Aplicando fallback local.");
    reloadWithFallback();
    return;
} else {
    // Configura o player normalmente com `camera.preview.src`
    initializeJWPlayer(camera, camera.preview.src);
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
      file: "https://i.imgur.com/wb6N5W4.mp4",
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

      // Se preview.src estiver ausente, fazer fallback inteligente via liveInfo
      if (!camera.preview?.src) {
    console.warn("Nenhum stream válido encontrado em preview.src. Aplicando fallback local.");
    reloadWithFallback();
    return;
// [REMOVIDO] Trecho quebrado referente a /liveInfo substituído por fallback local.);
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
