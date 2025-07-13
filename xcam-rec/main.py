# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         main.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.4.0
# @lastupdate:     2025-07-13
# @description:    Este é o script principal e orquestrador do projeto XCam Rec. Ele implementa
#                  a lógica de gravar vídeos, fazer o seu upload para um serviço de alojamento
#                  externo, e guardar os posters gerados de forma persistente no Google Drive,
#                  atualizando os metadados no "Git-as-a-Database".
# @modes:          - Aplicação de Linha de Comando (CLI) para ambiente Google Colab.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

import argparse
import os
import re
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any

# Importa as configurações centrais do projeto
from config import TEMP_RECORDS_PATH, TEMP_POSTERS_PATH, DRIVE_PERSISTENT_USER_PATH

# Importa todas as nossas funções modulares
from utils.logger import log
from utils.xcam_api import get_online_broadcasts
from utils.ffmpeg_recorder import record_stream, capture_thumbnail
# CORREÇÃO: Importa a função renomeada 'upload_video'
from utils.abyss_upload import upload_video
from utils.rec_manager import create_or_update_rec_json

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def _sanitize_filename(name: str) -> str:
    """Remove caracteres inválidos de uma string para usá-la como nome de ficheiro."""
    return re.sub(r'[^\w\-. ]', '', name)

def mount_google_drive():
    """Monta o Google Drive no ambiente Colab."""
    try:
        from google.colab import drive
        log.info("🛰️  Montando o Google Drive em /content/drive...")
        drive.mount('/content/drive', force_remount=True)
        log.info("✅ Google Drive montado com sucesso.")
    except Exception as e:
        log.warning(f"⚠️  Não foi possível montar o Google Drive: {e}. O script continuará usando o armazenamento local.")

def setup_directories():
    """Cria os diretórios de trabalho necessários."""
    log.info("Verificando e criando diretórios de trabalho...")
    try:
        for path in [TEMP_RECORDS_PATH, TEMP_POSTERS_PATH, DRIVE_PERSISTENT_USER_PATH]:
            os.makedirs(path, exist_ok=True)
        log.info("✅ Diretórios de trabalho prontos.")
    except Exception as e:
        log.critical(f"🔥 Falha ao criar os diretórios de trabalho: {e}")
        exit()

def process_broadcast(broadcast: Dict[str, Any], record_duration: int):
    """Função de worker que processa uma única transmissão, implementando a nova lógica de ficheiros."""
    username = broadcast.get("username")
    stream_url = broadcast.get("preview", {}).get("src")

    if not all([username, stream_url]):
        log.warning(f"Transmissão com dados incompletos, pulando: {broadcast.get('id')}")
        return

    log.info(f"▶️  Iniciando processamento para o streamer: {username}")
    safe_filename_base = _sanitize_filename(username)
    temp_video_path = os.path.join(TEMP_RECORDS_PATH, f"{safe_filename_base}.mp4")
    temp_poster_path = os.path.join(TEMP_POSTERS_PATH, f"{safe_filename_base}.jpg")

    try:
        # Etapa 1: Gravar a Stream para um ficheiro de vídeo temporário.
        if not record_stream(stream_url, temp_video_path, duration=record_duration):
            return # A função record_stream já loga o erro.

        # Etapa 2: Fazer o Upload do Vídeo para obter o slug (ID).
        # CORREÇÃO: Chama a função 'upload_video' que agora retorna um dicionário.
        upload_response = upload_video(temp_video_path)
        # CORREÇÃO: Verifica se a resposta do upload não é None antes de continuar.
        if not upload_response:
            log.error(f"❌ Falha no upload do vídeo para {username}. Abortando esta tarefa.")
            return
        
        # Extrai os dados da resposta do upload.
        video_slug = upload_response.get("id")
        final_video_url = upload_response.get("url")

        # Verifica se obtivemos um slug válido.
        if not video_slug:
            log.error(f"❌ Não foi possível obter o 'slug' do vídeo para {username} após o upload. Abortando.")
            return

        # Etapa 3: Gerir o Poster.
        final_poster_public_url = ""
        if capture_thumbnail(temp_video_path, temp_poster_path):
            # Define o caminho final e persistente para o poster no Drive.
            user_poster_dir = os.path.join(DRIVE_PERSISTENT_USER_PATH, username)
            os.makedirs(user_poster_dir, exist_ok=True) # Garante que a pasta do utilizador existe.
            final_poster_path = os.path.join(user_poster_dir, f"{video_slug}.jpg")
            
            # Move o poster temporário para o seu local final, renomeando-o com o slug.
            shutil.move(temp_poster_path, final_poster_path)
            log.info(f"🖼️  Poster movido para o destino final: {final_poster_path}")
            
            # Constrói a URL pública para o poster, que será usada no rec.json.
            final_poster_public_url = f"https://db.xcam.gay/user/{username}/{video_slug}.jpg"
        else:
            log.warning(f"⚠️  Não foi possível capturar o poster para {username}.")

        # Etapa 4: Atualizar o ficheiro de Metadados.
        create_or_update_rec_json(
            username=username, video_id=video_slug,
            upload_url=final_video_url, poster_url=final_poster_public_url,
            duration_seconds=record_duration
        )
        log.info(f"✅ Processo para {username} concluído com sucesso.")

    finally:
        # Etapa 5: Limpeza segura dos ficheiros temporários.
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        if os.path.exists(temp_poster_path): # Caso o poster não tenha sido movido por alguma falha.
            os.remove(temp_poster_path)
        log.info(f"🧹 Arquivos temporários para {username} foram limpos.")


