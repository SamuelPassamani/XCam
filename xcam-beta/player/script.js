const playerInstance = jwplayer("player").setup({
  controls: true,
  sharing: true,
  displaytitle: true,
  displaydescription: true,
  abouttext: "Buy Me a Coffee",
  aboutlink: "https://www.buymeacoffee.com/pingo",

  skin: {
    name: "netflix"
  },

  logo: {
    file: "https://xcam.gay/src/logo.svg",
    link: "https://www.buymeacoffee.com/pingo"
  },

  captions: {
    color: "#FFF",
    fontSize: 14,
    backgroundOpacity: 0,
    edgeStyle: "raised"
  },

  playlist: [
    {
      title: "@tentationdivine",
      description: "You're Watching",
      image: "https://poster.xcam.gay/tentationdivine.jpg",
      sources: [
        {
          file: "https://api.xcam.gay/stream/tentationdivine.m3u8",
          label: "Source",
          type: "video/x-mpegURL",
          default: true
        }
      ]

      /* LEGENDA DESABILITADA: O bloco de 'captions' abaixo foi comentado 
        para ocultar o botão e as opções de legenda no player.
      */
      /*
      captions: [
        {
          file:
            "https://raw.githubusercontent.com/iPingOi/jwplayer/main/%5BBengali%5D%20Sprite%20Fright%20-%20Blender%20Open%20Movie.srt",
          label: "Bangla",
          kind: "captions"
        },
        {
          file:
            "https://raw.githubusercontent.com/iPingOi/jwplayer/main/%5BEnglish%5D%20Sprite%20Fright%20-%20Blender%20Open%20Movie.srt",
          label: "English",
          kind: "captions",
          default: true
        },
        {
          file:
            "https://raw.githubusercontent.com/iPingOi/jwplayer/main/%5BGerman%5D%20Sprite%20Fright%20-%20Blender%20Open%20Movie.srt",
          label: "German",
          kind: "captions"
        },
        {
          file:
            "https://raw.githubusercontent.com/iPingOi/jwplayer/main/%5BHungarian%5D%20Sprite%20Fright%20-%20Blender%20Open%20Movie.srt",
          label: "Hungarian",
          kind: "captions"
        },
        {
          file:
            "https://raw.githubusercontent.com/iPingOi/jwplayer/main/%5BItalian%5D%20Sprite%20Fright%20-%20Blender%20Open%20Movie.srt",
          label: "Italian",
          kind: "captions"
        },
        {
          file:
            "https://raw.githubusercontent.com/iPingOi/jwplayer/main/%5BMalayalam%5D%20Sprite%20Fright%20-%20Blender%20Open%20Movie.srt",
          label: "Malayalam",
          kind: "captions"
        },
        {
          file:
            "https://raw.githubusercontent.com/iPingOi/jwplayer/main/%5BPortugu%C3%AAs%20(Portugal)%5D%20Sprite%20Fright%20-%20Blender%20Open%20Movie.srt",
          label: "Portuguese",
          kind: "captions"
        },
        {
          file:
            "https://raw.githubusercontent.com/iPingOi/jwplayer/main/%5BRussian%5D%20Sprite%20Fright%20-%20Blender%20Open%20Movie.srt",
          label: "Russian",
          kind: "captions"
        },
        {
          file:
            "https://raw.githubusercontent.com/iPingOi/jwplayer/main/%5BSpanish%5D%20Sprite%20Fright%20-%20Blender%20Open%20Movie.srt",
          label: "Spanish",
          kind: "captions"
        }
      ],
      */

      /* MINIATURAS DESABILITADAS: O bloco de 'tracks' abaixo foi comentado
        para desabilitar as miniaturas na barra de progresso.
      */
      /*
      tracks: [
        {
          file: "https://cdn.jwplayer.com/strips/iYfADWO1-120.vtt",
          kind: "thumbnails"
        }
      ]
      */
    }
  ],
  advertising: {
    client: "vast",
    schedule: [
      {
        offset: "pre",
        tag: "https://s.magsrv.com/v1/vast.php?idzone=5687484"
      }
    ]
  }
});

playerInstance.on("ready", function () {
  const buttonId = "download-video-button";
  const iconPath =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDB6Ii8+PHBhdGggZD0iTTMgMTloMTh2Mkgzdi0yem0xMC01LjgyOEwxOS4wNzEgNy4xbDEuNDE0IDEuNDE0TDEyIDE3IDMuNTE1IDguNTE1IDQuOTI5IDcuMSAxMSAxMy4xN1YyaDJ2MTEuMTcyeiIgZmlsbD0icmdiYSgyNDcsMjQ3LDI0NywxKSIvPjwvc3ZnPg==";
  const tooltipText = "Download Video";

  // Call the player's `addButton` API method to add the custom button
  playerInstance.addButton(iconPath, tooltipText, buttonClickAction, buttonId);

  // This function is executed when the button is clicked
  function buttonClickAction() {
    const playlistItem = playerInstance.getPlaylistItem();
    if (playlistItem && playlistItem.file) {
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
  }

  // Move the timeslider in-line with other controls
  const playerContainer = playerInstance.getContainer();
  const buttonContainer = playerContainer.querySelector(".jw-button-container");
  const spacer = buttonContainer
    ? buttonContainer.querySelector(".jw-spacer")
    : null;
  const timeSlider = playerContainer.querySelector(".jw-slider-time");

  // CORREÇÃO: Inserir a barra de tempo ANTES do espaçador para manter o alinhamento dos ícones.
  if (spacer && timeSlider && spacer.parentNode) {
    spacer.parentNode.insertBefore(timeSlider, spacer);
  }

  // Detect adblock
  playerInstance.on("adBlock", () => {
    const modal = document.querySelector("div.modal");
    if (modal) {
      modal.style.display = "flex";
      const closeButton = document.getElementById("close");
      if (closeButton) {
        closeButton.addEventListener("click", () => location.reload());
      }
    }
  });

  // Forward 10 seconds
  const rewindContainer = playerContainer.querySelector(
    ".jw-display-icon-rewind"
  );

  if (rewindContainer) {
    const forwardContainer = rewindContainer.cloneNode(true);
    const forwardDisplayButton = forwardContainer.querySelector(
      ".jw-icon-rewind"
    );
    const nextContainer = playerContainer.querySelector(
      ".jw-display-icon-next"
    );

    if (forwardDisplayButton && nextContainer && nextContainer.parentNode) {
      forwardDisplayButton.style.transform = "scaleX(-1)";
      forwardDisplayButton.ariaLabel = "Forward 10 Seconds";
      nextContainer.parentNode.insertBefore(forwardContainer, nextContainer);

      // control bar icon
      const nextButton = playerContainer.querySelector(".jw-display-icon-next");
      if (nextButton) {
        nextButton.style.display = "none"; // hide next button
      }

      const rewindControlBarButton = buttonContainer.querySelector(
        ".jw-icon-rewind"
      );

      if (rewindControlBarButton && rewindControlBarButton.parentNode) {
        const forwardControlBarButton = rewindControlBarButton.cloneNode(true);
        forwardControlBarButton.style.transform = "scaleX(-1)";
        forwardControlBarButton.ariaLabel = "Forward 10 Seconds";
        rewindControlBarButton.parentNode.insertBefore(
          forwardControlBarButton,
          rewindControlBarButton.nextElementSibling
        );

        // add onclick handlers
        [forwardDisplayButton, forwardControlBarButton].forEach((button) => {
          button.onclick = () => {
            playerInstance.seek(playerInstance.getPosition() + 10);
          };
        });
      }
    }
  }
});
