/**
 * ================================================================================
 * Integração XCam: Abyss ⇄ Google Drive (Execução em Lotes Resumível)
 * ================================================================================
 * by @SamuelPassamani | XCam
 * 
 * 🛠️ Estratégia Avançada:
 * - Consulta API Abyss paginada com checkpoint de página
 * - Extrai, organiza e sincroniza vídeos por usuário no Google Drive
 * - Corrige e atualiza arquivos rec.json para o padrão XCam (poster/urlIframe)
 * - Execução em lotes com checkpoint automático (usuário e página) e retomada após timeout do Apps Script
 * - Log detalhado, com auditoria no Google Sheets, emojis e contexto, em todas as etapas e erros
 * 
 * 🧩 Clean Architecture | Modular Design | CI/CD Ready
 *
 * Requisitos:
 * - Permissões de DriveApp, UrlFetchApp, SpreadsheetApp e ScriptApp (para triggers)
 * - Definir seu ROOT_FOLDER_ID (ID da pasta raiz dos usuários no Drive)
 * 
 * Referências:
 * - Google Apps Script: https://developers.google.com/apps-script/
 * - Docs Abyss: https://abyss.to/dashboard/document/
 * - XCam Docs: (interna)
 * ================================================================================
 */

/* ===================== CONFIGURAÇÕES GERAIS ===================== */

// URL base da API ABYSS
const HYDRAX_API_URL_BASE = 'https://api.hydrax.net/0128263f78f0b426d617bb61c2a8ff43/list';

// ID da pasta raiz dos usuários no Google Drive (defina o seu)
// const ROOT_FOLDER_ID = '1R8q38lLoeS1PjASq7GhbtnJG_oo2NcoB';

// Tempo máximo de execução (4 minutos e 30 segundos = 258000 ms)
const MAX_EXECUTION_TIME_MS = 258000;

// Nome da propriedade usada como checkpoint de progresso (usuário)
const CHECKPOINT_PROP = 'xcam_lote_ultimo_usuario';
// Nome da propriedade usada como checkpoint de página da API
const CHECKPOINT_PAGE_PROP = 'xcam_lote_ultima_pagina_abyss';

// ID da planilha de auditoria para logs externos
// const SHEET_ID = '1e13r5_cMXXeuKNFVgfgV-seSCIFz5wdoueaWkQifOzE';
const SHEET_EXEC_LOG = 'LogExecucaoAbyssDrive'; // Nome da aba de logs

/* ===================== AUDITORIA EM GOOGLE SHEETS ===================== */
/**
 * Retorna a aba de log de execução, criando-a se não existir.
 * Utilizado para rastreabilidade e monitoramento detalhado.
 */
function getOrCreateExecLogSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_EXEC_LOG);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_EXEC_LOG);
    sheet.appendRow([
      '⏰ Timestamp', '🔹 Etapa', '🟢 Status', '👤 Usuário', '📄 Arquivo',
      'ℹ️ Mensagem', '🔢 Página', '🧩 Extra', '🖥️ Script', '🔖 Checkpoint'
    ]);
  }
  return sheet;
}

/**
 * Registra um evento/auditoria na planilha de execução (Google Sheets).
 * Permite acompanhamento em tempo real e pós-execução.
 * @param {Object} params - Parâmetros do log.
 *   etapa, status, usuario, arquivo, mensagem, pagina, extra, script, checkpoint
 */
function auditLog({
  etapa = '', status = '', usuario = '', arquivo = '', mensagem = '',
  pagina = '', extra = '', script = 'Abyss ⇄ Google Drive.gs', checkpoint = ''
}) {
  try {
    const sheet = getOrCreateExecLogSheet();
    sheet.appendRow([
      new Date().toISOString(),
      etapa || '',
      status || '',
      usuario || '',
      arquivo || '',
      mensagem || '',
      pagina || '',
      extra || '',
      script || '',
      checkpoint || ''
    ]);
  } catch (e) {
    Logger.log(`🛑 [ERRO] Falha ao registrar log em planilha: ${e}`);
  }
}

/* ===================== CONTROLE DE TRIGGERS ===================== */
/**
 * Garante que exista apenas um trigger agendado para a função especificada.
 * Remove todos os triggers existentes para evitar excesso e erros do Apps Script.
 * @param {string} functionName - Nome da função handler do trigger (ex: 'syncHydraxToDriveLote')
 * @returns {number} Quantos triggers antigos foram removidos.
 */
