# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         main.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.7.0
# @lastupdate:     2025-07-14
# @description:    Script principal e orquestrador do módulo XCam Rec. Este script é responsável
#                  por obter a lista de streamers online, implementar uma lógica de fallback
#                  para encontrar a URL do stream, iniciar processos de gravação paralelos,
#                  validar a duração das gravações e atualizar os metadados.
# @modes:          - Aplicação de Linha de Comando (CLI) para ser executada pelo Launcher.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# --- Importações de Bibliotecas Padrão ---
import argparse
import os
import re
import shutil
import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any, Set, Optional

# --- Importações de Módulos do Projeto ---
import config
from utils.logger import setup_logging
from utils.xcam_api import get_online_models, get_user_live_info
from utils.ffmpeg_recorder import record_stream_and_capture_thumbnail
from utils.video_utils import manage_recorded_file, get_video_duration
from utils.abyss_upload import upload_video
from utils.rec_manager import create_or_update_rec_json

# --- Variáveis Globais ---
# Inicializa um logger específico para este módulo.
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def _sanitize_filename(name: str) -> str:
    """Função auxiliar para remover caracteres inválidos de uma string."""
    return re.sub(r'[^\w\-]', '', name)

def _get_stream_url(broadcast: Dict[str, Any]) -> Optional[str]:
    """
    Tenta obter a URL do stream, usando um fallback se necessário.
    """
    username = broadcast.get("username")
    
    # Tentativa 1: Obter a URL HLS (.m3u8) diretamente da lista de modelos.
    # O caminho é broadcast -> preview -> src
    primary_url = broadcast.get("preview", {}).get("src")
    if primary_url:
        logger.info(f"📹 URL de stream principal encontrada para '{username}'.")
        return primary_url

    # Tentativa 2 (Fallback): Se a URL principal estiver vazia, chama o endpoint /liveInfo.
    logger.warning(f"⚠️ URL de stream principal em falta para '{username}'. A tentar obter URL de fallback...")
    live_info = get_user_live_info(username)
    
    if live_info:
        # Dá prioridade à cdnURL, que é geralmente mais estável.
        fallback_url = live_info.get("cdnURL") or live_info.get("edgeURL")
        if fallback_url:
            logger.info(f"📹 URL de stream de fallback ('{ 'cdnURL' if live_info.get('cdnURL') else 'edgeURL' }') encontrada para '{username}'.")
            return fallback_url

    # Se ambas as tentativas falharem, regista o erro.
    logger.error(f"❌ Não foi possível obter uma URL de stream válida para '{username}' após todas as tentativas.")
    return None

def process_broadcast_worker(broadcast: Dict[str, Any], min_duration: int, max_duration: int, recording_set: Set[str]):
    """
    Worker executado em uma thread. Orquestra o fluxo completo para uma única transmissão.
    """
    username = broadcast.get("username")
    if not username:
        logger.warning("⚠️ Transmissão sem username encontrada. A pular.")
        return

    try:
        # --- Etapa 1: Obter a URL do Stream com Lógica de Fallback ---
        stream_url = _get_stream_url(broadcast)
        if not stream_url:
            return # Aborta se nenhuma URL válida for encontrada. O log de erro já foi emitido.

        # --- Etapas subsequentes (gravação, validação, etc.) ---
        logger.info(f"▶️  Iniciando processamento para o streamer: {username}")
        
        safe_filename_base = f"{_sanitize_filename(username)}_{int(time.time())}"
        temp_video_path = os.path.join(config.TEMP_RECORDS_PATH, f"{safe_filename_base}.mp4")
        temp_poster_path = os.path.join(config.TEMP_POSTERS_PATH, f"{safe_filename_base}.jpg")

        record_successful = record_stream_and_capture_thumbnail(
            username=username,
            stream_url=stream_url,
            output_path=temp_video_path,
            thumbnail_path=temp_poster_path,
            max_duration=max_duration
        )

        if not record_successful:
            logger.error(f"❌ A gravação para {username} falhou.")
            return

        file_is_valid = manage_recorded_file(
            video_path=temp_video_path,
            thumbnail_path=temp_poster_path,
            min_duration=min_duration
        )
        
        if not file_is_valid:
            return

        logger.info(f"📤 Iniciando upload do vídeo para {username}...")
        upload_response = upload_video(temp_video_path)
        
        if not upload_response or "id" not in upload_response:
            logger.error(f"❌ Falha no upload ou resposta inválida para {username}.")
            return
        
        video_slug = upload_response.get("id")
        final_video_url = upload_response.get("url")
        
        user_poster_dir = os.path.join(config.DRIVE_PERSISTENT_USER_PATH, username)
        os.makedirs(user_poster_dir, exist_ok=True)
        final_poster_path = os.path.join(user_poster_dir, f"{video_slug}.jpg")
        shutil.move(temp_poster_path, final_poster_path)
        final_poster_public_url = f"https://db.xcam.gay/user/{username}/{video_slug}.jpg"
        logger.info(f"🖼️  Poster movido para o destino final: {final_poster_path}")

        create_or_update_rec_json(
            username=username,
            video_id=video_slug,
            upload_url=final_video_url,
            poster_url=final_poster_public_url,
            duration_seconds=int(get_video_duration(temp_video_path))
        )
        logger.info(f"✅ Processo para {username} concluído com sucesso.")

    finally:
        # Garante que ficheiros temporários sejam limpos e que o estado de gravação seja libertado.
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        if os.path.exists(temp_poster_path):
            os.remove(temp_poster_path)
        
        recording_set.remove(username)
        logger.info(f"🧹 Tarefa para {username} finalizada e estado de gravação limpo.")

