const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("id"); // Obtém o valor do parâmetro 'id' na URL

if (!videoId) {
  console.error("Nenhum ID foi fornecido na URL. Adicione ?id=valor na URL.");
} else {
  // Busca os dados do JSON
  fetch("https://site.my.eu.org/1:/male.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro ao acessar o arquivo JSON: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Verifica se broadcasts.items existe no JSON
      if (data && data.broadcasts && Array.isArray(data.broadcasts.items)) {
        const camera = data.broadcasts.items.find((item) => item.id === videoId);

        if (!camera) {
          console.error(`Nenhuma câmera encontrada com o ID: ${videoId}`);
          return;
        }

        // Configura o player com os dados da câmera correspondente
        const playerInstance = jwplayer("player").setup({
          controls: true,
          sharing: true,
          autostart: false,
          displaytitle: true,
          displaydescription: true,
          abouttext: "Buy me a coffee ☕",
          aboutlink: "https://makingoff.eu.org/help-us/",

          skin: {
            name: "netflix",
          },

          logo: {
            file: "https://i.imgur.com/1inVaQD.png",
            link: "https://www.makingoff.eu.org",
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
              description: camera.tags.map((tag) => tag.name).join(", "),
              image: camera.preview.poster,
              sources: [
                {
                  file: camera.preview.src,
                  type: "video/mp4",
                  label: "Source",
                },
              ],
            },
          ],
        });

        playerInstance.off("ready", function () {
          const buttonId = "download-video-button";
          const iconPath =
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDB6Ii8+PHBhdGggZ...";
          const tooltipText = "Download Video";

          // Adiciona o botão de download personalizado
          playerInstance.addButton(
            iconPath,
            tooltipText,
            buttonClickAction,
            buttonId
          );

          function buttonClickAction() {
            const playlistItem = playerInstance.getPlaylistItem();
            const anchor = document.createElement("a");
            const fileUrl = playlistItem.file;
            anchor.setAttribute("href", fileUrl);
            const downloadName = playlistItem.file.split("/").pop();
            anchor.setAttribute("download", downloadName);
            anchor.style.display = "none";
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
          }

          // Move o timeslider para alinhar com outros controles
          const playerContainer = playerInstance.getContainer();
          const buttonContainer = playerContainer.querySelector(
            ".jw-button-container"
          );
          const spacer = buttonContainer.querySelector(".jw-spacer");
          const timeSlider = playerContainer.querySelector(".jw-slider-time");
          buttonContainer.replaceChild(timeSlider, spacer);

          // Detecta bloqueadores de anúncios
          playerInstance.on("adBlock", () => {
            const modal = document.querySelector("div.modal");
            modal.style.display = "flex";

            document
              .getElementById("close")
              .addEventListener("click", () => location.reload());
          });

          // Adiciona botão de avançar 10 segundos
          const rewindContainer = playerContainer.querySelector(
            ".jw-display-icon-rewind"
          );
          const forwardContainer = rewindContainer.cloneNode(true);
          const forwardDisplayButton = forwardContainer.querySelector(
            ".jw-icon-rewind"
          );
          forwardDisplayButton.style.transform = "scaleX(-1)";
          forwardDisplayButton.ariaLabel = "Forward 10 Seconds";
          const nextContainer = playerContainer.querySelector(
            ".jw-display-icon-next"
          );
          nextContainer.parentNode.insertBefore(forwardContainer, nextContainer);

          // Ícone da barra de controle
          playerContainer.querySelector(
            ".jw-display-icon-next"
          ).style.display = "none"; // Oculta botão "Next"
          const rewindControlBarButton = buttonContainer.querySelector(
            ".jw-icon-rewind"
          );
          const forwardControlBarButton = rewindControlBarButton.cloneNode(true);
          forwardControlBarButton.style.transform = "scaleX(-1)";
          forwardControlBarButton.ariaLabel = "Forward 10 Seconds";
          rewindControlBarButton.parentNode.insertBefore(
            forwardControlBarButton,
            rewindControlBarButton.nextElementSibling
          );

          // Adiciona eventos de clique para avançar 10 segundos
          [forwardDisplayButton, forwardControlBarButton].forEach((button) => {
            button.onclick = () => {
              playerInstance.seek(playerInstance.getPosition() + 10);
            };
          });
        });
      } else {
        console.error("Estrutura do JSON inválida ou items não encontrados.");
      }
    })
    .catch((error) =>
      console.error("Erro ao carregar o arquivo JSON:", error)
    );
}
