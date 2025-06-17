/**
 * ===========================================================================================
 * XCam | CLONE AUDITADO Google Drive → GitHub - Sincronização Inteligente & Auditoria Completa
 * ===========================================================================================
 * Autor: Samuel Passamani | XCam DevOps | Clean Architecture | ES6+ | Modular | Pronto para CI/CD
 * Data: 2025
 * 
 * Descrição:
 * - Sincroniza de forma incremental (com Delta e SHA real) todo o conteúdo do Google Drive (ROOT_FOLDER_ID)
 *   para um repositório GitHub (REPO_BASE_PATH), mantendo a hierarquia de pastas e arquivos.
 * - Remove do GitHub arquivos não existentes no Drive (espelhamento unilateral, GitHub = Drive).
 * - DRY-RUN: modo simulação que audita tudo sem alterar o GitHub.
 * - Logs ultra-detalhados e auditáveis: status, contexto, SHA, commit, erros, tempo de execução.
 * - Controle incremental robusto via cache local (arquivos .json no Drive) para mapeamento, delta e progresso.
 * - SHA-1 real dos arquivos do Drive para comparação precisa e operação incremental.
 * - Progresso salvo no arquivo .log (Drive) para retomada automática em execuções longas/interrompidas.
 * - Integração nativa com Google Sheets: histórico de auditoria detalhado.
 * - Notificações por e-mail com resumo, erros e status final da operação.
 * - Respeita o tempo máximo de execução (MAX_EXECUTION_TIME_MS) com interrupção segura e retomada.
 * 
 * Estratégia Técnica:
 * - Clean Architecture, modularidade, reuso e performance.
 * - Pronto para CI/CD, testes incrementais e auditoria.
 * - Projetado para escalabilidade, robustez e rastreabilidade.
 * - Altamente comentado, foco didático e manutenção simplificada.
 * 
 * Créditos:
 * - Idealização, arquitetura, código: Samuel Passamani (ShemuElDi) - github.com/SamuelPassamani
 * - XCam, 2024-2025. Todos os direitos reservados.
 * 
 * Pré-requisitos:
 * - Ativar "Drive" e "UrlFetchApp" no Apps Script.
 * - Definir ROOT_FOLDER_ID (pasta base no Drive) e REPO_BASE_PATH (ex: 'xcam-db/user')
 * - Definir SHEET_ID (Google Sheets de auditoria).
 * - Definir GITHUB_TOKEN (escopo Contents RW).
 * ===========================================================================================
 */

/******************************
 *  CONFIGURAÇÕES E CONSTANTES
 ******************************/
// const ROOT_FOLDER_ID = '1R8q38lLoeS1PjASq7GhbtnJG_oo2NcoB'; // Pasta "user" no Drive
const REPO_BASE_PATH = 'xcam-db/user'; // Caminho base no GitHub

const GITHUB_TOKEN = ''; // Token com escopo Contents RW
const GITHUB_REPO = 'SamuelPassamani/XCam';
const GITHUB_BRANCH = 'main';
const GITHUB_API = 'https://api.github.com';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
// const MAX_EXECUTION_TIME_MS = 4 * 60 * 1000 + 50 * 1000; // 4min50s

const SHEET_ID = '1e13r5_cMXXeuKNFVgfgV-seSCIFz5wdoueaWkQifOzE'; // Google Sheets de auditoria
const NOTIFY_EMAILS = ['webmaster@xcam.gay'];
const LOG_FILE_NAME = 'xcam_drive_github.log';

// Arquivos de cache incremental
const DRIVE_MAP_CACHE = 'drive_map.json';
const GITHUB_MAP_CACHE = 'github_map.json';
const SYNC_STATUS_CACHE = 'sync_status.json';

/******************************
 *  UTILITÁRIOS CONSOLIDADOS (Timeout, Logs, Progresso)
 ******************************/