def main(args: argparse.Namespace):
    """
    Função principal que orquestra todo o processo de gravação.
    """
    # Configura o logger uma única vez no início da aplicação.
    setup_logging(log_level=config.LOG_LEVEL, log_file=os.path.join(config.LOGS_PATH, config.LOG_FILE))
    
    logger.info("🚀 Iniciando o XCam REC Engine...")
    logger.info(f"    - Duração Mínima: {args.min_duration}s | Duração Máxima: {args.max_duration}s")
    
    os.makedirs(config.TEMP_RECORDS_PATH, exist_ok=True)
    os.makedirs(config.TEMP_POSTERS_PATH, exist_ok=True)
    
    # Conjunto para manter o estado dos modelos que estão a ser gravados.
    currently_recording = set()

    while True:
        try:
            logger.info(f"📡 A procurar modelos online (Página: {args.page}, Limite: {args.limit})...")
            online_models = get_online_models(page=args.page, limit=args.limit, country=args.country)

            if not online_models:
                logger.info("💤 Nenhum modelo online encontrado nesta verificação.")
            else:
                logger.info(f"🟢 Encontrados {len(online_models)} modelos online. A verificar tarefas...")
                
                with ThreadPoolExecutor(max_workers=args.workers) as executor:
                    for model in online_models:
                        username = model.get("username")
                        if username and username not in currently_recording:
                            currently_recording.add(username)
                            logger.info(f"➕ Adicionando {username} à fila de gravação.")
                            executor.submit(process_broadcast_worker, model, args.min_duration, args.max_duration, currently_recording)
        
        except Exception as e:
            logger.critical(f"🔥 Erro crítico no loop principal: {e}", exc_info=True)

        check_interval = config.DEFAULT_EXECUTION_SETTINGS['CHECK_INTERVAL_SECONDS']
        logger.info(f"⏳ A aguardar {check_interval} segundos para a próxima verificação.")
        time.sleep(check_interval)

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

if __name__ == "__main__":
    # Configura o parser para aceitar argumentos da linha de comando.
    parser = argparse.ArgumentParser(description="XCam REC - Gravador Modular de Transmissões.")
    
    # Define os argumentos que o script pode receber, lidos do Launcher.
    parser.add_argument('--page', type=int, help='Número da página da API a ser consultada.')
    parser.add_argument('--limit', type=int, help='Número máximo de transmissões por página.')
    parser.add_argument('--workers', type=int, help='Número de gravações paralelas (threads).')
    parser.add_argument('--max-duration', type=int, help='Duração máxima de cada gravação em segundos.')
    parser.add_argument('--min-duration', type=int, help='Duração mínima para que uma gravação seja mantida.')
    parser.add_argument('--country', type=str, help='Filtra por código de país (ex: br, us).')
    
    args = parser.parse_args()
    main(args)

# @log de mudanças:
# 2025-07-14 (v1.7.0):
# - FEATURE: Implementada a lógica de fallback na função `_get_stream_url`. O script agora tenta
#   obter a `hls_url` do endpoint secundário `/liveInfo` se a URL principal estiver em falta.
# - REFACTOR: Criada a função `_get_stream_url` para encapsular e limpar a lógica de obtenção de URL.
# - REFACTOR: O nome da função do worker foi alterado para `process_broadcast_worker` para maior clareza.
# - DOCS: Comentários atualizados para refletir a nova lógica de fallback.
#
# 2025-07-14 (v1.6.0):
# - CORREÇÃO: Corrigido o `ImportError` e a lógica de gestão de estado com a remoção do `RecordingManager`.
#
# 2025-07-14 (v1.5.0):
# - Versão inicial com desalinhamento de importações e gestão de estado.

# @roadmap futuro:
# - Adicionar uma verificação de tipo de stream (ex: 'public', 'private') para decidir se deve gravar.
# - Implementar uma lógica de "retry" com backoff exponencial para as chamadas à API.
# - Criar um mecanismo para limpar ficheiros temporários muito antigos que possam ter ficado para trás.
