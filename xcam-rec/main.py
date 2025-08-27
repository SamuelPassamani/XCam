# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         main.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.10.0
# @lastupdate:     2025-08-27
# @description:    Script principal e orquestrador do módulo XCam Rec. Este script é responsável
#                  por obter a lista de streamers online, implementar uma lógica de fallback
#                  para encontrar a URL do stream, iniciar processos de gravação paralelos,
#                  validar a duração das gravações, adicionar marca d'água e atualizar os metadados.
# @modes:          - Aplicação de Linha de Comando (CLI) para ser executada pelo Launcher.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

import argparse
import os
import re
import shutil
import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any, Set, Optional

import config
from utils.logger import setup_logging
from utils.xcam_api import get_online_models, get_user_live_info
from utils.ffmpeg_recorder import record_stream_and_capture_thumbnail
from utils.video_utils import manage_recorded_file, get_video_duration
from utils.abyss_upload import upload_video
from utils.rec_manager import create_or_update_rec_json
from utils.watermark import add_watermark

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def _sanitize_filename(name: str) -> str:
    return re.sub(r'[^\w\-]', '', name)

def _get_stream_url(broadcast: Dict[str, Any]) -> Optional[str]:
    username = broadcast.get("username")
    primary_url = broadcast.get("preview", {}).get("src")
    if primary_url:
        logger.info(f"📹 URL de stream principal encontrada para '{username}'.")
        return primary_url
    logger.warning(f"⚠️ URL de stream principal em falta para '{username}'. A tentar obter URL de fallback...")
    live_info = get_user_live_info(username)
    if live_info:
        fallback_url = live_info.get("cdnURL") or live_info.get("edgeURL")
        if fallback_url:
            logger.info(f"📹 URL de stream de fallback ('{ 'cdnURL' if live_info.get('cdnURL') else 'edgeURL' }') encontrada para '{username}'.")
            return fallback_url
    logger.error(f"❌ Não foi possível obter uma URL de stream válida para '{username}' após todas as tentativas.")
    return None

def process_broadcast_worker(
    broadcast: Dict[str, Any],
    min_duration: int,
    max_duration: int,
    recording_set: Set[str],
    watermark_path: str,
    watermark_width: int
):
    username = broadcast.get("username")
    if not username:
        logger.warning("⚠️ Transmissão sem username encontrada. A pular.")
        return

    try:
        stream_url = _get_stream_url(broadcast)
        if not stream_url:
            return

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

        # --- Adiciona marca d'água usando os argumentos recebidos ---
        watermarked_video_path = temp_video_path.replace(".mp4", "_wm.mp4")
        success = add_watermark(
            input_video=temp_video_path,
            output_video=watermarked_video_path,
            watermark_image=watermark_path,
            max_width=watermark_width
        )
        if success:
            os.remove(temp_video_path)
            temp_video_path = watermarked_video_path
            logger.info(f"💧 Marca d'água adicionada ao vídeo de {username}.")
        else:
            logger.error(f"❌ Não foi possível adicionar marca d'água para {username}, prosseguindo com vídeo original.")

        # --- Renomeia o arquivo de vídeo para o padrão correto antes do upload ---
        from datetime import datetime
        import pytz
        now_sp = datetime.now(pytz.timezone('America/Sao_Paulo'))
        formatted_date = now_sp.strftime('%d-%m-%Y')
        formatted_time = now_sp.strftime('%H:%M')
        duration_seconds = int(get_video_duration(temp_video_path))
        def _format_duration(seconds: int) -> str:
            seconds = int(seconds)
            hours, remainder = divmod(seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            parts = []
            if hours > 0:
                parts.append(f"{hours}h")
            if minutes > 0:
                parts.append(f"{minutes}m")
            if seconds > 0 or not parts:
                parts.append(f"{seconds}s")
            return "".join(parts)
        formatted_duration = _format_duration(duration_seconds)
        title = f"{username}_{formatted_date}_{formatted_time}_{formatted_duration}"
        file_name = f"{title}.mp4"
        final_video_path = os.path.join(config.TEMP_RECORDS_PATH, file_name)
        os.rename(temp_video_path, final_video_path)
        temp_video_path = final_video_path

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
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        if os.path.exists(temp_poster_path):
            os.remove(temp_poster_path)
        recording_set.remove(username)
        logger.info(f"🧹 Tarefa para {username} finalizada e estado de gravação limpo.")

def main(args: argparse.Namespace):
    setup_logging(log_level=config.LOG_LEVEL, log_file=os.path.join(config.LOGS_PATH, config.LOG_FILE))

    # Recupera argumentos de watermark
    watermark_path = args.watermark_path or getattr(config, "WATERMARK_IMAGE_PATH", "")
    watermark_width = args.watermark_width or getattr(config, "WATERMARK_MAX_WIDTH", 180)

    logger.info("🚀 Iniciando o XCam REC Engine...")
    logger.info(f"    - Duração Mínima: {args.min_duration}s | Duração Máxima: {args.max_duration}s")
    logger.info(f"    - Marca d'água: {watermark_path} | Largura: {watermark_width}px")

    os.makedirs(config.TEMP_RECORDS_PATH, exist_ok=True)
    os.makedirs(config.TEMP_POSTERS_PATH, exist_ok=True)
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
                            executor.submit(
                                process_broadcast_worker,
                                model,
                                args.min_duration,
                                args.max_duration,
                                currently_recording,
                                watermark_path,
                                watermark_width
                            )
        except Exception as e:
            logger.critical(f"🔥 Erro crítico no loop principal: {e}", exc_info=True)

        check_interval = config.DEFAULT_EXECUTION_SETTINGS['CHECK_INTERVAL_SECONDS']
        logger.info(f"⏳ A aguardar {check_interval} segundos para a próxima verificação.")
        time.sleep(check_interval)

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="XCam REC - Gravador Modular de Transmissões.")
    parser.add_argument('--page', type=int, help='Número da página da API a ser consultada.')
    parser.add_argument('--limit', type=int, help='Número máximo de transmissões por página.')
    parser.add_argument('--workers', type=int, help='Número de gravações paralelas (threads).')
    parser.add_argument('--max-duration', type=int, help='Duração máxima de cada gravação em segundos.')
    parser.add_argument('--min-duration', type=int, help='Duração mínima para que uma gravação seja mantida.')
    parser.add_argument('--country', type=str, help='Filtra por código de país (ex: br, us).')
    parser.add_argument('--watermark-path', type=str, help='Caminho para a imagem/SVG da marca d\'água.')
    parser.add_argument('--watermark-width', type=int, help='Largura máxima da marca d\'água em pixels.')
    args = parser.parse_args()
    main(args)

# @log de mudanças:
# 2025-08-27 (v1.10.0):
# - FEATURE: Marca d'água agora pode ser definida pelo usuário via CLI e é propagada até os workers.