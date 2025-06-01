// Translation function
function t(key) {
  const translations = {
    viewers: "espectadores",
    male: "Masculino",
    female: "Feminino",
    trans: "Trans",
    gay: "Gay",
    lesbian: "Lésbica",
    bisexual: "Bissexual",
    straight: "Heterossexual",
    about: "Sobre",
    social_media: "Redes Sociais",
    group: "Grupo",
    spain: "Espanha"
    // Add more translations as needed
  };
  return translations[key] || key;
}
// Modal functionality
document.addEventListener("DOMContentLoaded", function () {
  const openModalBtn = document.getElementById("openModal");
  const closeModalBtn = document.getElementById("closeModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const modal = modalOverlay.querySelector(".modal");
  // Open modal
  openModalBtn.addEventListener("click", function () {
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  });
  // Close modal when clicking the close button
  closeModalBtn.addEventListener("click", function () {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = ""; // Re-enable scrolling
  });
  // Close modal when clicking outside the modal content
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("active");
      document.body.style.overflow = ""; // Re-enable scrolling
    }
  });
  // Prevent closing when clicking inside the modal
  modal.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
      modalOverlay.classList.remove("active");
      document.body.style.overflow = ""; // Re-enable scrolling
    }
  });
});
// Example function to open modal with specific user data
function openUserModal(userData) {
  // This function would be used to dynamically populate the modal with user data
  // For example:
  // document.querySelector('.modal-title').textContent = '@' + userData.username;
  // document.querySelector('.player-iframe').src = `https://player.xcam.gay/?user=${userData.username}`;
  // etc.
  // Then open the modal
  document.getElementById("modalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}
(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement("script");
      d.innerHTML =
        "window.__CF$cv$params={r:'94687675a6ecec3a',t:'MTc0ODM3OTg0Ni4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName("head")[0].appendChild(d);
    }
  }
  if (document.body) {
    var a = document.createElement("iframe");
    a.height = 1;
    a.width = 1;
    a.style.position = "absolute";
    a.style.top = 0;
    a.style.left = 0;
    a.style.border = "none";
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    if ("loading" !== document.readyState) c();
    else if (window.addEventListener)
      document.addEventListener("DOMContentLoaded", c);
    else {
      var e = document.onreadystatechange || function () {};
      document.onreadystatechange = function (b) {
        e(b);
        "loading" !== document.readyState &&
          ((document.onreadystatechange = e), c());
      };
    }
  }
})();
