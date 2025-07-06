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

/**
 * Unifica pastas duplicadas de usuários em ROOT_FOLDER_ID, consolidando rec.json e arquivos .jpg.
 * Mantém apenas uma pasta por usuário, com todos os arquivos unificados.
 * Exibe logs detalhados e informativos com emojis em todas as etapas.
 */
function unificarPastasDuplicadasUsuarios() {
  Logger.log('🔍 Iniciando verificação de pastas duplicadas em ROOT_FOLDER_ID...');
  const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const allFolders = rootFolder.getFolders();
  const userFoldersMap = {};

  // 1. Mapeia todas as pastas por nome
  Logger.log('📁 Mapeando todas as pastas de usuários...');
  while (allFolders.hasNext()) {
    const folder = allFolders.next();
    const name = folder.getName();
    if (!userFoldersMap[name]) userFoldersMap[name] = [];
    userFoldersMap[name].push(folder);
    Logger.log(`🔸 Pasta encontrada: ${name} (ID: ${folder.getId()})`);
  }

  // 2. Procura nomes duplicados
  let totalDuplicados = 0;
  for (const username in userFoldersMap) {
    const folders = userFoldersMap[username];
    if (folders.length < 2) continue; // Só processa duplicados

    totalDuplicados++;
    Logger.log(`⚠️ Encontrado duplicidade para usuário: ${username} (${folders.length} pastas)`);

    // 3. Coleta arquivos de cada pasta
    let recJsons = [];
    let jpgFiles = [];
    let allFiles = [];
    folders.forEach(folder => {
      Logger.log(`📂 Lendo arquivos da pasta: ${folder.getName()} (ID: ${folder.getId()})`);
      const files = folder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        allFiles.push({file, folder});
        if (file.getName() === 'rec.json') {
          recJsons.push({file, folder});
          Logger.log(`📝 rec.json encontrado em ${folder.getName()}`);
        } else if (file.getName().endsWith('.jpg')) {
          jpgFiles.push({file, folder});
          Logger.log(`🖼️ .jpg encontrado: ${file.getName()} em ${folder.getName()}`);
        } else {
          Logger.log(`📄 Outro arquivo encontrado: ${file.getName()} em ${folder.getName()}`);
        }
      }
    });

    // 4. Unifica rec.json se houver mais de um
    let recJsonUnificado = {};
    if (recJsons.length > 0) {
      Logger.log(`🔗 Unificando conteúdos dos rec.json (${recJsons.length})...`);
      recJsons.forEach(({file, folder}, idx) => {
        try {
          const content = JSON.parse(file.getBlob().getDataAsString());
          recJsonUnificado = Object.assign(recJsonUnificado, content);
          Logger.log(`✅ rec.json da pasta ${folder.getName()} unificado (${idx + 1}/${recJsons.length})`);
        } catch (e) {
          Logger.log(`❌ Erro ao ler rec.json em ${folder.getName()}: ${e}`);
        }
      });
    } else {
      Logger.log('⚠️ Nenhum rec.json encontrado para unificar.');
    }

    // 5. Escolhe a pasta que será mantida (a primeira)
    const pastaFinal = folders[0];
    Logger.log(`📦 Pasta escolhida para manter: ${pastaFinal.getName()} (ID: ${pastaFinal.getId()})`);

    // 6. Move todos os arquivos .jpg e rec.json para a pasta final (se não estiverem nela)
    jpgFiles.forEach(({file, folder}) => {
      if (folder.getId() !== pastaFinal.getId()) {
        pastaFinal.createFile(file.getBlob()).setName(file.getName());
        file.setTrashed(true);
        Logger.log(`➡️ .jpg movido para pasta final: ${file.getName()}`);
      }
    });

    // Remove todos os rec.json das pastas duplicadas (inclusive da final, para evitar duplicidade)
    recJsons.forEach(({file, folder}) => {
      file.setTrashed(true);
      Logger.log(`🗑️ rec.json removido de ${folder.getName()}`);
    });

    // Cria o rec.json unificado na pasta final
    if (Object.keys(recJsonUnificado).length > 0) {
      pastaFinal.createFile('rec.json', JSON.stringify(recJsonUnificado, null, 2), 'application/json');
      Logger.log(`🆕 rec.json unificado criado em: ${pastaFinal.getName()}`);
    }

    // 7. Move outros arquivos (exceto .jpg e rec.json) para a pasta final
    allFiles.forEach(({file, folder}) => {
      if (
        folder.getId() !== pastaFinal.getId() &&
        file.getName() !== 'rec.json' &&
        !file.getName().endsWith('.jpg')
      ) {
        pastaFinal.createFile(file.getBlob()).setName(file.getName());
        file.setTrashed(true);
        Logger.log(`📤 Arquivo movido para pasta final: ${file.getName()}`);
      }
    });

    // 8. Exclui permanentemente as pastas duplicadas (exceto a final)
    for (let i = 1; i < folders.length; i++) {
      try {
        folders[i].setTrashed(true);
        Logger.log(`🗑️ Pasta duplicada enviada para lixeira: ${folders[i].getName()} (ID: ${folders[i].getId()})`);
      } catch (e) {
        Logger.log(`❌ Erro ao excluir pasta duplicada: ${e}`);
      }
    }
    Logger.log(`🎉 Unificação concluída para usuário: ${username}\n-----------------------------`);
  }
  Logger.log(`🏁 Processo de unificação finalizado. Total de usuários com duplicidade: ${totalDuplicados}`);
}