function ensureSingleTrigger(functionName) {
  const triggers = ScriptApp.getProjectTriggers();
  let count = 0;
  for (let trig of triggers) {
    if (trig.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(trig);
      count++;
    }
  }
  return count;
}

/* ===================== CONTROLE DE TEMPO E CHECKPOINT ROBUSTO ===================== */
/**
 * Checa se ultrapassou o tempo máximo do Apps Script para o lote.
 * Se sim, salva o checkpoint, remove triggers antigos, agenda novo trigger
 * e encerra a execução de modo seguro e rastreável.
 * 
 * @param {number} startTime - timestamp inicial do lote
 * @param {string} checkpoint - identificador para checkpoint (usuário, pasta, arquivo)
 * @param {string|number} pagina - página da API, se aplicável
 */
function checkTimeoutLote(startTime, checkpoint = null, pagina = '') {
  const elapsed = Date.now() - startTime;
  if (elapsed > MAX_EXECUTION_TIME_MS - 8000) {
    logWarn(`⏰ Tempo máximo de execução (${Math.round(MAX_EXECUTION_TIME_MS/1000)}s) atingido em "${checkpoint}" página "${pagina}".`);
    logInfo('🚦 Limpando triggers antigos e agendando próximo lote automático...');
    auditLog({
      etapa: 'Timeout',
      status: 'MAX_TIME',
      usuario: '',
      arquivo: '',
      mensagem: `Timeout atingido em "${checkpoint}" página "${pagina}"`,
      pagina,
      script: 'Abyss ⇄ Google Drive.gs',
      checkpoint
    });
    let deleted = 0;
    try {
      deleted = ensureSingleTrigger('syncHydraxToDriveLote');
      logInfo(`🔄 Triggers antigos removidos: ${deleted}`);
      ScriptApp.newTrigger('syncHydraxToDriveLote')
        .timeBased().after(15000)
        .create();
      logInfo('🔖 [Checkpoint] Último progresso salvo: "' + (checkpoint || 'início') + '"');
      auditLog({
        etapa: 'Checkpoint',
        status: 'OK',
        usuario: '',
        arquivo: '',
        mensagem: `Checkpoint salvo: ${checkpoint}`,
        pagina,
        script: 'Abyss ⇄ Google Drive.gs',
        checkpoint
      });
    } catch (e) {
      logError('❌ Falha ao agendar novo trigger: ' + e);
      auditLog({
        etapa: 'Erro',
        status: 'ERRO',
        usuario: '',
        arquivo: '',
        mensagem: 'Falha ao agendar trigger',
        pagina,
        extra: JSON.stringify(e),
        script: 'Abyss ⇄ Google Drive.gs',
        checkpoint
      });
    }
    // Garante checkpoint salvo ANTES de lançar erro
    const props = PropertiesService.getScriptProperties();
    props.setProperty(CHECKPOINT_PROP, checkpoint || '');
    if (pagina) props.setProperty(CHECKPOINT_PAGE_PROP, String(pagina));
    throw new Error('Tempo máximo de execução atingido. Lote interrompido e continuará automaticamente.');
  }
}

/* ===================== FUNÇÃO PRINCIPAL (EXECUÇÃO EM LOTES) ===================== */
/**
 * Função principal para sincronização Abyss ⇄ Google Drive.
 * Modularizada, robusta, com checkpoints e logs detalhados.
 */