def main(args: argparse.Namespace):
    """Função principal que orquestra a busca e o processamento."""
    log.info("🚀 Iniciando o XCam REC Engine...")
    mount_google_drive()
    setup_directories()

    all_broadcasts = []
    for page_num in range(1, args.page + 1):
        broadcasts = get_online_broadcasts(page=page_num, limit=args.limit, country=args.country)
        if not broadcasts:
            break
        all_broadcasts.extend(broadcasts)

    if not all_broadcasts:
        log.info("Nenhuma transmissão online encontrada. Encerrando.")
        return

    log.info(f"Total de {len(all_broadcasts)} transmissões. Iniciando processamento com {args.workers} workers.")

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        future_to_broadcast = {executor.submit(process_broadcast, broadcast, args.duration): broadcast for broadcast in all_broadcasts}
        for future in as_completed(future_to_broadcast):
            broadcast = future_to_broadcast[future]
            try:
                future.result()
            except Exception as exc:
                log.critical(f"O processamento para '{broadcast.get('username')}' gerou uma exceção: {exc}")

    log.info("🏁 XCam REC Engine concluiu a execução de todas as tarefas.")


# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="XCam REC - Gravador Modular de Transmissões.", formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('--page', type=int, default=1, help='Número máx. de páginas da API. (Padrão: 1)')
    parser.add_argument('--limit', type=int, default=50, help='Transmissões por página. (Padrão: 50)')
    parser.add_argument('--workers', type=int, default=5, help='Gravações paralelas. (Padrão: 5)')
    parser.add_argument('--duration', type=int, default=120, help='Duração da gravação em segundos. (Padrão: 120)')
    parser.add_argument('--country', type=str, default=None, help='Filtra por país (ex: br, us). (Padrão: Nenhum)')
    args = parser.parse_args()
    main(args)

# @log de mudanças:
# 2025-07-13 (v1.4.0):
# - CORREÇÃO: A função `process_broadcast` foi ajustada para lidar com a resposta em dicionário
#   da função `upload_video`, resolvendo o erro "'NoneType' object has no attribute 'get'".
# - REFINAMENTO: Alterado o fluxo de trabalho dos posters para serem movidos para o Drive.
#
# 2025-07-13 (v1.3.0):
# - CORREÇÃO: Adicionada a função `_sanitize_filename` para limpar nomes de ficheiro.
