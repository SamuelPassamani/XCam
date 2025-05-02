"use strict";

// Obtém o valor do parâmetro 'id' na URL
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("id");

if (!videoId) {
  console.error("Nenhum ID foi fornecido na URL. Adicione ?id=valor na URL.");
} else {
  fetchCameraData(videoId);
}

// Função para buscar os dados da câmera e configurar o player
function fetchCameraData(videoId) {
  fetch("https://site.my.eu.org/0:/male.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro ao acessar o arquivo JSON: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.broadcasts && Array.isArray(data.broadcasts.items)) {
        const camera = data.broadcasts.items.find((item) => item.id === videoId);

        if (!camera) {
          console.error(`Nenhuma câmera encontrada com o ID: ${videoId}`);
          return;
        }

        setupPlayer(camera);
      } else {
        console.error("Estrutura do JSON inválida ou items não encontrados.");
      }
    })
    .catch((error) =>
      console.error("Erro ao carregar o arquivo JSON:", error)
    );
}

// Função para configurar o player
function setupPlayer(camera) {
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
      file: "https://site.my.eu.org/0:/logo560.png",
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
        title: camera.username,
        description: camera.tags.map((tag) => `#${tag.name}`).join(" "),
        image: camera.preview.poster,
        sources: [
          {
            file: camera.preview.src,
            type: "video/m3u8",
            label: "Source",
          },
        ],
      },
    ],
  });

  // Certifique-se de que o evento "ready" está configurado corretamente
  playerInstance.on("ready", () => {
    // Configurações adicionais do player
    addDownloadButton(playerInstance);
    alignTimeSlider(playerInstance);
    handleAdBlockDetection(playerInstance);

    // Configura o ADS e inicia a contagem regressiva
    handleAds(playerInstance);
  });
}

// Função para gerenciar ADS
function handleAds(playerInstance) {
  document.addEventListener("DOMContentLoaded", () => {
    const adsButton = document.getElementById("ads-button");
    const adsContainer = document.getElementById("ads-container");
    const player = document.getElementById("player");

    if (!adsButton || !adsContainer || !player) {
      console.error("Elementos de ADS não encontrados no DOM.");
      return;
    }

    let countdown = 5; // Tempo inicial da contagem

    // Inicia a contagem regressiva
    const countdownInterval = setInterval(() => {
      if (countdown > 1) {
        countdown--;
        adsButton.textContent = `Aguarde... ${countdown}`;
      } else {
        clearInterval(countdownInterval); // Para o intervalo
        adsButton.textContent = "Fechar Ads";
        adsButton.disabled = false; // Habilita o botão
        adsButton.style.cursor = "pointer"; // Atualiza o cursor
      }
    }, 1000);

    // Evento de clique no botão para fechar o ADS
    adsButton.addEventListener("click", () => {
      if (countdown <= 1) {
        adsContainer.style.display = "none"; // Esconde o ADS
        adsButton.style.display = "none"; // Esconde o botão
        player.classList.remove("player-disabled"); // Desbloqueia o player
      }
    });
  });
}

// Função para adicionar botão de download
function addDownloadButton(playerInstance) {
  const buttonId = "download-video-button";
  const iconPath =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDB6Ii8+P[...]";
  const tooltipText = "Download Video";

  playerInstance.addButton(iconPath, tooltipText, () => {
    const playlistItem = playerInstance.getPlaylistItem();
    const anchor = document.createElement("a");
    anchor.setAttribute("href", playlistItem.file);
    anchor.setAttribute("download", playlistItem.file.split("/").pop());
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, buttonId);
}

// Função para alinhar o time slider com outros controles
function alignTimeSlider(playerInstance) {
  const playerContainer = playerInstance.getContainer();
  const buttonContainer = playerContainer.querySelector(".jw-button-container");
  const spacer = buttonContainer.querySelector(".jw-spacer");
  const timeSlider = playerContainer.querySelector(".jw-slider-time");
  buttonContainer.replaceChild(timeSlider, spacer);
}

// Função para detectar bloqueadores de anúncios
function handleAdBlockDetection(playerInstance) {
  playerInstance.on("adBlock", () => {
    const modal = document.querySelector("div.modal");
    modal.style.display = "flex";

    document.getElementById("close").addEventListener("click", () => {
      location.reload();
    });
  });
}

// Função para adicionar botão de avançar 10 segundos (desabilitada)
function addForwardButton(playerInstance) {
  const playerContainer = playerInstance.getContainer();
  const rewindContainer = playerContainer.querySelector(".jw-display-icon-rewind");
  const forwardContainer = rewindContainer.cloneNode(true);
  const forwardDisplayButton = forwardContainer.querySelector(".jw-icon-rewind");

  forwardDisplayButton.style.transform = "scaleX(-1)";
  forwardDisplayButton.ariaLabel = "Forward 10 Seconds";

  const nextContainer = playerContainer.querySelector(".jw-display-icon-next");
  nextContainer.parentNode.insertBefore(forwardContainer, nextContainer);

  const buttonContainer = playerContainer.querySelector(".jw-button-container");
  const rewindControlBarButton = buttonContainer.querySelector(".jw-icon-rewind");
  const forwardControlBarButton = rewindControlBarButton.cloneNode(true);

  forwardControlBarButton.style.transform = "scaleX(-1)";
  forwardControlBarButton.ariaLabel = "Forward 10 Seconds";

  rewindControlBarButton.parentNode.insertBefore(
    forwardControlBarButton,
    rewindControlBarButton.nextElementSibling
  );

  [forwardDisplayButton, forwardControlBarButton].forEach((button) => {
    button.onclick = () => {
      playerInstance.seek(playerInstance.getPosition() + 10);
    };
  });

  // Oculta o botão "Next"
  playerContainer.querySelector(".jw-display-icon-next").style.display = "none";
}