function syncHydraxToDriveLote() {
  const startTime = Date.now();
  logStage('🚦 [Lote] Iniciando sincronização Abyss ⇄ Google Drive (execução em lotes, resumível)...');
  auditLog({
    etapa: 'Execução',
    status: 'START',
    mensagem: 'Início da execução',
    script: 'Abyss ⇄ Google Drive.gs'
  });

  const props = PropertiesService.getScriptProperties();
  const ultimoUsuario = props.getProperty(CHECKPOINT_PROP) || null;
  let foundCheckpoint = !ultimoUsuario;

  let stats = {
    recJson: { encontrados: 0, criados: 0, atualizados: 0, ajustados: 0 },
    posters: { encontrados: 0, faltando: 0 }
  };

  // 1. Corrige arquivos rec.json existentes para o novo padrão (apenas no primeiro lote)
  if (!ultimoUsuario) {
    logStage('🛠️ 1/4: Corrigindo arquivos rec.json existentes para o novo padrão...');
    auditLog({
      etapa: 'Correcao',
      status: 'START',
      mensagem: 'Iniciando correção rec.json'
    });
    updateAllRecJsonToStandard(stats, startTime);
    auditLog({
      etapa: 'Correcao',
      status: 'END',
      mensagem: 'Correção rec.json finalizada'
    });
  } else {
    logInfo('⏩ Pulando etapa de correção de rec.json (já processada em lote anterior)...');
  }

  // 2. Consulta todos os vídeos da API Abyss (paginado, com checkpoint de página)
  logStage('🌐 2/4: Consultando API Abyss (todas as páginas)...');
  auditLog({
    etapa: 'API',
    status: 'START',
    mensagem: 'Iniciando consulta à API Abyss'
  });
  const allVideos = fetchAllHydraxVideos(startTime);
  auditLog({
    etapa: 'API',
    status: 'END',
    mensagem: `Consulta à API Abyss finalizada. Vídeos: ${allVideos.length}`
  });

  // 3. Agrupa vídeos por usuário (extração e parse)
  logStage('👤 3/4: Agrupando vídeos por usuário...');
  auditLog({
    etapa: 'Agrupamento',
    status: 'START',
    mensagem: 'Iniciando agrupamento de vídeos'
  });
  const videosByUser = groupVideosByUsername(allVideos);
  const usernames = Object.keys(videosByUser);
  auditLog({
    etapa: 'Agrupamento',
    status: 'END',
    mensagem: `Agrupamento finalizado. Usuários: ${usernames.length}`
  });

  // 4. Sincronização por usuário, em lote
  logStage('📁 4/4: Sincronizando dados para cada usuário (em lotes)...');
  let userCount = 0;
  let processadosNoLote = 0;
  let processing = false;

  for (const username of usernames) {
    userCount++;
    // Pula os já processados (checkpoint)
    if (!foundCheckpoint) {
      if (username === ultimoUsuario) {
        foundCheckpoint = true;
        logInfo(`⏩ [Checkpoint] Retomando a partir do usuário: "${username}"`);
      }
      continue;
    }
    processing = true;
    checkTimeoutLote(startTime, username); // Checa limite Apps Script e agenda novo lote se necessário
    logInfo(`\n🔄 Usuário ${userCount}: "${username}" | Total vídeos: ${videosByUser[username].length}`);
    try {
      auditLog({
        etapa: 'Usuario',
        status: 'START',
        usuario: username,
        mensagem: `Início processamento do usuário ${username}`
      });
      syncUserVideos(username, videosByUser[username], stats, startTime);
      processadosNoLote++;
      props.setProperty(CHECKPOINT_PROP, username); // Salva checkpoint após cada usuário
      auditLog({
        etapa: 'Usuario',
        status: 'END',
        usuario: username,
        mensagem: `Usuário ${username} processado`
      });
    } catch (e) {
      logError(`❌ Falha ao sincronizar usuário "${username}": ${e}`);
      props.setProperty(CHECKPOINT_PROP, username); // Garante checkpoint mesmo em erro
      auditLog({
        etapa: 'Erro',
        status: 'ERRO',
        usuario: username,
        mensagem: `Erro ao sincronizar usuário "${username}"`,
        extra: JSON.stringify(e)
      });
      throw e;
    }
  }

  // 5. Finalização: se todos processados, limpa o checkpoint
  if (processing) {
    props.deleteProperty(CHECKPOINT_PROP);
    logStage('🏁 [Lote] Todos usuários processados neste lote!');
    logInfo(`- Usuários processados neste lote: ${processadosNoLote}`);
    logInfo(`- rec.json encontrados: ${stats.recJson.encontrados}`);
    logInfo(`- rec.json criados: ${stats.recJson.criados}`);
    logInfo(`- rec.json atualizados: ${stats.recJson.atualizados}`);
    logInfo(`- rec.json ajustados para o padrão: ${stats.recJson.ajustados}`);
    logInfo(`- Posters (.jpg) encontrados e inseridos: ${stats.posters.encontrados}`);
    logInfo(`- Posters (.jpg) faltando (precisam ser criados/upload): ${stats.posters.faltando}`);
    logSuccess(`✅ Sincronização TOTAL concluída para ${userCount} usuários em ${(Date.now() - startTime) / 1000}s!`);
    auditLog({
      etapa: 'Execução',
      status: 'END',
      mensagem: `Lote concluído para ${userCount} usuários`
    });
  } else {
    logWarn('⚠️ Nenhum usuário foi processado neste lote (todos já estavam processados ou erro).');
    auditLog({
      etapa: 'Execução',
      status: 'END',
      mensagem: 'Nenhum usuário processado neste lote'
    });
  }
}

