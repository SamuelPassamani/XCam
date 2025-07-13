# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         rec_manager.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.0.0
# @lastupdate:     2025-07-13
# @description:    Este módulo é responsável por gerenciar os arquivos de metadados `rec.json`.
#                  Ele lida com a criação (a partir de um template) e a atualização desses
#                  arquivos, construindo e inserindo novos registros de vídeo com todos os
#                  campos formatados corretamente, garantindo a integridade do nosso "Git-as-a-Database".
# @modes:          - Gerenciador de arquivos JSON.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# Importações de bibliotecas necessárias.
import json         # Para manipulação de dados no formato JSON.
import os           # Para interações com o sistema de arquivos (caminhos, diretórios).
from datetime import datetime # Para obter a data e hora atuais.
import pytz         # Para trabalhar com fusos horários específicos (neste caso, 'America/Sao_Paulo').

# Importa a instância do nosso logger customizado.
from utils.logger import log

# Define os caminhos base para o diretório do banco de dados e para o template.
# Centralizar isso facilita a manutenção caso a estrutura de pastas mude.
DB_PATH = "xcam-db/user/"
TEMPLATE_PATH = "templates/rec.json"

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def _format_duration(seconds: int) -> str:
    """
    Função auxiliar interna para converter uma duração em segundos para um formato legível (ex: 1h2m3s).

    Args:
        seconds (int): A duração total em segundos.

    Returns:
        str: A string formatada.
    """
    # Calcula horas, minutos e segundos a partir do total de segundos.
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    # Constrói a string de duração, omitindo partes que são zero.
    parts = []
    if hours > 0:
        parts.append(f"{int(hours)}h")
    if minutes > 0:
        parts.append(f"{int(minutes)}m")
    if seconds > 0 or not parts: # Mostra segundos se for a única unidade ou se a duração for 0.
        parts.append(f"{int(seconds)}s")
        
    return "".join(parts)

def create_or_update_rec_json(username: str, video_id: str, upload_url: str, poster_url: str, duration_seconds: int):
    """
    Cria ou atualiza o arquivo rec.json para um usuário, adicionando um novo registro de vídeo.

    Args:
        username (str): O nome de usuário do streamer.
        video_id (str): O ID único do vídeo (geralmente a parte final da URL de upload).
        upload_url (str): A URL completa para o vídeo (ex: https://short.icu/...).
        poster_url (str): A URL completa para a imagem do poster.
        duration_seconds (int): A duração da gravação em segundos.
    """
    # Define o caminho completo para o diretório e o arquivo do usuário.
    user_dir = os.path.join(DB_PATH, username)
    user_rec_path = os.path.join(user_dir, "rec.json")

    # Garante que o diretório do usuário exista.
    os.makedirs(user_dir, exist_ok=True)

    # Tenta carregar o arquivo rec.json existente.
    try:
        if os.path.exists(user_rec_path):
            with open(user_rec_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            log.info(f"Arquivo rec.json existente para '{username}' carregado.")
        else:
            # Se não existir, clona a estrutura a partir do nosso template.
            with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            # Define o nome de usuário no novo arquivo.
            data["username"] = username
            log.info(f"Nenhum rec.json encontrado para '{username}'. Criando um novo a partir do template.")
    except (json.JSONDecodeError, IOError) as e:
        log.error(f"Não foi possível ler o arquivo rec.json ou o template para '{username}': {e}")
        return # Aborta a função se não for possível ler os arquivos.

    # --- Construção do novo registro de vídeo ---
    
    # Obtém a data e hora atuais no fuso horário de São Paulo.
    now_sp = datetime.now(pytz.timezone('America/Sao_Paulo'))
    
    # Formata os componentes de data, hora e duração.
    formatted_date = now_sp.strftime('%d-%m-%Y')
    formatted_time = now_sp.strftime('%H-%M')
    formatted_duration = _format_duration(duration_seconds)

    # Constrói os campos `title` e `file`.
    title = f"{username}_{formatted_date}_{formatted_time}_{formatted_duration}"
    file_name = f"{title}.mp4"
    
    # Constrói a URL do iframe com o thumbnail.
    iframe_url = f"{upload_url}?thumbnail={poster_url}"
    
    # Cria o dicionário completo para o novo registro de vídeo.
    new_video_record = {
        "video": video_id,
        "title": title,
        "file": file_name,
        "url": upload_url,
        "poster": poster_url,
        "urlIframe": iframe_url,
        "data": formatted_date,
        "horario": formatted_time,
        "tempo": formatted_duration
    }

    # Adiciona o novo registro ao início da lista de vídeos (para que os mais recentes apareçam primeiro).
    data["videos"].insert(0, new_video_record)
    # Atualiza a contagem total de registros.
    data["records"] = len(data["videos"])

    # Tenta salvar o arquivo JSON atualizado.
    try:
        # Abre o arquivo em modo de escrita ('w').
        with open(user_rec_path, 'w', encoding='utf-8') as f:
            # `json.dump` escreve o dicionário no arquivo.
            # `indent=2` formata o JSON de forma legível, com 2 espaços de indentação.
            json.dump(data, f, indent=2, ensure_ascii=False)
        log.info(f"💾 Arquivo rec.json para '{username}' atualizado com sucesso. Total de {data['records']} registros.")
    except IOError as e:
        log.error(f"Falha ao salvar o arquivo rec.json para '{username}': {e}")

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-13 (v1.0.0):
# - Criação inicial do módulo `rec_manager.py`.
# - Implementada a função `create_or_update_rec_json` para ler, modificar e salvar os metadados.
# - Adicionado o uso de `templates/rec.json` para criar arquivos para novos usuários.
# - Implementada a lógica de construção de todos os campos do registro de vídeo, conforme o notebook.
# - Adicionada a função auxiliar `_format_duration` para formatar o tempo de gravação.
# - Integração completa com o logger customizado.

# @roadmap futuro:
# - Adicionar uma função de "limpeza" que possa remover registros antigos ou inválidos.
# - Implementar um mecanismo de backup (ex: `rec.json.bak`) antes de salvar para evitar corrupção de dados.
# - Criar uma classe `RecManager` se a necessidade de mais funções de gerenciamento (deletar, buscar) surgir.
