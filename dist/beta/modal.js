export function setupModal() {
  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  document.querySelectorAll(".broadcast-card").forEach(card => {
    card.addEventListener("click", () => {
      modal.classList.add("active");
    });
  });

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.remove("active");
      modalContent.scrollTop = 0;
    }
  });

  document.querySelectorAll(".modal-close").forEach(btn => {
    btn.addEventListener("click", () => {
      modal.classList.remove("active");
      modalContent.scrollTop = 0;
    });
  });
}