# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         rec_manager.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.2.0
# @lastupdate:     2025-07-14
# @description:    Este módulo é responsável por gerenciar os arquivos de metadados `rec.json`.
#                  Ele lida com a criação (a partir de um template) e a atualização desses
#                  arquivos, construindo e inserindo novos registros de vídeo com todos os
#                  campos formatados corretamente, garantindo a integridade do "Git-as-a-Database".
# @modes:          - Gestão de Ficheiros JSON.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# --- Importações de Bibliotecas Padrão ---
import json         # Para manipulação de dados no formato JSON.
import os           # Para interações com o sistema de arquivos (caminhos, diretórios).
import logging      # Biblioteca padrão para logging, usada para obter uma instância do logger.
from datetime import datetime # Para obter a data e hora atuais.
import pytz         # Para trabalhar com fusos horários específicos (neste caso, 'America/Sao_Paulo').

# --- Importações de Módulos do Projeto ---
from config import DB_PATH # Importa o caminho para o diretório do "banco de dados".

# --- Variáveis Globais ---
# Inicializa um logger específico para este módulo. O nome do logger será 'utils.rec_manager',
# o que permite um controlo granular dos logs a partir do ponto de entrada da aplicação (main.py).
logger = logging.getLogger(__name__)

# Define o caminho para o template a partir do qual novos ficheiros rec.json são criados.
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
        str: A string de duração formatada.
    """
    # Assegura que os segundos sejam um número inteiro para os cálculos.
    seconds = int(seconds)
    # Calcula as horas e o resto da divisão.
    hours, remainder = divmod(seconds, 3600)
    # Calcula os minutos e os segundos a partir do resto.
    minutes, seconds = divmod(remainder, 60)
    
    # Constrói a string de duração de forma inteligente, omitindo partes que são zero.
    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    # Mostra os segundos se for a única unidade ou se a duração for 0s.
    if seconds > 0 or not parts:
        parts.append(f"{seconds}s")
        
    return "".join(parts)

def create_or_update_rec_json(username: str, video_id: str, upload_url: str, poster_url: str, duration_seconds: int):
    """
    Cria ou atualiza o arquivo rec.json para um usuário, adicionando um novo registro de vídeo.

    Args:
        username (str): O nome de usuário do streamer.
        video_id (str): O ID único do vídeo (slug) retornado pelo serviço de upload.
        upload_url (str): A URL completa para o vídeo.
        poster_url (str): A URL completa para a imagem do poster (thumbnail).
        duration_seconds (int): A duração da gravação em segundos.
    """
    # Constrói o caminho completo para o diretório e o arquivo do usuário.
    user_dir = os.path.join(DB_PATH, username)
    user_rec_path = os.path.join(user_dir, "rec.json")

    # Garante que o diretório do usuário exista; se não, cria-o.
    os.makedirs(user_dir, exist_ok=True)

    # Tenta carregar o arquivo rec.json existente ou criar um novo a partir do template.
    try:
        if os.path.exists(user_rec_path):
            # Se o ficheiro existe, abre-o e carrega o seu conteúdo JSON.
            with open(user_rec_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"📖 Arquivo rec.json existente para '{username}' carregado.")
        else:
            # Se não existir, clona a estrutura a partir do nosso template.
            with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            # Define o nome de usuário no novo ficheiro.
            data["username"] = username
            logger.info(f"📄 Nenhum rec.json encontrado para '{username}'. Criando um novo a partir do template.")
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"❌ Não foi possível ler o arquivo rec.json ou o template para '{username}': {e}")
        return # Aborta a função se não for possível ler os arquivos base.

    # --- Construção do novo registro de vídeo ---
    
    # Obtém a data e hora atuais no fuso horário de São Paulo para consistência.
    now_sp = datetime.now(pytz.timezone('America/Sao_Paulo'))
    
    # Formata os componentes de data, hora e duração para a exibição.
    formatted_date = now_sp.strftime('%d-%m-%Y')
    formatted_time = now_sp.strftime('%H:%M') # Formato 24h com minutos.
    formatted_duration = _format_duration(duration_seconds)

    # Constrói os campos `title` e `file` de forma padronizada.
    title = f"{username}_{formatted_date}_{formatted_time}_{formatted_duration}"
    file_name = f"{title}.mp4"
    
    # Constrói a URL do iframe, que combina a URL de upload com o poster como thumbnail.
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
        # Abre o arquivo em modo de escrita ('w'), que sobrescreve o conteúdo anterior.
        with open(user_rec_path, 'w', encoding='utf-8') as f:
            # `json.dump` escreve o dicionário no arquivo.
            # `indent=2` formata o JSON de forma legível.
            # `ensure_ascii=False` permite a escrita de caracteres especiais (ex: acentos).
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"💾 Arquivo rec.json para '{username}' atualizado com sucesso. Total de {data['records']} registros.")
    except IOError as e:
        logger.error(f"❌ Falha ao salvar o arquivo rec.json para '{username}': {e}")

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-14 (v1.2.0):
# - CORREÇÃO: Removida a importação `from utils.logger import log`.
# - REFACTOR: Adotado o padrão `import logging; logger = logging.getLogger(__name__)` para
#   obter uma instância de logger modular, resolvendo o `ImportError`.
# - DOCS: Atualização completa dos comentários e da estrutura do arquivo para o padrão XCam.
#
# 2025-07-13 (v1.1.0):
# - REFINAMENTO: O módulo agora importa a variável `DB_PATH` do arquivo `config.py`.
#
# 2025-07-13 (v1.0.0):
# - Criação inicial do módulo `rec_manager.py`.

# @roadmap futuro:
# - Adicionar uma função de "limpeza" que possa remover registros antigos ou inválidos do rec.json.
# - Implementar um mecanismo de backup (ex: `rec.json.bak`) antes de salvar para evitar corrupção de dados.
# - Criar uma classe `RecManager` se a necessidade de mais funções de gerenciamento (deletar, buscar) surgir.
