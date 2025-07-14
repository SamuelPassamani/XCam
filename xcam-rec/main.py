# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         main.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.5.0
# @lastupdate:     2025-07-14
# @description:    Script principal e orquestrador do módulo XCam Rec. Este script é responsável
#                  por obter a lista de streamers online, iniciar processos de gravação paralelos,
#                  validar a duração das gravações, fazer o upload do conteúdo e, finalmente,
#                  atualizar os metadados no "Git-as-a-Database".
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
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any

# --- Importações de Módulos do Projeto ---
# Importa as configurações de caminhos e os valores padrão.
import config

# Importa as funções utilitárias dos outros módulos.
from utils.logger import setup_logging # Assumindo que logger.py tem uma função de setup.
from utils.xcam_api import get_online_models
from utils.ffmpeg_recorder import record_stream_and_capture_thumbnail # <-- CORREÇÃO: Importa a função unificada.
from utils.video_utils import manage_recorded_file # <-- FEATURE: Importa a nova função de validação.
from utils.abyss_upload import upload_video
from utils.rec_manager import create_or_update_rec_json, RecordingManager

# Inicializa o logger principal da aplicação.
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def _sanitize_filename(name: str) -> str:
    """Remove caracteres inválidos de uma string para usá-la como nome de ficheiro."""
    # Substitui qualquer caracter que não seja letra, número, underscore, hífen ou ponto.
    return re.sub(r'[^\w\-. ]', '', name)

def process_broadcast(broadcast: Dict[str, Any], min_duration: int, max_duration: int):
    """
    Worker que executa o fluxo completo para uma única transmissão.
    Grava, valida a duração, faz o upload e atualiza os metadados.
    """
    username = broadcast.get("username")
    stream_url = broadcast.get("hls_url") # Garante que estamos a usar a URL HLS correta.

    # Validação inicial dos dados da transmissão.
    if not all([username, stream_url]):
        logger.warning(f"⚠️ Transmissão com dados incompletos, pulando: {broadcast.get('id')}")
        return

    logger.info(f"▶️  Iniciando processamento para o streamer: {username}")
    
    # Define os caminhos para os ficheiros temporários.
    safe_filename_base = f"{_sanitize_filename(username)}_{int(time.time())}"
    temp_video_path = os.path.join(config.TEMP_RECORDS_PATH, f"{safe_filename_base}.mp4")
    temp_poster_path = os.path.join(config.TEMP_POSTERS_PATH, f"{safe_filename_base}.jpg")

    try:
        # --- Etapa 1: Gravação e Captura do Thumbnail ---
        # Chama a função unificada que lida com a gravação e a captura da imagem.
        record_successful = record_stream_and_capture_thumbnail(
            username=username,
            stream_url=stream_url,
            output_path=temp_video_path,
            thumbnail_path=temp_poster_path,
            max_duration=max_duration
        )

        # Se a gravação falhar, interrompe o processo para este streamer.
        if not record_successful:
            logger.error(f"❌ A gravação para {username} falhou. Abortando tarefa.")
            return

        # --- Etapa 2: Validação da Duração Mínima ---
        # Chama a função que verifica a duração e decide se mantém ou descarta os ficheiros.
        file_is_valid = manage_recorded_file(
            video_path=temp_video_path,
            thumbnail_path=temp_poster_path,
            min_duration=min_duration
        )
        
        # Se o ficheiro não for válido (muito curto), interrompe o processo.
        if not file_is_valid:
            return # A função manage_recorded_file já registou o motivo.

        # --- Etapa 3: Upload do Vídeo e Gestão do Poster ---
        # Esta etapa só é executada se a gravação for válida.
        logger.info(f"📤 Iniciando upload do vídeo para {username}...")
        upload_response = upload_video(temp_video_path)
        
        if not upload_response or "id" not in upload_response:
            logger.error(f"❌ Falha no upload ou resposta inválida para {username}. Abortando.")
            return
        
        video_slug = upload_response.get("id")
        final_video_url = upload_response.get("url")
        
        # Move o poster para o diretório persistente, renomeando-o com o slug do vídeo.
        user_poster_dir = os.path.join(config.DRIVE_PERSISTENT_USER_PATH, username)
        os.makedirs(user_poster_dir, exist_ok=True)
        final_poster_path = os.path.join(user_poster_dir, f"{video_slug}.jpg")
        shutil.move(temp_poster_path, final_poster_path)
        final_poster_public_url = f"https://db.xcam.gay/user/{username}/{video_slug}.jpg"
        logger.info(f"🖼️  Poster movido para o destino final: {final_poster_path}")

        # --- Etapa 4: Atualizar Metadados ---
        create_or_update_rec_json(
            username=username,
            video_id=video_slug,
            upload_url=final_video_url,
            poster_url=final_poster_public_url,
            duration_seconds=int(get_video_duration(temp_video_path)) # Obtém a duração real
        )
        logger.info(f"✅ Processo para {username} concluído com sucesso.")

    finally:
        # --- Etapa 5: Limpeza Final ---
        # Garante que todos os ficheiros temporários sejam removidos, independentemente do resultado.
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        if os.path.exists(temp_poster_path):
            os.remove(temp_poster_path)
        logger.info(f"🧹 Arquivos temporários para {username} foram limpos.")