/* ===================== 1. CORREÇÃO DOS ARQUIVOS EXISTENTES rec.json ===================== */
/**
 * Corrige todos os arquivos rec.json do ROOT_FOLDER_ID para o novo padrão.
 * Atualiza poster/urlIframe e estatísticas.
 * Executa em múltiplos lotes (por checkpoint, tolerante a timeout).
 */
function updateAllRecJsonToStandard(stats, startTime) {
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const userFolders = root.getFolders();
  let total = 0, ajustados = 0, atualizados = 0;
  while (userFolders.hasNext()) {
    const userFolder = userFolders.next();
    checkTimeoutLote(startTime, `[correcao][${userFolder.getName()}]`);
    const files = userFolder.getFilesByName('rec.json');
    if (!files.hasNext()) continue;
    stats.recJson.encontrados++;
    total++;
    const recJsonFile = files.next();
    const rec = readJsonFile(recJsonFile);
    if (!rec || !Array.isArray(rec.videos)) continue;
    const username = rec.username || userFolder.getName();
    let alterado = false, postersEncontrados = 0, postersFaltando = 0;
    rec.videos = rec.videos.map(v => {
      checkTimeoutLote(startTime, `[correcao][${userFolder.getName()}][${v.video||v.slug||v.title}]`);
      const posterId = findPosterFileId(userFolder, v.video);
      if (posterId) postersEncontrados++;
      else postersFaltando++;
      const novo = buildVideoEntry(username, {
        slug: v.video,
        name: v.file,
        data: v.data,
        horario: v.horario,
        tempo: v.tempo
      }, posterId);
      if (JSON.stringify({ ...v, poster: undefined, urlIframe: undefined }) !== JSON.stringify({ ...novo, poster: undefined, urlIframe: undefined }) ||
          v.poster !== novo.poster || v.urlIframe !== novo.urlIframe) {
        alterado = true;
      }
      return novo;
    });
    rec.records = rec.videos.length;
    if (alterado) {
      writeJsonFile(recJsonFile, rec);
      ajustados++;
      stats.recJson.ajustados++;
      logSuccess(`🔄 rec.json ajustado para novo padrão: "${username}"`);
      auditLog({
        etapa: 'Ajuste rec.json',
        status: 'OK',
        usuario: username,
        arquivo: recJsonFile.getName(),
        mensagem: 'Arquivo ajustado'
      });
    }
    atualizados++;
    stats.posters.encontrados += postersEncontrados;
    stats.posters.faltando += postersFaltando;
  }
  stats.recJson.atualizados += atualizados;
  logInfo(`🗂️ ${ajustados} arquivos rec.json ajustados de ${total} encontrados.`);
}

/* ===================== 2. CONSULTA À API ABYSS COM CHECKPOINT DE PÁGINA ===================== */
/**
 * Consulta todas as páginas da API Abyss, com controle robusto de paginação e checkpoint.
 * Lida com respostas inconsistentes da API e evita loops infinitos.
 * @param {number} startTime
 * @returns {Array<Object>} Todos os vídeos retornados pela API
 */
