# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         main.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.6.0
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
import argparse                     # Para criar uma interface de linha de comando amigável.
import os                           # Para interações com o sistema de arquivos (caminhos, diretórios).
import re                           # Para usar expressões regulares (neste caso, para limpar nomes de ficheiros).
import shutil                       # Para operações de ficheiros de alto nível, como mover.
import logging                      # Biblioteca padrão para logging.
import time                         # Para adicionar pausas (sleep) e gerar timestamps.
from concurrent.futures import ThreadPoolExecutor, as_completed # Para executar gravações em paralelo.
from typing import Dict, Any, Set     # Para anotações de tipo, melhorando a clareza do código.

# --- Importações de Módulos do Projeto ---
import config                       # Importa as configurações de caminhos e os valores padrão.
from utils.logger import setup_logging
from utils.xcam_api import get_online_models
from utils.ffmpeg_recorder import record_stream_and_capture_thumbnail
from utils.video_utils import manage_recorded_file, get_video_duration
from utils.abyss_upload import upload_video
from utils.rec_manager import create_or_update_rec_json

# --- Variáveis Globais ---
# Inicializa um logger específico para este módulo, que será o ponto de entrada.
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def _sanitize_filename(name: str) -> str:
    """
    Função auxiliar para remover caracteres inválidos de uma string.
    Garante que nomes de utilizadores não criem nomes de ficheiro problemáticos.
    """
    # Substitui qualquer caracter que não seja letra, número, underscore, ou hífen por nada.
    return re.sub(r'[^\w\-]', '', name)

def process_broadcast_worker(broadcast: Dict[str, Any], min_duration: int, max_duration: int, recording_set: Set[str]):
    """
    Worker executado em uma thread. Orquestra o fluxo completo para uma única transmissão.
    Grava, valida, faz upload e atualiza os metadados.

    Args:
        broadcast (Dict[str, Any]): O dicionário de dados do streamer, vindo da API.
        min_duration (int): A duração mínima da gravação para que seja mantida.
        max_duration (int): A duração máxima da gravação.
        recording_set (Set[str]): O conjunto compartilhado de modelos em gravação, para gestão de estado.
    """
    username = broadcast.get("username")
    # A URL do stream HLS é a mais estável para gravação com FFmpeg.
    stream_url = broadcast.get("hls_url")

    # Validação inicial para garantir que temos os dados mínimos para prosseguir.
    if not all([username, stream_url]):
        logger.warning(f"⚠️ Transmissão com dados incompletos, pulando: {broadcast}")
        if username:
            recording_set.remove(username) # Libera o username se ele foi adicionado.
        return

    logger.info(f"▶️  Iniciando processamento para o streamer: {username}")
    
    # Cria um nome de ficheiro base único usando o nome do utilizador e um timestamp Unix.
    safe_filename_base = f"{_sanitize_filename(username)}_{int(time.time())}"
    # Define os caminhos completos para os ficheiros temporários.
    temp_video_path = os.path.join(config.TEMP_RECORDS_PATH, f"{safe_filename_base}.mp4")
    temp_poster_path = os.path.join(config.TEMP_POSTERS_PATH, f"{safe_filename_base}.jpg")

    try:
        # --- Etapa 1: Gravação e Captura do Thumbnail ---
        record_successful = record_stream_and_capture_thumbnail(
            username=username,
            stream_url=stream_url,
            output_path=temp_video_path,
            thumbnail_path=temp_poster_path,
            max_duration=max_duration
        )

        if not record_successful:
            logger.error(f"❌ A gravação para {username} falhou. Abortando tarefa.")
            return # Interrompe a execução para este streamer.

        # --- Etapa 2: Validação da Duração Mínima ---
        file_is_valid = manage_recorded_file(
            video_path=temp_video_path,
            thumbnail_path=temp_poster_path,
            min_duration=min_duration
        )
        
        if not file_is_valid:
            return # Interrompe se o ficheiro foi descartado. O log já foi emitido.

        # --- Etapa 3: Upload do Vídeo e Gestão do Poster ---
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

        # --- Etapa 4: Atualizar Metadados (rec.json) ---
        create_or_update_rec_json(
            username=username,
            video_id=video_slug,
            upload_url=final_video_url,
            poster_url=final_poster_public_url,
            duration_seconds=int(get_video_duration(temp_video_path))
        )
        logger.info(f"✅ Processo para {username} concluído com sucesso.")

    finally:
        # --- Etapa 5: Limpeza Final e Gestão de Estado ---
        # Garante que todos os ficheiros temporários sejam removidos.
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        if os.path.exists(temp_poster_path):
            os.remove(temp_poster_path)
        
        # Remove o utilizador do conjunto de gravações ativas para que possa ser gravado novamente.
        recording_set.remove(username)
        logger.info(f"🧹 Tarefa para {username} finalizada e estado de gravação limpo.")