function checarTempoLimite(startTime, relPath, silent = false) {
  const agora = Date.now();
  const tempo = agora - startTime;
  const max = typeof MAX_EXECUTION_TIME_MS !== "undefined" ? MAX_EXECUTION_TIME_MS : 280000; // 4m40s default
  if (tempo > max) {
    const msg = `⏰ Tempo máximo (${(tempo / 1000).toFixed(1)}s/${(max/1000)}s) excedido${relPath ? ` em: ${relPath}` : ""}`;
    if (!silent) logWarn(msg);
    if (!silent) throw new Error(msg);
    return true;
  }
  return false;
}
function logInfo(msg, extra) {
  Logger.log(`ℹ️ [INFO] ${msg}`);
  if (extra !== undefined) Logger.log(extra);
}
function logSuccess(msg, extra) {
  Logger.log(`🟢 [SUCESSO] ${msg}`);
  if (extra !== undefined) Logger.log(extra);
}
function logWarn(msg, extra) {
  Logger.log(`🟡 [AVISO] ${msg}`);
  if (extra !== undefined) Logger.log(extra);
}
function logError(msg, err) {
  Logger.log(`🛑 [ERRO] ${msg}`);
  if (err !== undefined) Logger.log(err);
}
function logStage(msg) {
  Logger.log(`\n========== ${msg} ==========\n`);
}
function logCache(msg, extra) {
  Logger.log(`💾 [CACHE] ${msg}`);
  if (extra !== undefined) Logger.log(extra);
}
function logProgresso(msg) {
  Logger.log(`🚦 [PROGRESSO] ${msg}`);
}
function registrarProgressoLog(relPath) {
  try {
    const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
    let logFile;
    const files = root.getFilesByName(LOG_FILE_NAME);
    if (files.hasNext()) {
      logFile = files.next();
    } else {
      logFile = root.createFile(LOG_FILE_NAME, "", MimeType.PLAIN_TEXT);
    }
    let content = logFile.getBlob().getDataAsString();
    content = content.replace(/#PROGRESSO:.*/g, "");
    if (relPath) {
      content += `#PROGRESSO:${relPath}\n`;
      logProgresso(`Checkpoint salvo para retomada: ${relPath}`);
    } else {
      logProgresso("Progresso limpo (processamento finalizado)");
    }
    logFile.setContent(content);
  } catch (e) {
    logError('❌ [PROGRESSO] Erro ao registrar progresso no .log', e);
  }
}
function lerUltimoProgressoLog() {
  try {
    const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
    const files = root.getFilesByName(LOG_FILE_NAME);
    if (!files.hasNext()) return null;
    const logFile = files.next();
    const content = logFile.getBlob().getDataAsString();
    const match = content.match(/#PROGRESSO:([^\n]+)/);
    if (match) {
      logProgresso(`Retomando progresso a partir de: ${match[1]}`);
      return match[1];
    }
    logProgresso("Nenhum progresso salvo. Iniciando do início.");
    return null;
  } catch (e) {
    logError('❌ [PROGRESSO] Erro ao ler progresso no .log', e);
    return null;
  }
}

/******************************
 *  FLUXO PRINCIPAL: ENTRADA
 ******************************/
function runDriveToGitHubAudit(dryRun = true) {
  const inicio = Date.now();
  const lastProcessed = lerUltimoProgressoLog();
  const audit = {
    dryRun,
    inicio: new Date(),
    fim: null,
    uploads: 0,
    updates: 0,
    deletes: 0,
    ignorados: 0,
    arquivosDrive: 0,
    arquivosGitHub: 0,
    erros: [],
    arquivos: [],
    resumo: '',
    startTime: inicio,
    lastProcessed
  };
  logStage(`🚦 [XCam] Iniciando AUDITORIA ${dryRun ? "(DRY-RUN/SIMULAÇÃO)" : "(REAL)"} Drive → GitHub | Retomando de: ${lastProcessed || "início"}`);
  try {
    fluxoCloneAuditado(audit);
    audit.fim = new Date();
    audit.resumo = gerarResumoAudit(audit);
    logStage(`🏁 [XCam] AUDITORIA CONCLUÍDA em ${((Date.now() - inicio) / 1000).toFixed(1)}s`);
    registrarLogSheet(audit);
    registrarLogFile(audit);
    enviarNotificacao(audit);
  } catch (e) {
    audit.erros.push({ etapa: 'global', msg: String(e) });
    logError("❌ [FATAL] Erro global na auditoria/clone", e);
    registrarLogSheet(audit);
    registrarLogFile(audit);
    enviarNotificacao(audit);
    throw e;
  }
}

/**
 * Fluxo principal: mapeamento, delta, cache, upload/update/delete, logs.
 */
function fluxoCloneAuditado(audit) {
  // === 1. Mapeamento do Drive com SHA real + cache incremental ===
  let driveMapCache = carregarCacheMap(DRIVE_MAP_CACHE);
  let driveFiles = null;
  if (cacheValido(driveMapCache, 5 * 60 * 1000)) {
    driveFiles = driveMapCache.dados;
    logCache("🗂️ Usando cache de mapeamento do Drive");
  } else {
    logCache("🔄 Cache do Drive ausente/expirado, mapeando (com SHA real)...");
    driveFiles = {};
    mapDriveFilesRecursivelyWithSHA(
      DriveApp.getFolderById(ROOT_FOLDER_ID),
      '',
      driveFiles,
      audit.startTime,
      audit.lastProcessed
    );
    salvarCacheMap(DRIVE_MAP_CACHE, driveFiles);
  }
  audit.arquivosDrive = Object.keys(driveFiles).length;

  // === 2. Mapeamento do GitHub com cache incremental ===
  let githubMapCache = carregarCacheMap(GITHUB_MAP_CACHE);
  let githubFiles = null;
  if (cacheValido(githubMapCache, 5 * 60 * 1000)) {
    githubFiles = githubMapCache.dados;
    logCache("🗂️ Usando cache de mapeamento do GitHub");
  } else {
    logCache("🔄 Cache do GitHub ausente/expirado, mapeando...");
    githubFiles = {};
    mapGitHubFilesRecursivelyWithSize(REPO_BASE_PATH, '', githubFiles);
    salvarCacheMap(GITHUB_MAP_CACHE, githubFiles);
  }
  audit.arquivosGitHub = Object.keys(githubFiles).length;

  // === 3. Calcula delta incremental (novos, modificados, removidos) ===
  const driveMapAntigo = driveMapCache ? driveMapCache.dados : {};
  const githubMapAntigo = githubMapCache ? githubMapCache.dados : {};
  const deltaDrive = obterDelta(driveMapAntigo, driveFiles);
  const deltaGitHub = obterDelta(githubMapAntigo, githubFiles);

  logCache(`🟢 Delta Drive - Novos: ${deltaDrive.novos.length}, Modificados: ${deltaDrive.modificados.length}, Removidos: ${deltaDrive.removidos.length}`);
  logCache(`🟣 Delta GitHub - Novos: ${deltaGitHub.novos.length}, Modificados: ${deltaGitHub.modificados.length}, Removidos: ${deltaGitHub.removidos.length}`);

  // === 4. Carrega cache de sincronizados ===
  let syncStatusCache = carregarCacheMap(SYNC_STATUS_CACHE);
  let syncStatus = (syncStatusCache && syncStatusCache.dados) ? syncStatusCache.dados : {};

  let passou = !audit.lastProcessed;

  // === 5. Upload/Update Drive → GitHub (Apenas Novos e Modificados) ===
  logInfo('🔄 Sincronizando arquivos Drive → GitHub (Delta, SHA real e Cache de Sincronizados)...');
  for (const relPath of [...deltaDrive.novos, ...deltaDrive.modificados]) {
    if (!passou) {
      if (relPath === audit.lastProcessed) {
        passou = true;
      }
      continue;
    }
    checarTempoLimite(audit.startTime, relPath);

    const driveObj = driveFiles[relPath];
    const githubObj = githubFiles[relPath];
    const driveSHA = driveObj.sha;
    const driveSize = driveObj.size;
    const githubSHA = githubObj ? githubObj.sha : null;
    const githubSize = githubObj ? githubObj.size : null;

    if (isSincronizado(relPath, driveSHA, driveSize, githubSHA, githubSize)) {
      logCache(`⏩ PULANDO ${relPath}: já sincronizado conforme cache`);
      continue;
    }

    const file = DriveApp.getFileById(driveObj.fileId);
    const githubPath = `${REPO_BASE_PATH}/${relPath}`;
    const logObj = auditUploadOrUpdateFile(file, githubPath, githubSHA, audit.dryRun);
    audit.arquivos.push(logObj);
    if (logObj.status === '🆕 Criado') audit.uploads++;
    if (logObj.status === '📝 Atualizado') audit.updates++;
    if (logObj.status === "⚠️ Ignorado (>50MB)") audit.ignorados++;
    if (logObj.status.startsWith("❌")) audit.erros.push(logObj);

    marcarSincronizado(relPath, driveSHA, driveSize, logObj.sha, logObj.tamanho);
    registrarProgressoLog(relPath);
  }

  // === 6. Exclusão: arquivos removidos do Drive que ainda existem no GitHub ===
  logInfo('🗑️ Verificando arquivos obsoletos no GitHub...');
  let excluiuAte = null;
  for (const relPath of deltaGitHub.removidos) {
    if (checarTempoLimite(audit.startTime, relPath, true)) {
      logWarn(`⏰ Tempo máximo excedido durante exclusão em ${relPath}. Exclusão será retomada na próxima execução.`);
      registrarProgressoLog(relPath);
      excluiuAte = relPath;
      break;
    }
    const githubObj = githubMapAntigo[relPath];
    const githubPath = `${REPO_BASE_PATH}/${relPath}`;
    const logObj = auditDeleteGitHubFile(githubPath, githubObj.sha, audit.dryRun);
    audit.arquivos.push(logObj);
    if (logObj.status === '🗑️ Removido') audit.deletes++;
    if (logObj.status.startsWith("❌")) audit.erros.push(logObj);

    // Remove do cache de sincronizados
    let updatedSyncCache = carregarCacheMap(SYNC_STATUS_CACHE);
    if (updatedSyncCache && updatedSyncCache.dados) {
      delete updatedSyncCache.dados[relPath];
      salvarCacheMap(SYNC_STATUS_CACHE, updatedSyncCache.dados);
    }
  }
  if (!excluiuAte) registrarProgressoLog("");
}

/******************************
 *  MAPEAMENTO E DELTA
 ******************************/
function mapDriveFilesRecursivelyWithSHA(folder, parentPath, driveFiles, startTime, lastProcessed) {
  if (!driveFiles || typeof driveFiles !== "object") driveFiles = {};
  let interrompido = null;
  let passou = !lastProcessed;

  let files;
  try {
    files = folder.getFiles();
  } catch (e) {
    logError(`❌ Erro ao acessar arquivos da pasta: ${parentPath || "(raiz)"}`, e);
    return null;
  }
  while (files.hasNext()) {
    checarTempoLimite(startTime, null);
    const file = files.next();
    const relPath = parentPath ? `${parentPath}/${file.getName()}` : file.getName();

    if (!passou) {
      if (relPath === lastProcessed) {
        passou = true;
      }
      continue;
    }

    if (driveFiles[relPath]) {
      logWarn(`⚠️ Arquivo duplicado detectado no caminho: ${relPath} (mantendo o primeiro encontrado)`);
      continue;
    }
    const sha = calcularSHA1DriveFile(file);
    driveFiles[relPath] = {
      sha,
      size: file.getSize(),
      fileId: file.getId()
    };
    logInfo(`🔍 [MAPEAMENTO] ${relPath} | SHA: ${sha} | Tamanho: ${file.getSize()} bytes`);
    registrarProgressoLog(relPath);

    if (checarTempoLimite(startTime, relPath, true)) {
      interrompido = relPath;
      break;
    }
  }

  let subfolders;
  try {
    subfolders = folder.getFolders();
  } catch (e) {
    logError(`❌ Erro ao acessar subpastas de: ${parentPath || "(raiz)"}`, e);
    return interrompido;
  }
  while (subfolders.hasNext() && !interrompido) {
    checarTempoLimite(startTime, null);
    const sub = subfolders.next();
    const subPath = parentPath ? `${parentPath}/${sub.getName()}` : sub.getName();
    logInfo(`📂 [MAPEAMENTO] Descendo na subpasta: ${subPath}`);
    const subInterrompido = mapDriveFilesRecursivelyWithSHA(sub, subPath, driveFiles, startTime, lastProcessed);
    if (subInterrompido) {
      interrompido = subInterrompido;
      break;
    }
  }
  return interrompido;
}

function mapGitHubFilesRecursivelyWithSize(repoBasePath, relPath, githubFiles) {
  const path = relPath ? `${repoBasePath}/${relPath}` : repoBasePath;
  const url = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${encodeURIComponent(path)}?ref=${GITHUB_BRANCH}`;
  const options = {
    method: "get",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github.v3+json"
    },
    muteHttpExceptions: true
  };
  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    if (code === 200) {
      const data = JSON.parse(response.getContentText());
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.type === 'file') {
            const subRelPath = relPath ? `${relPath}/${item.name}` : item.name;
            githubFiles[subRelPath] = {
              sha: item.sha,
              size: item.size
            };
          } else if (item.type === 'dir') {
            const subRelPath = relPath ? `${relPath}/${item.name}` : item.name;
            mapGitHubFilesRecursivelyWithSize(repoBasePath, subRelPath, githubFiles);
          }
        }
      } else if (data.type === 'file') {
        const subRelPath = relPath ? relPath : data.name;
        githubFiles[subRelPath] = {
          sha: data.sha,
          size: data.size
        };
      }
    }
  } catch (e) {
    // 404 é esperado para diretórios vazios ou não encontrados
  }
}

function calcularSHA1DriveFile(file) {
  try {
    const blob = file.getBlob();
    const bytes = blob.getBytes();
    const shaBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, bytes);
    return sha1BytesToHex(shaBytes);
  } catch (e) {
    logError(`❌ Erro ao calcular SHA-1 de ${file.getName()}`, e);
    return null;
  }
}

function sha1BytesToHex(shaBytes) {
  return shaBytes.map(b => {
    var v = (b < 0) ? b + 256 : b;
    return ('0' + v.toString(16)).slice(-2);
  }).join('');
}

function obterDelta(mapAntigo, mapNovo) {
  const novos = [];
  const modificados = [];
  const removidos = [];
  for (let path in mapNovo) {
    if (!mapAntigo[path]) {
      novos.push(path);
    } else {
      if (
        mapAntigo[path].sha !== mapNovo[path].sha ||
        mapAntigo[path].size !== mapNovo[path].size
      ) {
        modificados.push(path);
      }
    }
  }
  for (let path in mapAntigo) {
    if (!mapNovo[path]) removidos.push(path);
  }
  return { novos, modificados, removidos };
}

/******************************
 *  CACHE DE MAPEAMENTO E SINCRONIZADOS
 ******************************/
function salvarCacheMap(nomeArquivo, objeto) {
  try {
    const pastaRaiz = DriveApp.getFolderById(ROOT_FOLDER_ID);
    let file;
    const files = pastaRaiz.getFilesByName(nomeArquivo);
    const conteudo = JSON.stringify({
      dataGeracao: new Date().toISOString(),
      dados: objeto || {}
    });
    if (files.hasNext()) {
      file = files.next();
      file.setContent(conteudo);
    } else {
      file = pastaRaiz.createFile(nomeArquivo, conteudo, MimeType.PLAIN_TEXT);
    }
    logCache(`✅ Cache salvo/atualizado: ${nomeArquivo}`);
  } catch (e) {
    logCache(`❌ Falha ao salvar o cache (${nomeArquivo})`, e);
  }
}

function carregarCacheMap(nomeArquivo) {
  try {
    const pastaRaiz = DriveApp.getFolderById(ROOT_FOLDER_ID);
    const files = pastaRaiz.getFilesByName(nomeArquivo);
    if (!files.hasNext()) return null;
    const file = files.next();
    const conteudo = file.getBlob().getDataAsString();
    const obj = JSON.parse(conteudo);
    logCache(`✅ Cache carregado: ${nomeArquivo}`);
    return obj;
  } catch (e) {
    logCache(`❌ Falha ao carregar cache (${nomeArquivo})`, e);
    return null;
  }
}

function cacheValido(cacheObj, maxAgeMs = 5 * 60 * 1000) {
  try {
    if (!cacheObj || !cacheObj.dataGeracao) return false;
    const tGeracao = new Date(cacheObj.dataGeracao).getTime();
    if (isNaN(tGeracao)) return false;
    const tAgora = Date.now();
    if ((tAgora - tGeracao) < maxAgeMs) {
      logCache(`✅ Cache válido (atualizado há ${(tAgora-tGeracao)/1000}s)`);
      return true;
    }
    logCache(`ℹ️ Cache expirado (antigo demais: ${(tAgora-tGeracao)/1000}s)`);
    return false;
  } catch (e) {
    logCache(`❌ Erro ao validar cache`, e);
    return false;
  }
}

function marcarSincronizado(relPath, driveSHA, driveSize, githubSHA, githubSize) {
  const cache = carregarCacheMap(SYNC_STATUS_CACHE) || { dataGeracao: new Date().toISOString(), dados: {} };
  cache.dados[relPath] = {
    driveSHA, driveSize, githubSHA, githubSize,
    dataSync: new Date().toISOString()
  };
  salvarCacheMap(SYNC_STATUS_CACHE, cache.dados);
}

function isSincronizado(relPath, driveSHA, driveSize, githubSHA, githubSize) {
  const cache = carregarCacheMap(SYNC_STATUS_CACHE);
  if (!cache || !cache.dados || !cache.dados[relPath]) return false;
  const sync = cache.dados[relPath];
  return (
    sync.driveSHA === driveSHA &&
    sync.driveSize === driveSize &&
    sync.githubSHA === githubSHA &&
    sync.githubSize === githubSize
  );
}

/******************************
 *  UPLOAD, UPDATE E EXCLUSÃO (GitHub)
 ******************************/
function auditUploadOrUpdateFile(file, githubPath, githubSHA, dryRun) {
  const logObj = {
    data: new Date(),
    drive: githubPath,
    github: githubPath,
    status: '',
    commit: '',
    autor: '',
    msg: '',
    url: '',
    tamanho: file.getSize(),
    sha: githubSHA || ''
  };
  if (file.getSize() > MAX_FILE_SIZE) {
    logWarn(`⚠️ Ignorado (>50MB): ${githubPath}`);
    logObj.status = "⚠️ Ignorado (>50MB)";
    return logObj;
  }
  logInfo(`📦 ${dryRun ? "[SIMULAÇÃO]" : ""} Enviando: ${githubPath} (${(file.getSize()/1024).toFixed(1)} KB)`);
  if (dryRun) {
    logObj.status = githubSHA ? "📝 Atualizado (simulado)" : "🆕 Criado (simulado)";
    logObj.msg = "DRY-RUN: nenhuma alteração real feita.";
    return logObj;
  }
  let contentBase64;
  try {
    contentBase64 = Utilities.base64Encode(file.getBlob().getBytes());
  } catch (e) {
    logError(`❌ Erro Base64: ${githubPath}`, e);
    logObj.status = "❌ Base64 error";
    logObj.msg = String(e);
    return logObj;
  }
  const payload = {
    message: `${githubSHA ? "Atualizando" : "Criando"} arquivo via XCam DriveSync: ${githubPath}`,
    branch: GITHUB_BRANCH,
    content: contentBase64,
    ...(githubSHA && { sha: githubSHA })
  };
  const url = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${encodeURIComponent(githubPath)}`;
  const options = {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github.v3+json"
    },
    muteHttpExceptions: true
  };
  let response, code, respBody;
  try {
    response = UrlFetchApp.fetch(url, options);
    code = response.getResponseCode();
    respBody = response.getContentText();
  } catch (e) {
    logError(`❌ Falha API GitHub: ${githubPath}`, e);
    logObj.status = "❌ API error";
    logObj.msg = String(e);
    return logObj;
  }
  if (code >= 200 && code < 300) {
    let commitInfo = extractCommitInfo(respBody);
    logSuccess(`${githubSHA ? "📝 Atualizado" : "🆕 Criado"}: ${githubPath} | Commit: ${commitInfo.sha || ''}`);
    logObj.status = githubSHA ? "📝 Atualizado" : "🆕 Criado";
    logObj.commit = commitInfo.sha || "";
    logObj.autor = commitInfo.authorName || "";
    logObj.msg = commitInfo.message || "";
    logObj.url = commitInfo.url || "";
    logObj.sha = commitInfo.sha || "";
    return logObj;
  } else {
    let reason = extractGitHubErrorReason(respBody);
    logError(`❌ Erro GitHub [${code}]: ${githubPath} - Motivo: ${reason}`, respBody);
    logObj.status = "❌ GitHub error";
    logObj.msg = reason;
    return logObj;
  }
}

function auditDeleteGitHubFile(githubPath, sha, dryRun) {
  const logObj = {
    data: new Date(),
    drive: githubPath,
    github: githubPath,
    status: '',
    commit: '',
    autor: '',
    msg: '',
    url: '',
    tamanho: '',
    sha: sha || ''
  };
  logWarn(`🗑️ ${dryRun ? "[SIMULAÇÃO]" : ""} Removendo: ${githubPath}`);
  if (dryRun) {
    logObj.status = "🗑️ Removido (simulado)";
    logObj.msg = "DRY-RUN: nenhuma exclusão real feita.";
    return logObj;
  }
  const url = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${encodeURIComponent(githubPath)}`;
  const payload = {
    message: `Removendo arquivo via XCam DriveSync: ${githubPath}`,
    branch: GITHUB_BRANCH,
    sha: sha
  };
  const options = {
    method: "delete",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github.v3+json"
    },
    muteHttpExceptions: true
  };
  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    if (code >= 200 && code < 300) {
      logSuccess(`🗑️ Removido do GitHub: ${githubPath}`);
      logObj.status = "🗑️ Removido";
      return logObj;
    } else {
      let reason = extractGitHubErrorReason(response.getContentText());
      logError(`❌ Erro ao remover: ${githubPath} (${code}) - ${reason}`, response.getContentText());
      logObj.status = "❌ GitHub delete error";
      logObj.msg = reason;
      return logObj;
    }
  } catch (e) {
    logError(`❌ Exceção ao deletar do GitHub: ${githubPath}`, e);
    logObj.status = "❌ Exception on delete";
    logObj.msg = String(e);
    return logObj;
  }
}

/******************************
 *  LOGS, NOTIFICAÇÃO E SHEET
 ******************************/
function formatDate(date) {
  if (!date) return "-";
  return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
}
function extractGitHubErrorReason(respBody) {
  try {
    const obj = JSON.parse(respBody);
    if (obj.message) return obj.message;
    return "";
  } catch (e) {
    return respBody;
  }
}
function extractCommitInfo(respBody) {
  try {
    const obj = JSON.parse(respBody);
    if (obj && obj.commit && obj.commit.sha) {
      return {
        sha: obj.commit.sha,
        url: obj.commit.html_url || (obj.commit.sha ? `https://github.com/${GITHUB_REPO}/commit/${obj.commit.sha}` : ''),
        authorName: obj.commit.commit && obj.commit.commit.author ? obj.commit.commit.author.name : '',
        authorEmail: obj.commit.commit && obj.commit.commit.author ? obj.commit.commit.author.email : '',
        date: obj.commit.commit && obj.commit.commit.author ? obj.commit.commit.author.date : '',
        message: obj.commit.commit && obj.commit.commit.message ? obj.commit.commit.message : ''
      };
    }
    if (obj && obj.content && obj.commit) {
      return {
        sha: obj.commit.sha,
        url: obj.commit.html_url || (obj.commit.sha ? `https://github.com/${GITHUB_REPO}/commit/${obj.commit.sha}` : ''),
        authorName: obj.commit.committer && obj.commit.committer.name ? obj.commit.committer.name : '',
        authorEmail: obj.commit.committer && obj.commit.committer.email ? obj.commit.committer.email : '',
        date: obj.commit.committer && obj.commit.committer.date ? obj.commit.committer.date : '',
        message: obj.commit.message || ''
      };
    }
    return {};
  } catch (e) {
    return {};
  }
}
function gerarResumoAudit(audit) {
  return [
    `DRY-RUN: ${audit.dryRun ? 'Sim' : 'Não'}`,
    `Arquivos no Drive: ${audit.arquivosDrive}`,
    `Arquivos no GitHub: ${audit.arquivosGitHub}`,
    `Uploads: ${audit.uploads} | Updates: ${audit.updates} | Deletes: ${audit.deletes} | Ignorados: ${audit.ignorados}`,
    `Erros: ${audit.erros.length}`,
    `Início: ${formatDate(audit.inicio)}`,
    `Fim: ${formatDate(audit.fim)}`
  ].join(' | ');
}
function registrarLogSheet(audit) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const nomeAba = "Log de Registros";
    const cabecalhos = [
      "Data", "DRY-RUN", "Resumo", "Status", "Arquivo", "Commit", "Autor", "Mensagem", "URL", "Tamanho", "SHA"
    ];
    let sheet = ss.getSheetByName(nomeAba);
    if (!sheet) {
      sheet = ss.insertSheet(nomeAba);
    }
    let primeiroCabecalho = sheet.getRange(1, 1, 1, cabecalhos.length).getValues()[0];
    let precisaAtualizarCabecalho = false;
    for (let i = 0; i < cabecalhos.length; i++) {
      if (primeiroCabecalho[i] !== cabecalhos[i]) {
        precisaAtualizarCabecalho = true;
        break;
      }
    }
    if (precisaAtualizarCabecalho) {
      sheet.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);
    }
    if (audit.arquivos && audit.arquivos.length > 0) {
      const rows = audit.arquivos.map(log => [
        formatDate(log.data), audit.dryRun ? 'Sim' : 'Não', audit.resumo, log.status, log.github, log.commit, log.autor, log.msg, log.url, log.tamanho, log.sha
      ]);
      let proximaLinha = sheet.getLastRow() + 1;
      if (proximaLinha <= 1) proximaLinha = 2;
      sheet.getRange(proximaLinha, 1, rows.length, cabecalhos.length).setValues(rows);
    }
  } catch (e) {
    logError('❌ Erro ao registrar log no Sheets', e);
  }
}
function registrarLogFile(audit) {
  try {
    const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
    let logFile;
    const files = root.getFilesByName(LOG_FILE_NAME);
    if (files.hasNext()) {
      logFile = files.next();
    } else {
      logFile = root.createFile(LOG_FILE_NAME, "", MimeType.PLAIN_TEXT);
    }
    let logText = `\n[${formatDate(new Date())}] Auditoria Drive→GitHub (${audit.dryRun ? 'DRY-RUN' : 'REAL'})\n`;
    logText += `${audit.resumo}\n`;
    audit.arquivos.forEach(l => {
      logText += `- ${l.status} | ${l.github} | ${l.msg} | SHA: ${l.sha}\n`;
    });
    if (audit.erros.length > 0) {
      logText += `Erros (${audit.erros.length}):\n`;
      audit.erros.forEach(e => { logText += `  - ${e.status || ''} | ${e.github || ''} | ${e.msg}\n`; });
    }
    logText += `------------------------------------\n`;
    const atual = logFile.getBlob().getDataAsString();
    logFile.setContent(atual + logText);
  } catch (e) {
    logError('❌ Erro ao registrar .log no Drive', e);
  }
}
function enviarNotificacao(audit) {
  try {
    const assunto = `[XCam][Drive→GitHub] Auditoria ${audit.dryRun ? "DRY-RUN" : "REAL"} - ${audit.erros.length > 0 ? "🚨 ERROS DETECTADOS" : "OK"}`
    let corpo = `${audit.resumo}\n\n`;
    corpo += audit.erros.length > 0 ? `Erros encontrados:\n` : 'Nenhum erro detectado.\n';
    audit.erros.forEach(e => { corpo += `- ${e.status || ''} | ${e.github || ''} | ${e.msg}\n`; });
    NOTIFY_EMAILS.forEach(email => {
      MailApp.sendEmail(email, assunto, corpo);
    });
  } catch (e) {
    logError('❌ Falha ao enviar notificação por email', e);
  }
}

/******************************
 *  ENTRADA PADRÃO (PRODUÇÃO)
 ******************************/
function runSync() {
  runDriveToGitHubAudit(false); // Altere para true para DRY-RUN
}

/* ================================================================================
 * ===== FIM DO SCRIPT - CLONE AUDITADO Google Drive → GitHub (XCam) ============= 
 * ================================================================================
 */