function fetchAllHydraxVideos(startTime) {
  const props = PropertiesService.getScriptProperties();
  let allItems = [];
  let checkpointPage = parseInt(props.getProperty(CHECKPOINT_PAGE_PROP), 10) || 1;
  let page = checkpointPage;
  let hasNext = true;
  let total = 0;

  while (hasNext) {
    checkTimeoutLote(startTime, `[api][p${page}]`, page);
    const url = `${HYDRAX_API_URL_BASE}?page=${page}`;
    logInfo(`🌍 Buscando vídeos da página ${page}: ${url}`);
    try {
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
      const json = JSON.parse(response.getContentText());
      if (Array.isArray(json.items)) {
        logInfo(`📦 Encontrados ${json.items.length} vídeos nesta página.`);
        auditLog({
          etapa: 'API',
          status: 'OK',
          pagina: page,
          mensagem: `Página ${page} processada. ${json.items.length} vídeos.`,
          extra: url
        });
        allItems = allItems.concat(json.items);
        total += json.items.length;
      } else {
        logWarn('⚠️ Resposta inesperada da API Abyss: "items" não é um array.');
        auditLog({
          etapa: 'API',
          status: 'WARN',
          pagina: page,
          mensagem: 'Resposta inesperada da API: "items" não é array.',
          extra: JSON.stringify(json)
        });
      }

      // --- REGRA CRÍTICA: Parar se next == current ou next inválido ---
      const currentPage = parseInt(json.pagination && json.pagination.current, 10);
      let nextPage = parseInt(json.pagination && json.pagination.next, 10);

      if (!nextPage || nextPage === currentPage) {
        logWarn(`⚠️ Paginador informou next igual ao current (${currentPage}). Encerrando paginação.`);
        auditLog({
          etapa: 'API',
          status: 'END',
          pagina: currentPage,
          mensagem: `Paginação encerrada: next (${nextPage}) == current (${currentPage})`,
          extra: JSON.stringify(json)
        });
        hasNext = false;
      } else {
        page = nextPage;
        props.setProperty(CHECKPOINT_PAGE_PROP, String(page));
      }
    } catch (e) {
      logError(`❌ Erro ao consultar página ${page} da API Abyss: ${e}`);
      auditLog({
        etapa: 'Erro',
        status: 'ERRO',
        pagina: page,
        mensagem: `Erro ao consultar página ${page}: ${e}`,
        extra: JSON.stringify(e)
      });
      hasNext = false;
    }
  }
  // Limpe o checkpoint de página ao finalizar
  props.deleteProperty(CHECKPOINT_PAGE_PROP);
  logSuccess(`📊 Total de vídeos obtidos da API: ${total}`);
  return allItems;
}

/* ===================== 3. AGRUPAMENTO POR USUÁRIO ===================== */
/**
 * Agrupa vídeos por username extraído do nome do arquivo.
 * Facilita a sincronização e atualização por usuário.
 * @param {Array<Object>} videos
 * @returns {Object} Map de username para array de vídeos
 */
function groupVideosByUsername(videos) {
  const users = {};
  let ignorados = 0;
  videos.forEach(item => {
    const parsed = parseVideoName(item.name);
    if (!parsed) {
      ignorados++;
      logWarn(`⚠️ Ignorando vídeo com nome fora do padrão: "${item.name}"`);
      auditLog({
        etapa: 'Ignorado',
        status: 'AVISO',
        arquivo: item.name,
        mensagem: 'Vídeo ignorado por nome inválido'
      });
      return;
    }
    const { username } = parsed;
    if (!users[username]) users[username] = [];
    users[username].push({ ...item, ...parsed });
  });
  logInfo(`👨‍👩‍👧‍👦 Total de usuários encontrados: ${Object.keys(users).length}`);
  if (ignorados > 0) logWarn(`⚠️ ${ignorados} vídeos ignorados por nome inválido.`);
  return users;
}

/* ===================== 4. SINCRONIZAÇÃO DE CADA USUÁRIO ===================== */
/**
 * Sincroniza vídeos de um usuário: cria/atualiza rec.json e contabiliza posters (.jpg) disponíveis/faltando.
 * Chama checkTimeoutLote para garantir processamento seguro em lotes.
 * @param {string} username
 * @param {Array<Object>} userVideos
 * @param {Object} stats - objeto de estatísticas globais (referência)
 * @param {number} startTime
 */
