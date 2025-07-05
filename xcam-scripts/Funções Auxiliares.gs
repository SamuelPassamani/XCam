/**
 * Renomeia vídeos da pasta para o padrão XCam REC e envia link de compartilhamento para a API Hydrax.
 * Exibe logs detalhados no console do Google Scripts com emojis em cada etapa.
 */
function renomearEVincularVideosXCam() {
  const PASTA_ID = '1ZcljpJcXsFqc_ECJM5TV9dvhWOQgwzHT';
  Logger.log('📂 Iniciando leitura da pasta de vídeos...');
  const pasta = DriveApp.getFolderById(PASTA_ID);
  const arquivos = pasta.getFiles();
  let total = 0, renomeados = 0, enviados = 0, erros = 0;

  while (arquivos.hasNext()) {
    const arquivo = arquivos.next();
    const nomeAntigo = arquivo.getName();
    Logger.log(`🔎 Analisando arquivo: ${nomeAntigo}`);

    // Regex para identificar o padrão antigo: username_YYYYMMDD_HHMMSS_temp.mp4
    const regex = /^(.+?)_(\d{8})_(\d{6})_temp\.mp4$/;
    const match = nomeAntigo.match(regex);
    if (!match) {
      Logger.log(`⏭️ Ignorado: ${nomeAntigo} (fora do padrão esperado)`);
      continue;
    }

    const username = match[1];
    const dataRaw = match[2]; // YYYYMMDD
    const horaRaw = match[3]; // HHMMSS

    // Converte datas para o padrão XCam
    const data_str = `${dataRaw.substr(6,2)}-${dataRaw.substr(4,2)}-${dataRaw.substr(0,4)}`; // DD-MM-YYYY
    const horario_str = `${horaRaw.substr(0,2)}-${horaRaw.substr(2,2)}`;
    // Calcula tempo_formatado (opcional: pode ser "??m??s" se não souber)
    let tempo_formatado = '';
    try {
      // Não há API nativa para duração, então use um valor padrão ou "".
      tempo_formatado = '??m??s';
      Logger.log(`⏱️ Duração do vídeo não disponível via Apps Script. Usando valor padrão: ${tempo_formatado}`);
    } catch (e) {
      tempo_formatado = '??m??s';
      Logger.log(`⚠️ Erro ao tentar obter duração: ${e}`);
    }

    const novoNome = `${username}_${data_str}_${horario_str}_${tempo_formatado}.mp4`;

    // Renomeia o arquivo
    try {
      arquivo.setName(novoNome);
      renomeados++;
      Logger.log(`✏️ Renomeado: ${nomeAntigo} ➡️ ${novoNome}`);
    } catch (e) {
      Logger.log(`❌ Erro ao renomear ${nomeAntigo}: ${e}`);
      erros++;
      continue;
    }

    // Garante compartilhamento (link anyone with the link)
    try {
      arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const fileId = arquivo.getId();
      const url = `https://api.hydrax.net/0128263f78f0b426d617bb61c2a8ff43/${fileId}`;
      Logger.log(`🌐 Obtendo link de compartilhamento e enviando para Hydrax: ${url}`);
      const resp = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
      enviados++;
      Logger.log(`✅ Enviado para Hydrax | Status: ${resp.getResponseCode()}`);
    } catch (e) {
      Logger.log(`🚫 Erro ao compartilhar/enviar ${novoNome}: ${e}`);
      erros++;
    }

    total++;
  }

  Logger.log(`🏁 Processo concluído.\n📊 Total analisados: ${total}\n✏️ Renomeados: ${renomeados}\n✅ Enviados: ${enviados}\n❌ Erros: ${erros}`);
}