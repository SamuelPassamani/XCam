export function setupReload() {
  const btn = document.getElementById("update-button");
  btn.addEventListener("click", () => location.reload());
}