function syncUserVideos(username, userVideos, stats, startTime) {
  checkTimeoutLote(startTime, username);
  logInfo(`📁 Garantindo pasta de usuário: "${username}"...`);
  const userFolder = getOrCreateUserFolder(username);
  logInfo(`📄 Buscando ou criando arquivo rec.json para "${username}"...`);
  let createdRec = false;
  const recJsonFile = getOrCreateRecJsonFile(userFolder, username, () => { createdRec = true; });
  if (createdRec) stats.recJson.criados++;
  logInfo(`🔍 Lendo conteúdo atual de rec.json...`);
  let rec = readJsonFile(recJsonFile);
  if (!rec || typeof rec !== 'object') {
    logWarn('⚠️ rec.json inválido, criando novo arquivo.');
    rec = { username, records: 0, videos: [] };
  }
  const existingSlugs = new Set(rec.videos.map(v => v.video));
  let novos = 0, postersEncontrados = 0, postersFaltando = 0;
  userVideos.forEach(video => {
    checkTimeoutLote(startTime, username);
    if (!existingSlugs.has(video.slug)) {
      const posterId = findPosterFileId(userFolder, video.slug);
      if (posterId) postersEncontrados++;
      else postersFaltando++;
      const entry = buildVideoEntry(username, video, posterId);
      rec.videos.push(entry);
      rec.records++;
      novos++;
      logInfo(`🆕 Novo vídeo adicionado: "${entry.title}"`);
      auditLog({
        etapa: 'Novo vídeo',
        status: 'OK',
        usuario: username,
        arquivo: entry.file,
        mensagem: 'Novo vídeo adicionado'
      });
      existingSlugs.add(video.slug);
    }
  });
  rec.videos = rec.videos.map(v => {
    checkTimeoutLote(startTime, username);
    const posterId = findPosterFileId(userFolder, v.video);
    if (posterId && !v.poster) postersEncontrados++;
    if (!posterId && !v.poster) postersFaltando++;
    const novo = buildVideoEntry(username, {
      slug: v.video,
      name: v.file || `${username}_${v.data}_${v.horario}_${v.tempo}.mp4`,
      data_str: v.data,
      horario_str: v.horario,
      tempo_formatado: v.tempo
    }, posterId);
    if (v.poster !== novo.poster || v.urlIframe !== novo.urlIframe) {
      auditLog({
        etapa: 'Ajuste vídeo',
        status: 'OK',
        usuario: username,
        arquivo: novo.file,
        mensagem: 'Vídeo ajustado'
      });
    }
    return novo;
  });
  rec.records = rec.videos.length;
  stats.posters.encontrados += postersEncontrados;
  stats.posters.faltando += postersFaltando;
  writeJsonFile(recJsonFile, rec);
  stats.recJson.atualizados++;
  logSuccess(`✅ ${novos} novos vídeos adicionados. rec.json atualizado para "${username}" com ${rec.records} vídeos.`);
  logInfo(`🖼️ Posters (.jpg) encontrados: ${postersEncontrados} | Faltando: ${postersFaltando} para "${username}"`);
  auditLog({
    etapa: 'SyncUser',
    status: 'OK',
    usuario: username,
    arquivo: recJsonFile.getName(),
    mensagem: `rec.json atualizado (${novos} novos vídeos)`
  });
}

/* ===================== UTILITÁRIOS DE JSON, DRIVE E FORMATAÇÃO ===================== */
/**
 * Garante a existência da pasta do usuário no Drive.
 * Cria a pasta caso não exista.
 */
function getOrCreateUserFolder(username) {
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const folders = root.getFoldersByName(username);
  if (folders.hasNext()) {
    logInfo(`📂 Pasta já existe para "${username}".`);
    return folders.next();
  }
  logInfo(`📂 Pasta não encontrada, criando nova para "${username}".`);
  return root.createFolder(username);
}

/**
 * Garante a existência do arquivo rec.json na pasta do usuário.
 * Cria o arquivo caso não exista.
 */
function getOrCreateRecJsonFile(userFolder, username, onCreate) {
  const files = userFolder.getFilesByName('rec.json');
  if (files.hasNext()) {
    logInfo('📄 rec.json já existe.');
    return files.next();
  }
  logInfo('📄 rec.json não encontrado, criando novo arquivo.');
  if (onCreate) onCreate();
  const blob = Utilities.newBlob(
    JSON.stringify({ username, records: 0, videos: [] }, null, 2),
    'application/json',
    'rec.json'
  );
  return userFolder.createFile(blob);
}

/**
 * Lê e faz parse de um arquivo JSON do Drive.
 * Retorna null em caso de erro.
 */
