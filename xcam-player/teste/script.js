const playerInstance = jwplayer("player").setup({
  controls: true,
  sharing: true,
  autostart: false,
  displaytitle: true,
  displaydescription: true,
  abouttext: "Buy me a coffee ☕",
  aboutlink: "https://makingoff.eu.org/help-us/",

  skin: {
    name: "netflix"
  },

  logo: {
    file: "https://i.imgur.com/1inVaQD.png",
    link: "https://www.makingoff.eu.org"
  },

  captions: {
    color: "#efcc00",
    fontSize: 16,
    backgroundOpacity: 0,
    edgeStyle: "raised"
  },

  hlsjsConfig: { withCredentials: true },
  playlist: [
    {
      title: "Monkey King - 2023",
      description: "Filme",
      image:
        "https://yts.mx/assets/images/movies/sabina_tortured_for_christ_the_nazi_years_2021/large-screenshot3.jpg",
      sources: [
        {
          file: "https://api.xcam.gay/stream/likescock5",
          type: "video/webm",
          label: "720p"
        },
        {
          file:
            "https://d1112.filescdn.com/d/iby2gxas6dlfx5d4jnsapcpg2z7dhtyjpmwr2vptezntpml5rw2vt76lt6642hvpnqyivk3g/video.mp4",
          type: "video/webm",
          label: "1080p"
        },
        {
          file:
            "https://cloclo-stock4.datacloudmail.ru/stock/get/42zwwmJ48BtyKCH4NhFTCTC8jWf1LhMP4pFdG64Hhr4SNWJEwfoMDPVEecoZo23tF2PGkqRnbezw/hhi0IdYa%20%281%29.mp4?x-email=alls.company%40bk.ru",
          type: "video/webm",
          label: "Server 3"
        }
      ],
      captions: [
        {
          file: "https://drive.site.my.eu.org/0:/CDN/hhi0IdYa/hhi0IdYa-PT.vtt",
          label: "Português",
          kind: "captions"
        }
      ],
      tracks: [
        {
          file: "https://cdn.jwplayer.com/strips/hhi0IdYa-120.vtt",
          kind: "thumbnails"
        }
      ]
    }
  ]
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

  // Move the timeslider in-line with other controls
  const playerContainer = playerInstance.getContainer();
  const buttonContainer = playerContainer.querySelector(".jw-button-container");
  const spacer = buttonContainer.querySelector(".jw-spacer");
  const timeSlider = playerContainer.querySelector(".jw-slider-time");
  buttonContainer.replaceChild(timeSlider, spacer);

  // Forward 10 seconds
  const rewindContainer = playerContainer.querySelector(
    ".jw-display-icon-rewind"
  );
  const forwardContainer = rewindContainer.cloneNode(true);
  const forwardDisplayButton = forwardContainer.querySelector(
    ".jw-icon-rewind"
  );
  forwardDisplayButton.style.transform = "scaleX(-1)";
  forwardDisplayButton.ariaLabel = "Forward 10 Seconds";
  const nextContainer = playerContainer.querySelector(".jw-display-icon-next");
  nextContainer.parentNode.insertBefore(forwardContainer, nextContainer);

  // control bar icon
  playerContainer.querySelector(".jw-display-icon-next").style.display = "none"; // hide next button
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

  // add onclick handlers
  [forwardDisplayButton, forwardControlBarButton].forEach((button) => {
    button.onclick = () => {
      playerInstance.seek(playerInstance.getPosition() + 10);
    };
  });
});
