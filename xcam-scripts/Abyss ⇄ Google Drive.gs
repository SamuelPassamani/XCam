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

  // 2. Lê todos os vídeos do arquivo records.json (mais rápido que consultar a API)
  logStage('🌐 2/4: Lendo vídeos de records.json...');
  auditLog({
    etapa: 'API',
    status: 'START',
    mensagem: 'Lendo vídeos de records.json'
  });
  const FILE_ID = '1Qr_hs5uIFn5YkVCge65juKsyJxLOcBq_';
  let allVideos = [];
  try {
    const file = DriveApp.getFileById(FILE_ID);
    const content = file.getBlob().getDataAsString();
    allVideos = JSON.parse(content);
    logInfo(`📦 Encontrados ${allVideos.length} vídeos em records.json.`);
  } catch (e) {
    logError('❌ Erro ao ler records.json: ' + e);
    throw e;
  }
  auditLog({
    etapa: 'API',
    status: 'END',
    mensagem: `Leitura de records.json finalizada. Vídeos: ${allVideos.length}`
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
 * Remove duplicatas de rec.json.
 * Usa poster padrão se não encontrar o .jpg.
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
 * Remove duplicatas, mantém apenas um arquivo.
 * Cria o arquivo caso não exista.
 */
function getOrCreateRecJsonFile(userFolder, username, onCreate) {
  const files = userFolder.getFilesByName('rec.json');
  let recJsonFile = null;
  let count = 0;
  while (files.hasNext()) {
    const file = files.next();
    count++;
    if (!recJsonFile) {
      recJsonFile = file;
    } else {
      // Remove duplicata
      file.setTrashed(true);
      logWarn(`🗑️ rec.json duplicado removido na pasta "${username}"`);
    }
  }
  if (recJsonFile) {
    logInfo('📄 rec.json já existe (apenas 1 mantido).');
    return recJsonFile;
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
 * Cria a entrada padronizada de vídeo para o rec.json do usuário XCam.
 * Se não encontrar o poster, usa a URL padrão do usuário.
 */
function buildVideoEntry(username, video, posterId) {
  const slug = video.slug || video.video || '';
  const data = video.data_str || video.data || '';
  const horario = video.horario_str || video.horario || '';
  const tempo = video.tempo_formatado || video.tempo || '';
  const title = `${username}_${data}_${horario}_${tempo}`;
  const file = `${title}.mp4`;
  let posterUrl, urlIframe;
  if (posterId) {
    posterUrl = `https://db.xcam.gay/user/${username}/${slug}.jpg`;
    urlIframe = `https://short.icu/${slug}?thumbnail=${posterUrl}`;
  } else {
    posterUrl = `https://poster.xcam.gay/${username}.jpg`;
    urlIframe = `https://short.icu/${slug}?thumbnail=${posterUrl}`;
  }
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

/**
 * Percorre todas as páginas da HYDRAX_API_URL_BASE, obtém todos os "items"
 * e salva o array completo no arquivo "records.json" (ID: 1Qr_hs5uIFn5YkVCge65juKsyJxLOcBq_).
 * Respeita o tempo máximo de execução (MAX_EXECUTION_TIME_MS) e exibe logs detalhados com emojis.
 */
function fetchAndSaveAllHydraxRecords() {
  const FILE_ID = '1Qr_hs5uIFn5YkVCge65juKsyJxLOcBq_';
  let allItems = [];
  let page = 1;
  let hasNext = true;
  const startTime = Date.now();

  Logger.log('🚀 Iniciando coleta de todos os registros da API Hydrax...');

  while (hasNext) {
    // Respeita o tempo máximo de execução
    if (Date.now() - startTime > MAX_EXECUTION_TIME_MS - 5000) {
      Logger.log('⏰ Tempo limite de execução atingido. Encerrando coleta.');
      break;
    }

    const url = `${HYDRAX_API_URL_BASE}?page=${page}`;
    Logger.log(`🌍 Buscando página ${page}: ${url}`);
    try {
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
      const json = JSON.parse(response.getContentText());
      if (Array.isArray(json.items)) {
        allItems = allItems.concat(json.items);
        Logger.log(`📦 Página ${page}: ${json.items.length} itens coletados (total acumulado: ${allItems.length}).`);
      } else {
        Logger.log(`⚠️ Página ${page}: "items" não é um array. Encerrando.`);
        break;
      }

      // Controle de paginação
      const currentPage = parseInt(json.pagination && json.pagination.current, 10);
      let nextPage = parseInt(json.pagination && json.pagination.next, 10);

      if (!nextPage || nextPage === currentPage) {
        Logger.log(`🏁 Paginação encerrada na página ${currentPage}.`);
        hasNext = false;
      } else {
        page = nextPage;
      }
    } catch (e) {
      Logger.log(`❌ Erro ao buscar página ${page}: ${e}`);
      break;
    }
  }

  // Salva todos os itens no arquivo records.json
  try {
    const file = DriveApp.getFileById(FILE_ID);
    file.setContent(JSON.stringify(allItems, null, 2));
    Logger.log(`💾 Todos os itens salvos em records.json. Total: ${allItems.length}`);
  } catch (e) {
    Logger.log(`❌ Erro ao salvar arquivo records.json: ${e}`);
  }
}

/**
 * Varre todos os "slug" em records.json (ID: 1Qr_hs5uIFn5YkVCge65juKsyJxLOcBq_)
 * e restaura da lixeira qualquer arquivo "{slug}.jpg" encontrado, movendo-o para a pasta de origem.
 * Respeita MAX_EXECUTION_TIME_MS e exibe logs detalhados com emojis.
 */
function restaurarPostersDaLixeiraPorSlug() {
  const FILE_ID = '1Qr_hs5uIFn5YkVCge65juKsyJxLOcBq_';
  const startTime = Date.now();
  let slugs = [];
  let restaurados = 0;
  let verificados = 0;

  Logger.log('🔎 Lendo slugs de records.json...');
  try {
    const file = DriveApp.getFileById(FILE_ID);
    const content = file.getBlob().getDataAsString();
    const records = JSON.parse(content);
    slugs = records.map(r => r.slug).filter(Boolean);
    Logger.log(`📋 Total de slugs encontrados: ${slugs.length}`);
  } catch (e) {
    Logger.log(`❌ Erro ao ler records.json: ${e}`);
    return;
  }

  if (slugs.length === 0) {
    Logger.log('⚠️ Nenhum slug encontrado em records.json.');
    return;
  }

  Logger.log('🗑️ Iniciando varredura na lixeira do Google Drive...');
  const trashFiles = DriveApp.getTrashedFiles();

  while (trashFiles.hasNext()) {
    if (Date.now() - startTime > MAX_EXECUTION_TIME_MS - 5000) {
      Logger.log('⏰ Tempo limite de execução atingido. Encerrando varredura.');
      break;
    }
    const file = trashFiles.next();
    const name = file.getName();
    verificados++;
    if (name.endsWith('.jpg')) {
      const slug = name.replace(/\.jpg$/, '');
      if (slugs.includes(slug)) {
        try {
          file.setTrashed(false);
          Logger.log(`♻️ Arquivo restaurado: ${name}`);

          // Tenta restaurar para a pasta de origem (se possível)
          const parents = file.getParents();
          if (!parents.hasNext()) {
            Logger.log(`⚠️ Não foi possível determinar a pasta de origem para ${name}. O arquivo foi restaurado, mas está na raiz do Drive.`);
          } else {
            while (parents.hasNext()) {
              const parent = parents.next();
              Logger.log(`📂 Arquivo ${name} restaurado para a pasta: ${parent.getName()} (${parent.getId()})`);
            }
          }
          restaurados++;
        } catch (e) {
          Logger.log(`❌ Erro ao restaurar ${name}: ${e}`);
        }
      }
    }
  }

  Logger.log(`✅ Processo concluído. Arquivos verificados: ${verificados}, arquivos restaurados: ${restaurados}`);
}

/**
 * Faz parse do nome do arquivo de vídeo para extrair username, data, horário e tempo.
 * Aceita username com underlines, inclusive terminando com "_".
 * Exemplo válido: "Tio0Legal__06-06-2025_08-55_17m.mp4"
 */
function parseVideoName(filename) {
  const pattern = /^(.+)_((\d{2}-\d{2}-\d{4}))_(\d{2}-\d{2})_([0-9hm]+s?|[0-9hm]+)\.mp4$/i;
  const match = filename.match(pattern);
  if (!match) return null;
  return {
    username: match[1],
    data_str: match[2],
    horario_str: match[4],
    tempo_formatado: match[5]
  };
}

/**
 * Lê e faz o parse do conteúdo JSON de um arquivo do Drive.
 * Retorna null em caso de erro.
 */
function readJsonFile(file) {
  try {
    return JSON.parse(file.getBlob().getDataAsString());
  } catch (e) {
    logWarn('⚠️ Erro ao ler/parsing JSON: ' + e);
    return null;
  }
}

/**
 * Salva um objeto como JSON em um arquivo do Drive.
 */
function writeJsonFile(file, obj) {
  file.setContent(JSON.stringify(obj, null, 2));
}

function resetSyncHydraxToDriveLote() {
  Logger.log('Iniciando o reset do syncHydraxToDriveLote.');

  // Limpa os checkpoints principais usados pelo lote
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('xcam_lote_ultimo_usuario');
  props.deleteProperty('xcam_lote_ultima_pagina_abyss');

  Logger.log('Checkpoints resetados com sucesso.');

  // Executar a função syncHydraxToDriveLote com tratamento especial para timeout
  Logger.log('Executando syncHydraxToDriveLote.');
  try {
    syncHydraxToDriveLote();
  } catch (e) {
    if (
      typeof e.message === 'string' &&
      e.message.indexOf('Tempo máximo de execução atingido. Lote interrompido e continuará automaticamente.') !== -1
    ) {
      Logger.log('ℹ️ [INFO] Execução interrompida por timeout controlado. O lote continuará automaticamente.');
    } else {
      Logger.log('🛑 [ERRO] Erro inesperado: ' + e);
      throw e; // Propaga outros erros
    }
  }

  Logger.log('Execução do syncHydraxToDriveLote finalizada.');
}

/**
 * Restaura arquivos da lixeira do Google Drive que foram excluídos nas últimas 2 horas.
 */
function restaurarArquivosRecentesDaLixeira() {
  const duasHorasEmMs = 2 * 60 * 60 * 1000; // 2 horas em milissegundos
  const agora = new Date().getTime(); // Timestamp atual em milissegundos

  Logger.log('Iniciando busca por arquivos excluídos recentemente na lixeira...');

  try {
    // Obtém todos os arquivos na lixeira
    // Nota: DriveApp.getTrash() só retorna arquivos do usuário logado.
    // Para lixeiras compartilhadas, pode ser necessário usar a Advanced Drive Service.
    const arquivosNaLixeira = DriveApp.getTrash();
    let arquivosRestaurados = 0;

    while (arquivosNaLixeira.hasNext()) {
      const arquivo = arquivosNaLixeira.next();

      try {
        // Obtém a data da última atualização do arquivo.
        // Nota: DriveApp não expõe diretamente a "data de exclusão".
        // A data de última atualização (getLastUpdated) é a melhor aproximação disponível
        // via DriveApp para inferir a data de exclusão na lixeira.
        const dataUltimaAtualizacao = arquivo.getLastUpdated().getTime();

        // Calcula a diferença de tempo desde a última atualização
        const diferencaTempo = agora - dataUltimaAtualizacao;

        // Verifica se a última atualização foi nas últimas 2 horas
        if (diferencaTempo <= duasHorasEmMs) {
          Logger.log(`Restaurando arquivo: ${arquivo.getName()} (ID: ${arquivo.getId()})`);
          arquivo.restore(); // Restaura o arquivo
          arquivosRestaurados++;
        } else {
          // Logger.log(`Arquivo muito antigo na lixeira para restaurar: ${arquivo.getName()} (Última Atualização: ${new Date(dataUltimaAtualizacao)})`);
        }
      } catch (e) {
        Logger.log(`Erro ao processar arquivo na lixeira (possivelmente sem permissão ou metadados inválidos): ${e}`);
      }
    }

    Logger.log(`Busca concluída. Total de arquivos restaurados: ${arquivosRestaurados}`);

  } catch (e) {
    Logger.log(`Erro geral ao acessar a lixeira do Drive: ${e}`);
  }
}