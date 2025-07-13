# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         main.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.0.0
# @lastupdate:     2025-07-13
# @description:    Este é o script principal e orquestrador do projeto XCam Rec. Ele é
#                  responsável por buscar a lista de transmissões online, distribuir as
#                  tarefas de gravação e upload para workers paralelos, e garantir que
#                  todo o ciclo de vida de cada gravação seja concluído corretamente.
# @modes:          - Aplicação de Linha de Comando (CLI).

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# Importações de bibliotecas padrão
import argparse
import os
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any

# Importa todas as nossas funções modulares
from utils.logger import log
from utils.xcam_api import get_online_broadcasts
from utils.ffmpeg_recorder import record_stream, capture_thumbnail
from utils.abyss_upload import upload_file
from utils.rec_manager import create_or_update_rec_json

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def process_broadcast(broadcast: Dict[str, Any], record_duration: int):
    """
    Função de worker que processa uma única transmissão.
    Executa a sequência completa: gravar, capturar poster, fazer upload e atualizar metadados.

    Args:
        broadcast (Dict[str, Any]): O dicionário contendo os dados da transmissão.
        record_duration (int): A duração da gravação em segundos.
    """
    # Extrai as informações essenciais da transmissão.
    username = broadcast.get("username")
    stream_url = broadcast.get("hls_url")

    # Validação inicial para garantir que temos os dados mínimos para prosseguir.
    if not all([username, stream_url]):
        log.warning(f"Transmissão com dados incompletos, pulando: {broadcast.get('id')}")
        return

    log.info(f"▶️  Iniciando processamento para o streamer: {username}")

    # Cria um diretório temporário para armazenar os arquivos desta tarefa.
    # O `with` garante que o diretório e seu conteúdo sejam removidos ao final.
    with tempfile.TemporaryDirectory() as temp_dir:
        # Define os caminhos para os arquivos de vídeo e poster temporários.
        video_path = os.path.join(temp_dir, f"{username}.mp4")
        poster_path = os.path.join(temp_dir, f"{username}.jpg")

        # --- Etapa 1: Gravar a Stream ---
        if not record_stream(stream_url, video_path, duration=record_duration):
            log.error(f"❌ Falha ao gravar a stream para {username}. Abortando esta tarefa.")
            return # Interrompe o processamento para este streamer.

        # --- Etapa 2: Capturar o Poster (Thumbnail) ---
        if not capture_thumbnail(video_path, poster_path):
            log.warning(f"⚠️  Não foi possível capturar o poster para {username}. O processo continuará sem ele.")
            # Define o poster_url como vazio para que o rec_manager possa lidar com isso.
            final_poster_url = ""
        else:
            # --- Etapa 3a: Upload do Poster ---
            final_poster_url = upload_file(poster_path)
            if not final_poster_url:
                log.warning(f"⚠️  Falha no upload do poster para {username}. O processo continuará.")
                final_poster_url = ""

        # --- Etapa 3b: Upload do Vídeo ---
        final_video_url = upload_file(video_path)
        if not final_video_url:
            log.error(f"❌ Falha no upload do vídeo para {username}. Abortando esta tarefa.")
            return

        # --- Etapa 4: Atualizar Metadados ---
        # Extrai o ID do vídeo da URL retornada pelo serviço de upload.
        video_id = final_video_url.split('/')[-1]
        create_or_update_rec_json(
            username=username,
            video_id=video_id,
            upload_url=final_video_url,
            poster_url=final_poster_url,
            duration_seconds=record_duration
        )

    log.info(f"✅ Processo para {username} concluído com sucesso.")


def main(args: argparse.Namespace):
    """
    Função principal que orquestra a busca e o processamento paralelo das transmissões.

    Args:
        args (argparse.Namespace): Objeto contendo os argumentos da linha de comando.
    """
    log.info("🚀 Iniciando o XCam REC Engine...")
    all_broadcasts = []

    # Busca as transmissões da API, página por página.
    for page_num in range(1, args.pages + 1):
        log.info(f"Buscando página {page_num} de transmissões...")
        broadcasts = get_online_broadcasts(page=page_num, limit=args.limit, country=args.country)
        if not broadcasts:
            log.info("Não foram encontradas mais transmissões. Finalizando a busca.")
            break
        all_broadcasts.extend(broadcasts)

    # Verifica se alguma transmissão foi encontrada.
    if not all_broadcasts:
        log.info("Nenhuma transmissão online encontrada com os critérios definidos. Encerrando.")
        return

    log.info(f"Total de {len(all_broadcasts)} transmissões encontradas. Iniciando processamento paralelo com {args.workers} workers.")

    # Usa um ThreadPoolExecutor para processar as transmissões em paralelo.
    # Threads são ideais aqui, pois as tarefas são "I/O-bound" (esperam por rede ou disco).
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        # Submete cada tarefa de processamento ao pool de threads.
        future_to_broadcast = {executor.submit(process_broadcast, broadcast, args.duration): broadcast for broadcast in all_broadcasts}

        # Itera sobre os futuros à medida que eles são concluídos.
        for future in as_completed(future_to_broadcast):
            broadcast = future_to_broadcast[future]
            try:
                # `future.result()` não retorna nada, mas levantará uma exceção se a tarefa falhou.
                future.result()
            except Exception as exc:
                # Loga qualquer exceção inesperada que tenha ocorrido dentro de uma thread.
                log.critical(f"O processamento para '{broadcast.get('username')}' gerou uma exceção: {exc}")

    log.info("🏁 XCam REC Engine concluiu a execução de todas as tarefas.")


# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

if __name__ == "__main__":
    # Configura o parser de argumentos da linha de comando.
    # Isso torna o script configurável sem precisar editar o código.
    parser = argparse.ArgumentParser(
        description="XCam REC - Gravador Modular de Transmissões.",
        formatter_class=argparse.RawTextHelpFormatter
    )

    # Define os argumentos que o script pode aceitar.
    parser.add_argument('--pages', type=int, default=2, help='Número máximo de páginas da API para buscar. (Padrão: 2)')
    parser.add_argument('--limit', type=int, default=50, help='Número de transmissões por página. (Padrão: 50)')
    parser.add_argument('--workers', type=int, default=5, help='Número de gravações paralelas. (Padrão: 5)')
    parser.add_argument('--duration', type=int, default=120, help='Duração de cada gravação em segundos. (Padrão: 120)')
    parser.add_argument('--country', type=str, default=None, help='Filtra por código do país (ex: br, us, it). (Padrão: Nenhum)')

    # Faz o parse dos argumentos fornecidos na linha de comando.
    args = parser.parse_args()

    # Chama a função principal com os argumentos.
    main(args)

# @log de mudanças:
# 2025-07-13 (v1.0.0):
# - Criação inicial do orquestrador `main.py`.
# - Implementação da lógica de parsing de argumentos de linha de comando.
# - Criação da função `main` para orquestrar o fluxo.
# - Criação da função `process_broadcast` para o processamento de cada streamer.
# - Integração de todos os módulos `utils` para um fluxo de trabalho completo.
# - Implementação de processamento paralelo com `ThreadPoolExecutor`.

# @roadmap futuro:
# - Adicionar um mecanismo para evitar gravar o mesmo streamer múltiplas vezes na mesma execução.
# - Permitir a passagem de uma lista de usuários específicos para gravar via linha de comando.
# - Criar um modo "daemon" para que o script rode continuamente, verificando por novas streams a cada X minutos.
# - Adicionar um sumário no final da execução (ex: X gravações bem-sucedidas, Y falhas).
