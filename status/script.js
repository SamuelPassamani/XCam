function updateYear() {
  document.getElementById("year").textContent = new Date().getFullYear();
}
async function checkService(url, dotId, name) {
  const dot = document.querySelector(`#${dotId} .dot`);
  const span = document.querySelector(`#${dotId} .card-viewers span`);
  if (span) span.textContent = "⏳ Verificando...";
  try {
    await fetch(url, {
      mode: "no-cors"
    });
    dot.className = "dot online";
    if (span) span.textContent = "🟢 Online";
    console.log(`[STATUS] ✅ ${name}: Online`);
  } catch (e) {
    dot.className = "dot offline";
    if (span) span.textContent = "🔴 Offline";
    console.warn(`[STATUS] ⚠️ ${name}: Offline`, e);
  }
}

function checkStatus() {
  console.clear();
  console.log("[INFO] Iniciando verificação de status...");
  checkService("https://xcam.gay/", "web-status", "Web App");
  checkService("https://beta.xcam.gay/", "beta-status", "Beta App");
  checkService("https://api.xcam.gay/", "api-status", "API");
  checkService("https://player.xcam.gay/", "player-status", "Player");
  checkService("https://drive.xcam.gay/", "drive-status", "Drive");
  checkService("https://status.xcam.gay/", "status-status", "Status");
}
updateYear();
checkStatus();
setInterval(checkStatus, 30000);
document.addEventListener("DOMContentLoaded", () => {
  const fadeElements = document.querySelectorAll(".fade-in");
  fadeElements.forEach((el) => el.classList.add("fade-in"));
  const slideElements = document.querySelectorAll(".slide-up");
  slideElements.forEach((el) => el.classList.add("slide-up"));
});