/**
 * Audita e ajusta todos os arquivos rec.json em ROOT_FOLDER_ID/{username}/rec.json,
 * garantindo que estejam bem formatados como JSON válido e identado.
 * Se encontrar JSON inválido, tenta corrigir ou registra o erro.
 * Exibe logs detalhados com emojis em todas as etapas.
 */
function auditarEAjustarRecJsonUsuarios() {
  Logger.log('🔍 Iniciando auditoria dos arquivos rec.json em todas as pastas de usuários...');
  const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const allFolders = rootFolder.getFolders();
  let totalPastas = 0, totalRecJson = 0, totalCorrigidos = 0, totalErros = 0;

  while (allFolders.hasNext()) {
    const userFolder = allFolders.next();
    totalPastas++;
    const username = userFolder.getName();
    Logger.log(`👤 Verificando pasta do usuário: ${username} (ID: ${userFolder.getId()})`);

    const files = userFolder.getFilesByName('rec.json');
    if (!files.hasNext()) {
      Logger.log(`⚠️ rec.json não encontrado para ${username}`);
      continue;
    }

    while (files.hasNext()) {
      const file = files.next();
      totalRecJson++;
      Logger.log(`📝 Auditando rec.json em ${username} (ID: ${file.getId()})...`);

      let contentStr = '';
      let jsonObj = null;
      let precisaCorrigir = false;

      // Tenta ler e parsear o JSON
      try {
        contentStr = file.getBlob().getDataAsString();
        Logger.log(`📄 Conteúdo original de rec.json (${username}):\n${contentStr}`);
        jsonObj = JSON.parse(contentStr);
        // Reescreve para garantir identação e formato
        precisaCorrigir = (contentStr.trim() !== JSON.stringify(jsonObj, null, 2));
        if (!precisaCorrigir) {
          Logger.log(`✔️ rec.json já está bem formatado para ${username}`);
        } else {
          Logger.log(`✏️ rec.json de ${username} será reformatado para identação e padronização.`);
        }
      } catch (e) {
        Logger.log(`❌ JSON inválido em ${username}: ${e}. Tentando corrigir automaticamente...`);
        precisaCorrigir = true;
        // Tenta corrigir problemas comuns de aspas simples/dobras ou vírgulas finais
        try {
          let corrigido = contentStr
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/'/g, '"');
          Logger.log(`🔧 Tentando parsear conteúdo corrigido:\n${corrigido}`);
          jsonObj = JSON.parse(corrigido);
          Logger.log(`✅ Correção automática aplicada em ${username}`);
        } catch (e2) {
          Logger.log(`🚫 Não foi possível corrigir o rec.json de ${username}: ${e2}`);
          totalErros++;
          continue;
        }
      }

      // Se necessário, reescreve o arquivo com JSON identado e válido
      if (precisaCorrigir && jsonObj) {
        try {
          Logger.log(`💾 Regravando rec.json ajustado para ${username}...`);
          file.setTrashed(true);
          userFolder.createFile('rec.json', JSON.stringify(jsonObj, null, 2), 'application/json');
          Logger.log(`🆗 rec.json ajustado e regravado para ${username}`);
          totalCorrigidos++;
        } catch (e) {
          Logger.log(`❌ Erro ao regravar rec.json para ${username}: ${e}`);
          totalErros++;
        }
      }
    }
  }

  Logger.log(`🏁 Auditoria concluída.\n📦 Pastas verificadas: ${totalPastas}\n📝 rec.json encontrados: ${totalRecJson}\n🆗 Corrigidos: ${totalCorrigidos}\n❌ Erros: ${totalErros}`);
}