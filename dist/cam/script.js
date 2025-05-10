"use strict";

// Obtém os parâmetros 'id' e 'user' na URL
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("id");
const username = urlParams.get("user");

if (!videoId && !username) {
  console.error("Nenhum ID ou nome de usuário foi fornecido na URL. Adicione ?id=valor ou ?user=valor na URL.");
} else if (username) {
  fetchCameraDataByUsername(username);
} else {
  fetchCameraDataById(videoId);
}

// Função para buscar os dados da câmera pelo parâmetro 'id' e configurar o player
function fetchCameraDataById(videoId) {
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

// Função para buscar os dados da câmera pelo parâmetro 'user' e configurar o player
function fetchCameraDataByUsername(username) {
  fetch("https://site.my.eu.org/0:/male.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro ao acessar o arquivo JSON: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.broadcasts && Array.isArray(data.broadcasts.items)) {
        const camera = data.broadcasts.items.find((item) => item.username === username);

        if (!camera) {
          console.error(`Nenhuma câmera encontrada com o nome de usuário: ${username}`);
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

// Função para configurar o player com tratamento de erros, fallback e loop
function setupPlayer(camera) {
  const videoSrc = camera.preview.src && camera.preview.src !== null 
    ? camera.preview.src 
    : "https://site.my.eu.org/0:/offline-720p.mp4";

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
        description: camera.tags.map((tag) => `#${tag.name}`).join(" "),
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
  playerInstance.on("error", (event) => {
    console.error("Erro no JW Player:", event.message);

    const playerContainer = document.getElementById("player");
    let countdown = 5; // Contagem regressiva de 5 segundos

    // Função para exibir mensagem de erro com contagem regressiva
    const displayErrorMessage = (message) => {
      playerContainer.innerHTML = `
        <div style="color: #FFF; background: #333; text-align: center; padding: 20px;">
          <p>${message}</p>
          <p>Recarregando o player em <span id="countdown">${countdown}</span> segundos...</p>
        </div>
      `;

      // Atualizar a contagem regressiva
      const interval = setInterval(() => {
        countdown -= 1;
        document.getElementById("countdown").textContent = countdown;

        // Quando a contagem chegar a 0, recarregar o player com o vídeo de fallback
        if (countdown === 0) {
          clearInterval(interval);
          reloadWithFallback(); // Chama a função para recarregar o player
        }
      }, 1000);
    };

    // Função para recarregar o player com o vídeo de fallback com autoplay e loop
    const reloadWithFallback = () => {
      jwplayer("player").setup({
        file: "https://site.my.eu.org/0:/offline-720p.mp4",
        autostart: true, // Autoplay ativado
        repeat: true, // Ativando o modo de repetição
        controls: false,
      });
    };

    // Tratamento específico para cada erro
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