def main(args: argparse.Namespace):
    """
    Função principal que orquestra a busca e o processamento de todas as transmissões.
    """
    # Configura o sistema de logging uma única vez no início da aplicação.
    setup_logging(log_level=config.LOG_LEVEL, log_file=os.path.join(config.LOGS_PATH, config.LOG_FILE))
    
    logger.info("🚀 Iniciando o XCam REC Engine...")
    logger.info(f"    - Duração Mínima: {args.min_duration}s | Duração Máxima: {args.max_duration}s")
    
    # Cria os diretórios de trabalho necessários se eles não existirem.
    os.makedirs(config.TEMP_RECORDS_PATH, exist_ok=True)
    os.makedirs(config.TEMP_POSTERS_PATH, exist_ok=True)
    
    # Conjunto para manter o estado dos modelos que estão a ser gravados.
    # Isto evita iniciar múltiplas gravações para o mesmo streamer.
    currently_recording = set()

    # Loop principal que executa indefinidamente para monitorizar novos streams.
    while True:
        try:
            logger.info(f"📡 A procurar modelos online (Página: {args.page}, Limite: {args.limit})...")
            online_models = get_online_models(page=args.page, limit=args.limit, country=args.country)

            if not online_models:
                logger.info("💤 Nenhum modelo online encontrado nesta verificação.")
            else:
                logger.info(f"🟢 Encontrados {len(online_models)} modelos online. A verificar tarefas...")
                
                # Usa um ThreadPoolExecutor para gerir as gravações paralelas.
                with ThreadPoolExecutor(max_workers=args.workers) as executor:
                    for model in online_models:
                        username = model.get("username")
                        # Inicia uma nova gravação apenas se o modelo tiver um username e não estiver já a ser gravado.
                        if username and username not in currently_recording:
                            currently_recording.add(username)
                            logger.info(f"➕ Adicionando {username} à fila de gravação.")
                            # Submete a tarefa ao executor.
                            executor.submit(process_broadcast_worker, model, args.min_duration, args.max_duration, currently_recording)
        
        except Exception as e:
            logger.critical(f"🔥 Erro crítico no loop principal: {e}", exc_info=True)

        # Aguarda o intervalo definido antes da próxima verificação.
        check_interval = config.DEFAULT_EXECUTION_SETTINGS['CHECK_INTERVAL_SECONDS']
        logger.info(f"⏳ A aguardar {check_interval} segundos para a próxima verificação.")
        time.sleep(check_interval)

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

if __name__ == "__main__":
    # Configura o parser para aceitar argumentos da linha de comando.
    parser = argparse.ArgumentParser(description="XCam REC - Gravador Modular de Transmissões.", formatter_class=argparse.RawTextHelpFormatter)
    
    # Define os argumentos que o script pode receber.
    parser.add_argument('--page', type=int, help='Número da página da API a ser consultada.')
    parser.add_argument('--limit', type=int, help='Número máximo de transmissões por página.')
    parser.add_argument('--workers', type=int, help='Número de gravações paralelas (threads).')
    parser.add_argument('--max-duration', type=int, help='Duração máxima de cada gravação em segundos.')
    parser.add_argument('--min-duration', type=int, help='Duração mínima para que uma gravação seja mantida.')
    parser.add_argument('--country', type=str, help='Filtra por código de país (ex: br, us).')
    
    # Analisa os argumentos fornecidos na linha de comando.
    args = parser.parse_args()
    
    # Chama a função principal com os argumentos.
    main(args)

# @log de mudanças:
# 2025-07-14 (v1.6.0):
# - CORREÇÃO: Corrigido o `ImportError` final ao alinhar todas as chamadas de função e importações.
# - REFACTOR: Substituída a classe `RecordingManager` por um `set` local para gestão de estado,
#   simplificando a lógica e alinhando-se com a filosofia pragmática do XCam.
# - REFACTOR: A função de worker agora aceita o `set` de estado para garantir que os modelos
#   sejam removidos da lista de gravação ativa após a conclusão.
# - DOCS: Comentários atualizados para refletir a nova arquitetura de estado e o fluxo final.
#
# 2025-07-14 (v1.5.0):
# - Versão anterior com desalinhamento de importações e gestão de estado.

# @roadmap futuro:
# - Implementar um mecanismo de "graceful shutdown" para que, ao receber um sinal de interrupção (Ctrl+C),
#   o script aguarde a conclusão das gravações atuais antes de terminar.
# - Adicionar uma verificação de espaço em disco disponível antes de iniciar novas gravações.
