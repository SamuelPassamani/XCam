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
    // Cria o placeholder <ins>
    const ins = document.createElement('ins');
    ins.className = 'eas6a97888e2';
    ins.setAttribute('data-zoneid', chosenZoneId);
    slot.appendChild(ins);
    // Cria o script de ativação
    const script = document.createElement('script');
    script.innerHTML = '(AdProvider = window.AdProvider || []).push({"serve": {}});';
    slot.appendChild(script);
  });
}

window.addEventListener('DOMContentLoaded', processAdSlots);
window.addEventListener('resize', () => {
  // Reprocessa os slots ao redimensionar
  processAdSlots();
});