function readJsonFile(file) {
  try {
    const content = file.getBlob().getDataAsString();
    return JSON.parse(content);
  } catch (e) {
    logError(`❌ Erro ao ler JSON do arquivo: ${e}`);
    auditLog({
      etapa: 'Erro',
      status: 'ERRO',
      arquivo: file.getName(),
      mensagem: 'Erro ao ler arquivo JSON',
      extra: JSON.stringify(e)
    });
    return null;
  }
}

/**
 * Sobrescreve o conteúdo de um arquivo JSON no Drive.
 */
function writeJsonFile(file, data) {
  try {
    file.setContent(JSON.stringify(data, null, 2));
    logInfo('💾 JSON salvo com sucesso!');
  } catch (e) {
    logError(`❌ Falha ao salvar JSON: ${e}`);
    auditLog({
      etapa: 'Erro',
      status: 'ERRO',
      arquivo: file.getName(),
      mensagem: 'Falha ao salvar JSON',
      extra: JSON.stringify(e)
    });
  }
}

/**
 * Busca o ID do arquivo de poster (.jpg) pelo slug na pasta do usuário.
 * Retorna "" se não encontrado.
 */
function findPosterFileId(userFolder, slug) {
  const files = userFolder.getFilesByName(`${slug}.jpg`);
  if (files.hasNext()) {
    return files.next().getId();
  }
  return "";
}

/**
 * Faz parse do nome do arquivo de vídeo para extrair username, data, horário e tempo.
 * Retorna null se o formato não for válido.
 */
function parseVideoName(filename) {
  const pattern = /^(.+?)_(\d{2}-\d{2}-\d{4})_(\d{2}-\d{2})_([0-9hm]+s)\.mp4$/i;
  const match = filename.match(pattern);
  if (!match) return null;
  return {
    username: match[1],
    data_str: match[2],
    horario_str: match[3],
    tempo_formatado: match[4]
  };
}

/**
 * Cria a entrada padronizada de vídeo para o rec.json do usuário XCam.
 * Garante:
 * - slug puro em "video"
 * - URLs formatadas corretamente (SEM encode excessivo)
 * - urlIframe com parâmetro thumbnail SEM encode dos caracteres ":" e "/"
 * - campos obrigatórios sempre preenchidos
 */
function buildVideoEntry(username, video, posterId) {
  const slug = video.slug || video.video || '';
  const data = video.data_str || video.data || '';
  const horario = video.horario_str || video.horario || '';
  const tempo = video.tempo_formatado || video.tempo || '';
  const title = `${username}_${data}_${horario}_${tempo}`;
  const file = `${title}.mp4`;
  const posterUrl = `https://db.xcam.gay/user/${username}/${slug}.jpg`;
  const urlIframe = `https://short.icu/${slug}?thumbnail=${posterUrl}`;
  return {
    video: slug,
    title: title,
    file: file,
    url: `https://short.icu/${slug}`,
    poster: posterUrl,
    urlIframe: urlIframe,
    data: data,
    horario: horario,
    tempo: tempo
  };
}

/* ===================== RELATÓRIOS E AUDITORIA ADICIONAL ===================== */
/**
 * Gera relatório de todos os slugs presentes em {username}/rec.json que NÃO possuem o arquivo de poster {username}/{slug}.jpg.
 * Suporta execução em lotes, checkpoints e MAX_EXECUTION_TIME_MS, como o processamento principal.
 * Relatório salvo na aba "Posters Ausentes" da planilha de auditoria.
 * Checkpoints:
 *   - xcam_poster_ultimo_usuario
 *   - xcam_poster_ultimo_slug
 */
