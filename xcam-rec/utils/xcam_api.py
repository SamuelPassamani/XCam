# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         xcam_api.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.3.0
# @lastupdate:     2025-07-13
# @description:    Este módulo serve como um cliente dedicado para a API do XCam. Ele encapsula
#                  toda a lógica de comunicação, incluindo a construção de URLs, tratamento
#                  de erros e parsing de respostas. Fornece funções para buscar listas de
#                  transmissões (com filtros) e obter informações detalhadas de usuários.
# @modes:          - Cliente de API RESTful.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# Importações de bibliotecas necessárias.
import requests  # Biblioteca padrão de fato para realizar requisições HTTP em Python.
from typing import Dict, Any, List, Optional # Tipos para anotações, melhorando a clareza do código.

# Importa a instância do nosso logger customizado para manter a consistência dos logs.
from utils.logger import log
# Importa a URL base do nosso arquivo de configuração central.
from config import API_BASE_URL

# Tempo máximo em segundos que uma requisição irá esperar por uma resposta da API.
REQUEST_TIMEOUT = 15

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def get_online_broadcasts(page: int = 1, limit: int = 30, country: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Busca uma lista paginada de transmissões online, com filtro opcional por país.

    Args:
        page (int, optional): O número da página. Padrão é 1.
        limit (int, optional): O número de resultados por página. Padrão é 30.
        country (Optional[str], optional): Código do país de duas letras (ex: 'br', 'us'). Defaults to None.

    Returns:
        List[Dict[str, Any]]: Uma lista de dicionários de transmissões. Retorna lista vazia em caso de erro.
    """
    # Constrói o endpoint e o dicionário de parâmetros para a requisição.
    endpoint = "/"
    params = {'page': page, 'limit': limit}
    if country:
        params['country'] = country
    
    # Constrói a URL completa.
    url = f"{API_BASE_URL}{endpoint}"
    log.info(f"Realizando requisição para: {url} com parâmetros: {params}")

    try:
        # Realiza a requisição HTTP GET para a URL construída.
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        # Levanta uma exceção para respostas com status de erro (ex: 404, 500).
        response.raise_for_status()
        # Converte a resposta JSON em um dicionário Python.
        data = response.json()

        # CORREÇÃO: Acessa o dicionário "broadcasts" e, dentro dele, a lista "items".
        if data and isinstance(data.get("broadcasts"), dict):
            broadcasts = data.get("broadcasts", {}).get("items", [])
            log.info(f"✅ {len(broadcasts)} transmissões encontradas para os parâmetros: {params}.")
            return broadcasts
        else:
            log.warning(f"Formato de resposta inesperado para os parâmetros: {params}")
            return []

    except requests.exceptions.RequestException as e:
        log.error(f"Erro de rede ou HTTP ao contatar a API do XCam: {e}")
        return []
    except Exception as e:
        log.error(f"Ocorreu um erro inesperado ao processar a resposta da API: {e}")
        return []

def get_user_stream_info(username: str) -> Optional[Dict[str, Any]]:
    """
    Retorna um agregado de informações sobre a transmissão de um usuário específico.

    Args:
        username (str): O nome do usuário a ser buscado.

    Returns:
        Optional[Dict[str, Any]]: Um dicionário com os dados da stream ou None em caso de erro.
    """
    # Constrói o endpoint e os parâmetros.
    endpoint = "/"
    params = {'stream': username}
    url = f"{API_BASE_URL}{endpoint}"
    log.info(f"Buscando informações de stream agregadas para o usuário: {username}")

    try:
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        log.error(f"Erro de rede ou HTTP ao buscar info de stream para '{username}': {e}")
        return None
    except Exception as e:
        log.error(f"Erro inesperado ao processar info de stream para '{username}': {e}")
        return None

def get_user_live_info(username: str) -> Optional[Dict[str, Any]]:
    """
    Retorna dados específicos da transmissão ao vivo de um usuário, como as URLs de stream.

    Args:
        username (str): O nome do usuário.

    Returns:
        Optional[Dict[str, Any]]: Dicionário com os dados da transmissão ao vivo ou None.
    """
    endpoint = f"/user/{username}/liveInfo"
    url = f"{API_BASE_URL}{endpoint}"
    log.info(f"Buscando informações de live para o usuário: {username}")

    try:
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        log.error(f"Erro de rede ou HTTP ao buscar live info para '{username}': {e}")
        return None
    except Exception as e:
        log.error(f"Erro inesperado ao processar live info para '{username}': {e}")
        return None

def get_user_profile_info(username: str) -> Optional[Dict[str, Any]]:
    """
    Retorna dados do perfil público de um usuário.

    Args:
        username (str): O nome do usuário.

    Returns:
        Optional[Dict[str, Any]]: Dicionário com os dados do perfil ou None.
    """
    endpoint = f"/user/{username}/info"
    url = f"{API_BASE_URL}{endpoint}"
    log.info(f"Buscando informações de perfil para o usuário: {username}")

    try:
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        log.error(f"Erro de rede ou HTTP ao buscar perfil para '{username}': {e}")
        return None
    except Exception as e:
        log.error(f"Erro inesperado ao processar perfil para '{username}': {e}")
        return None

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-13 (v1.3.0):
# - REESCRITA: O código foi reescrito para ser mais explícito e detalhado, removendo a função
#   auxiliar `_make_request` para alinhar com a preferência por clareza e comentários em cada função.
# - CORREÇÃO: A função `get_online_broadcasts` foi ajustada para extrair a lista de transmissões
#   do caminho correto no JSON da resposta (`data['broadcasts']['items']`).
#
# 2025-07-12 (v1.1.0):
# - CORREÇÃO CRÍTICA: `API_BASE_URL` atualizada.
# - FEATURE: Adicionadas funções para novos endpoints.
#
# @roadmap futuro:
# - Implementar um modelo de classes (ex: `XCamAPIClient`) para organizar melhor as chamadas se a API crescer.
# - Adicionar caching (com TTL) para requisições que não mudam com frequência (ex: info de perfil).
# - Criar modelos de dados (ex: com Pydantic) para validar as respostas da API e fornecer autocompletar.
