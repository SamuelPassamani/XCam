export function setupMenu() {
  const toggle = document.getElementById("mobile-toggle");
  const menu = document.getElementById("mobile-menu");

  toggle.addEventListener("click", () => {
    menu.classList.toggle("active");
    document.body.classList.toggle("modal-open");
  });
}