function reportarPostersAusentesLote() {
  const props = PropertiesService.getScriptProperties();
  const abaNome = 'Posters Ausentes';
  const checkpointUsuario = props.getProperty('xcam_poster_ultimo_usuario');
  const checkpointSlug = props.getProperty('xcam_poster_ultimo_slug');
  const startTime = Date.now();

  // Setup planilha
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(abaNome);
  if (!sheet) {
    sheet = ss.insertSheet(abaNome);
    sheet.appendRow([
      '👤 Usuário', '🏷️ Slug', '🎬 Título', '📄 Arquivo MP4',
      '🖼️ Poster Esperado (.jpg)', '⏰ Data/Hora Verificação'
    ]);
  }

  // Avança para a primeira linha vazia
  let lastRow = sheet.getLastRow();
  if (lastRow < 1) lastRow = 1;

  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const userFolders = root.getFolders();

  let foundUserCheckpoint = !checkpointUsuario;
  let totalAusentes = 0, totalVerificados = 0;

  while (userFolders.hasNext()) {
    const userFolder = userFolders.next();
    const username = userFolder.getName();

    // Checkpoint de usuário
    if (!foundUserCheckpoint) {
      if (username === checkpointUsuario) {
        foundUserCheckpoint = true;
      } else {
        continue;
      }
    }

    checkTimeoutLote(startTime, `[poster][${username}]`);

    const files = userFolder.getFilesByName('rec.json');
    if (!files.hasNext()) continue;
    const recJsonFile = files.next();
    const rec = readJsonFile(recJsonFile);
    if (!rec || !Array.isArray(rec.videos)) continue;

    let foundSlugCheckpoint = !checkpointSlug;
    for (const video of rec.videos) {
      totalVerificados++;
      const slug = video.video || video.slug;
      // Checkpoint de slug
      if (!foundSlugCheckpoint) {
        if (slug === checkpointSlug) {
          foundSlugCheckpoint = true;
        } else {
          continue;
        }
      }

      checkTimeoutLote(startTime, `[poster][${username}]`, slug);

      const posterName = `${slug}.jpg`;
      const posterFiles = userFolder.getFilesByName(posterName);
      if (!posterFiles.hasNext()) {
        // Não existe poster: registrar
        sheet.appendRow([
          username,
          slug,
          video.title || '',
          video.file || '',
          posterName,
          new Date().toISOString()
        ]);
        totalAusentes++;
        auditLog({
          etapa: 'Poster Ausente',
          status: 'AUSENTE',
          usuario: username,
          arquivo: video.file || '',
          mensagem: `Poster ausente para slug: ${slug}`,
          extra: `poster: ${posterName} | título: ${video.title || ''}`
        });
      }

      // Salva checkpoint a cada slug
      props.setProperty('xcam_poster_ultimo_usuario', username);
      props.setProperty('xcam_poster_ultimo_slug', slug);
    }
    // Limpa checkpoint de slug após cada usuário
    props.deleteProperty('xcam_poster_ultimo_slug');
  }
  // Limpa todos os checkpoints se terminou tudo
  props.deleteProperty('xcam_poster_ultimo_usuario');
  props.deleteProperty('xcam_poster_ultimo_slug');

  auditLog({
    etapa: 'Relatório Posters',
    status: 'END',
    mensagem: `Relatório concluído. Verificados: ${totalVerificados}, Ausentes: ${totalAusentes}`,
    extra: `Aba: ${abaNome} | ${new Date().toISOString()}`
  });

  Logger.log(`🖼️ Relatório de posters ausentes concluído: ${totalAusentes} de ${totalVerificados} vídeos sem poster.`);
}

/* ===================== LOGS AVANÇADOS E PERSONALIZADOS ===================== */
function logInfo(msg) {
  Logger.log(`ℹ️  [INFO] ${msg}`);
}
function logWarn(msg) {
  Logger.log(`🟡 [AVISO] ${msg}`);
}
function logError(msg) {
  Logger.log(`🛑 [ERRO] ${msg}`);
}
function logSuccess(msg) {
  Logger.log(`🟢 [SUCESSO] ${msg}`);
}
function logStage(msg) {
  Logger.log(`\n========== ${msg} ==========\n`);
}

/* ===================== ACIONADOR MANUAL ===================== */
/**
 * Executa manualmente o lote de sincronização.
 * Ideal para testes e execuções sob demanda.
 */
function runSyncHydraxBatch() {
  syncHydraxToDriveLote();
}

/* ================================================================================
 * ===================== FIM DO SCRIPT - Abyss ⇄ Google Drive =====================
 * ================================================================================
 */

/* ===================== AGENDAMENTO (Opcional) ===================== */
/*
 * Para agendar execução automática, use o editor do Apps Script:
 * - Editar > Acionadores > Adicionar acionador para `syncHydraxToDrive`
 *   (exemplo: a cada hora, diariamente, etc)
 */

/* ===================== FIM DO SCRIPT ===================== */