def main(args: argparse.Namespace):
    """
    Função principal que orquestra a busca e o processamento de todas as transmissões.
    """
    # Configura o sistema de logging com base nas definições do config.py.
    setup_logging(log_level=config.LOG_LEVEL, log_file=os.path.join(config.LOGS_PATH, config.LOG_FILE))
    
    logger.info("🚀 Iniciando o XCam REC Engine...")
    logger.info(f"    - Duração Mínima: {args.min_duration}s | Duração Máxima: {args.max_duration}s")
    
    # Cria os diretórios de trabalho necessários (temp, logs, etc.).
    os.makedirs(config.TEMP_RECORDS_PATH, exist_ok=True)
    os.makedirs(config.TEMP_POSTERS_PATH, exist_ok=True)
    os.makedirs(config.LOGS_PATH, exist_ok=True)
    
    rec_manager = RecordingManager()

    while True:
        try:
            logger.info(f"📡 A procurar modelos online (Página: {args.page}, Limite: {args.limit})...")
            online_models = get_online_models(page=args.page, limit=args.limit, country=args.country)

            if not online_models:
                logger.info("💤 Nenhum modelo online encontrado nesta verificação.")
            else:
                logger.info(f"🟢 Encontrados {len(online_models)} modelos online. A iniciar processamento...")
                
                with ThreadPoolExecutor(max_workers=args.workers) as executor:
                    futures = []
                    for model in online_models:
                        username = model.get("username")
                        if username and not rec_manager.is_recording(username):
                            rec_manager.add_model(username)
                            # Submete a tarefa ao executor com todos os argumentos necessários.
                            future = executor.submit(process_broadcast, model, args.min_duration, args.max_duration)
                            futures.append(future)
                    
                    # Aguarda a conclusão das tarefas submetidas.
                    for future in as_completed(futures):
                        try:
                            future.result()
                        except Exception as exc:
                            logger.critical(f"🔥 Uma tarefa de gravação gerou uma exceção não tratada: {exc}", exc_info=True)
        
        except Exception as e:
            logger.critical(f"🔥 Erro crítico no loop principal: {e}", exc_info=True)

        logger.info(f"⏳ A aguardar {config.DEFAULT_EXECUTION_SETTINGS['CHECK_INTERVAL_SECONDS']} segundos para a próxima verificação.")
        time.sleep(config.DEFAULT_EXECUTION_SETTINGS['CHECK_INTERVAL_SECONDS'])

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

if __name__ == "__main__":
    # Configura o parser de argumentos da linha de comando.
    parser = argparse.ArgumentParser(description="XCam REC - Gravador Modular de Transmissões.", formatter_class=argparse.RawTextHelpFormatter)
    
    # --- CORREÇÃO: Atualiza os argumentos para refletir as novas configurações ---
    parser.add_argument('--page', type=int, help='Número da página da API a ser consultada.')
    parser.add_argument('--limit', type=int, help='Número máximo de transmissões por página.')
    parser.add_argument('--workers', type=int, help='Número de gravações paralelas (threads).')
    parser.add_argument('--max-duration', type=int, help='Duração máxima de cada gravação em segundos.')
    parser.add_argument('--min-duration', type=int, help='Duração mínima para que uma gravação seja mantida.')
    parser.add_argument('--country', type=str, help='Filtra por código de país (ex: br, us).')
    
    args = parser.parse_args()
    
    # Chama a função principal com os argumentos recebidos.
    main(args)

# @log de mudanças:
# 2025-07-14 (v1.5.0):
# - CORREÇÃO: Corrigido o `ImportError` ao importar `record_stream_and_capture_thumbnail` de `ffmpeg_recorder`.
# - FEATURE: Implementada a lógica de validação de `min_duration` através da chamada a `manage_recorded_file`.
# - REFACTOR: A função `process_broadcast` foi reestruturada para seguir o novo fluxo de gravação -> validação -> upload.
# - REFACTOR: Os argumentos de linha de comando foram atualizados para `--max-duration` e `--min-duration`.
# - DOCS: Comentários atualizados para refletir a nova lógica e fluxo de execução.
#
# 2025-07-13 (v1.4.0):
# - Versão anterior com lógica de upload e gestão de ficheiros, mas com importações desatualizadas.

# @roadmap futuro:
# - Adicionar um sistema de gestão de estado mais robusto (ex: base de dados local como SQLite) para
#   controlar as gravações e evitar perdas de estado se o script for reiniciado.
# - Implementar uma lógica de "retry" com backoff exponencial para uploads que falham.
# - Criar um mecanismo para limpar ficheiros temporários muito antigos que possam ter ficado para trás
#   devido a uma interrupção abrupta do script.
