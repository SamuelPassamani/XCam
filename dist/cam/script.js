"use strict";

// Obtendo os parâmetros 'id' e 'user' da URL
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("id");
const username = urlParams.get("user");

// Verifica se os parâmetros estão presentes e inicia a busca de dados
if (!videoId && !username) {
  console.error(
    "Nenhum ID ou nome de usuário foi fornecido na URL. Adicione ?id=valor ou ?user=valor na URL."
  );
} else if (username) {
  fetchCameraDataByUsername(username);
} else {
  fetchCameraDataById(videoId);
}

/**
 * Busca os dados da câmera pelo ID e configura o player.
 * @param {string} videoId
 */
function fetchCameraDataById(videoId) {
  fetch("https://xcam.moviele.workers.dev/v1/?limit=1500&format=json")
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
 * Busca os dados da câmera pelo nome de usuário e configura o player.
 * @param {string} username
 */
function fetchCameraDataByUsername(username) {
  fetch("https://xcam.moviele.workers.dev/v1/?limit=1500&format=json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro ao acessar o arquivo JSON: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const camera = data?.broadcasts?.items?.find((item) => item.username === username);
      if (!camera) {
        console.error(`Nenhuma câmera encontrada com o nome de usuário: ${username}`);
        return;
      }
      setupPlayer(camera, username); // Passa o username para fallback
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
    console.warn("Nenhum valor válido para 'camera.preview.src'. Iniciando fallback...");

    // Fallback: Consulta o endpoint da Cam4
    fetch(`https://pt.cam4.com/rest/v1.0/profile/${username}/streamInfo`, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        priority: "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"136\", \"Microsoft Edge\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
      },
      referrer: `https://pt.cam4.com/${username}`,
      referrerPolicy: "strict-origin-when-cross-origin",
      method: "GET",
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro ao acessar o endpoint Cam4: ${response.status}`);
        }
        return response.json();
      })
      .then((streamData) => {
        const fallbackSrc = streamData.edgeURL || streamData.cdnURL;
        if (!fallbackSrc) {
          throw new Error("Nenhum valor válido encontrado para 'edgeURL' ou 'cdnURL' no fallback.");
        }

        // Configura o player com o fallbackSrc
        initializeJWPlayer(camera, fallbackSrc);
      })
      .catch((error) => {
        console.error("Erro durante o fallback:", error);
      });
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
      file: "https://site.my.eu.org/0:/logo2.png",
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
