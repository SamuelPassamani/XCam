// AdEngine para ExoClick - injeta anúncios dinamicamente nos slots
const ZONE_ID_MAP = {
  '5689670': { width: 160, height: 600 },
  '5689812': { width: 728, height: 90 },
  '5694038': { width: 300, height: 250 },
  '5694040': { width: 300, height: 500 },
  '5694044': { width: 900, height: 250 }
};

function processAdSlots() {
  document.querySelectorAll('.ad-slot').forEach(slot => {
    // Limpa o slot
    slot.innerHTML = '';
    const allowedZoneIds = (slot.dataset.zoneids || '').split(',').map(z => z.trim()).filter(Boolean);
    if (!allowedZoneIds.length) return;
    // Mede a largura disponível
    const parentWidth = slot.parentElement ? slot.parentElement.offsetWidth : slot.offsetWidth;
    // Ordena zoneids do maior para o menor
    const sortedZoneIds = allowedZoneIds.sort((a, b) => (ZONE_ID_MAP[b]?.width || 0) - (ZONE_ID_MAP[a]?.width || 0));
    let chosenZoneId = null;
    for (const zoneId of sortedZoneIds) {
      const size = ZONE_ID_MAP[zoneId];
      if (size && size.width <= parentWidth) {
        chosenZoneId = zoneId;
        break;
      }
    }
    // Se não couber nenhum, pega o menor
    if (!chosenZoneId) chosenZoneId = sortedZoneIds[sortedZoneIds.length - 1];
    const size = ZONE_ID_MAP[chosenZoneId];
    if (!size) return;
    // Cria o iframe
    const iframe = document.createElement('iframe');
    iframe.src = `//a.magsrv.com/iframe.php?idzone=${chosenZoneId}&size=${size.width}x${size.height}`;
    iframe.width = size.width;
    iframe.height = size.height;
    iframe.scrolling = 'no';
    iframe.marginWidth = '0';
    iframe.marginHeight = '0';
    iframe.frameBorder = '0';
    iframe.setAttribute('style', 'display:block; border:0;');
    slot.appendChild(iframe);
  });
}

window.addEventListener('DOMContentLoaded', processAdSlots);
window.addEventListener('resize', () => {
  // Reprocessa os slots ao redimensionar
  processAdSlots();
});