# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         main.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.3.0
# @lastupdate:     2025-07-13
# @description:    Este é o script principal e orquestrador do projeto XCam Rec. Ele é
#                  responsável por montar o Google Drive, buscar a lista de transmissões
#                  online, distribuir as tarefas de gravação e upload para workers paralelos,
#                  e garantir que todo o ciclo de vida de cada gravação seja concluído corretamente.
# @modes:          - Aplicação de Linha de Comando (CLI) para ambiente Google Colab.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

import argparse
import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any

from config import TEMP_RECORDS_PATH, TEMP_POSTERS_PATH
from utils.logger import log
from utils.xcam_api import get_online_broadcasts
from utils.ffmpeg_recorder import record_stream, capture_thumbnail
from utils.abyss_upload import upload_file
from utils.rec_manager import create_or_update_rec_json

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def _sanitize_filename(name: str) -> str:
    """Remove ou substitui caracteres inválidos de uma string para usá-la como nome de ficheiro."""
    return re.sub(r'[^\w\-. ]', '', name)

def mount_google_drive():
    """Monta o Google Drive no ambiente Colab."""
    try:
        from google.colab import drive
        log.info("🛰️  Montando o Google Drive em /content/drive...")
        drive.mount('/content/drive')
        log.info("✅ Google Drive montado com sucesso.")
        return True
    except ImportError:
        log.warning("⚠️  Biblioteca do Google Colab não encontrada. Pulando a montagem do Drive.")
        return False
    except Exception as e:
        log.critical(f"🔥 Falha ao montar o Google Drive: {e}")
        return False

def setup_directories():
    """Cria os diretórios de trabalho necessários."""
    log.info("Verificando e criando diretórios de trabalho...")
    try:
        os.makedirs(TEMP_RECORDS_PATH, exist_ok=True)
        os.makedirs(TEMP_POSTERS_PATH, exist_ok=True)
        log.info("✅ Diretórios de trabalho prontos.")
    except Exception as e:
        log.critical(f"🔥 Falha ao criar os diretórios de trabalho: {e}")
        exit()

def process_broadcast(broadcast: Dict[str, Any], record_duration: int):
    """Função de worker que processa uma única transmissão."""
    username = broadcast.get("username")
    stream_url = broadcast.get("preview", {}).get("src")

    if not all([username, stream_url]):
        log.warning(f"Transmissão com dados incompletos, pulando: {broadcast.get('id')}")
        return

    log.info(f"▶️  Iniciando processamento para o streamer: {username}")
    safe_filename_base = _sanitize_filename(username)
    video_path = os.path.join(TEMP_RECORDS_PATH, f"{safe_filename_base}.mp4")
    poster_path = os.path.join(TEMP_POSTERS_PATH, f"{safe_filename_base}.jpg")

    try:
        # Etapa 1: Gravar a Stream
        if not record_stream(stream_url, video_path, duration=record_duration):
            log.error(f"❌ Falha ao gravar a stream para {username}. Abortando esta tarefa.")
            return

        # Etapa 2 & 3a: Capturar e Fazer Upload do Poster
        final_poster_url = ""
        if capture_thumbnail(video_path, poster_path):
            # Tenta fazer o upload e atribui a URL; se falhar, o 'or' garante que a variável fique vazia.
            final_poster_url = upload_file(poster_path) or ""
            if not final_poster_url:
                log.warning(f"⚠️  Falha no upload do poster para {username}. O processo continuará.")
        else:
            log.warning(f"⚠️  Não foi possível capturar o poster para {username}.")

        # Etapa 3b: Upload do Vídeo
        final_video_url = upload_file(video_path)
        if not final_video_url:
            log.error(f"❌ Falha no upload do vídeo para {username}. Abortando esta tarefa.")
            return

        # Etapa 4: Atualizar Metadados
        video_id = final_video_url.split('/')[-1]
        create_or_update_rec_json(
            username=username, video_id=video_id,
            upload_url=final_video_url, poster_url=final_poster_url,
            duration_seconds=record_duration
        )
        log.info(f"✅ Processo para {username} concluído com sucesso.")

    finally:
        # Etapa 5: Limpeza segura dos arquivos temporários.
        for path in [video_path, poster_path]:
            if os.path.exists(path):
                os.remove(path)
        log.info(f"🧹 Arquivos temporários para {username} foram limpos.")


def main(args: argparse.Namespace):
    """Função principal que orquestra a busca e o processamento."""
    log.info("🚀 Iniciando o XCam REC Engine...")
    
    mount_google_drive()
    setup_directories()

    all_broadcasts = []
    for page_num in range(1, args.page + 1):
        log.info(f"Buscando página {page_num} de transmissões...")
        broadcasts = get_online_broadcasts(page=page_num, limit=args.limit, country=args.country)
        if not broadcasts:
            log.info("Não foram encontradas mais transmissões. Finalizando a busca.")
            break
        all_broadcasts.extend(broadcasts)

    if not all_broadcasts:
        log.info("Nenhuma transmissão online encontrada com os critérios definidos. Encerrando.")
        return

    log.info(f"Total de {len(all_broadcasts)} transmissões encontradas. Iniciando processamento paralelo com {args.workers} workers.")

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
    parser = argparse.ArgumentParser(
        description="XCam REC - Gravador Modular de Transmissões.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument('--page', type=int, default=1, help='Número máx. de páginas da API para buscar. (Padrão: 1)')
    parser.add_argument('--limit', type=int, default=50, help='Número de transmissões por página. (Padrão: 50)')
    parser.add_argument('--workers', type=int, default=5, help='Número de gravações paralelas. (Padrão: 5)')
    parser.add_argument('--duration', type=int, default=420, help='Duração de cada gravação em segundos. (Padrão: 120)')
    parser.add_argument('--country', type=str, default=None, help='Filtra por código do país (ex: br, us, it). (Padrão: Nenhum)')

    args = parser.parse_args()
    main(args)

# @log de mudanças:
# 2025-07-13 (v1.3.0):
# - CORREÇÃO: Adicionada a função `_sanitize_filename` para limpar nomes de ficheiro.
# - REFINAMENTO: Código tornado mais conciso, reduzindo linhas e aninhamento de condicionais.
#
# 2025-07-13 (v1.2.0):
# - CORREÇÃO: A função `process_broadcast` foi ajustada para extrair a URL da stream do
#   caminho correto no JSON (`broadcast['preview']['src']`).
