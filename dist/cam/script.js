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
  const videoSrc = camera.preview.src && camera.preview.src !== null ? camera.preview.src : "https://site.my.eu.org/0:/offline-720p.mp4";

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
        title: camera.username,
        description: camera.tags.map((tag) => `#${tag.name}`).join(" "),
        image: camera.preview.poster,
        sources: [
          {
            file: videoSrc, // Usa o valor de videoSrc (padrão ou do JSON)
            type: "video/m3u8",
            label: "Source",
          },
        ],
      },
    ],
  });

  playerInstance.on("ready", () => {
    addDownloadButton(playerInstance);
    alignTimeSlider(playerInstance);
    // addForwardButton(playerInstance); // DESABILITADO: Função para adicionar botão de avançar 10 segundos.
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

// Nova funcionalidade: Exibição do modal de anúncios com contagem regressiva
document.addEventListener("DOMContentLoaded", () => {
  const adModal = document.getElementById("ad-modal");
  const closeAdButton = document.getElementById("close-ad-btn");
  const countdownElement = document.getElementById("ad-countdown");
  const player = document.getElementById("player");

  let countdown = 10;

  // Contagem regressiva para o modal de anúncios
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

  // Ação do botão "Fechar" no modal de anúncios
  closeAdButton.addEventListener("click", () => {
    if (countdown === 0) {
      adModal.style.display = "none"; // Oculta o modal
      player.style.display = "block"; // Exibe o player
    }
  });
});
