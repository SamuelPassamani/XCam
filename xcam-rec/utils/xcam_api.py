# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         xcam_api.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.1.0
# @lastupdate:     2025-07-12
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

# URL base da API do XCam. Centralizar esta constante aqui facilita futuras atualizações.
API_BASE_URL = "https://api.xcam.gay"

# Tempo máximo em segundos que uma requisição irá esperar por uma resposta da API.
REQUEST_TIMEOUT = 15

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def _make_request(endpoint: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """
    Função auxiliar interna para realizar requisições GET à API.
    Centraliza a lógica de requisição e o tratamento de erros.

    Args:
        endpoint (str): O caminho do endpoint a ser chamado (ex: '/user/info').
        params (Optional[Dict[str, Any]], optional): Dicionário de parâmetros de query. Defaults to None.

    Returns:
        Optional[Dict[str, Any]]: Um dicionário com a resposta JSON ou None em caso de erro.
    """
    # Constrói a URL completa.
    url = f"{API_BASE_URL}{endpoint}"
    log.info(f"Realizando requisição para: {url} com parâmetros: {params}")

    try:
        # Realiza a requisição HTTP GET.
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        # Levanta uma exceção para respostas com status de erro (4xx ou 5xx).
        response.raise_for_status()
        # Retorna a resposta em formato JSON.
        return response.json()
    # Captura exceções de rede ou de status HTTP.
    except requests.exceptions.RequestException as e:
        log.error(f"Erro de rede ou HTTP ao contatar a API do XCam: {e}")
        return None
    # Captura outras exceções (ex: JSON malformado).
    except Exception as e:
        log.error(f"Ocorreu um erro inesperado ao processar a resposta da API: {e}")
        return None

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
    # Monta o dicionário de parâmetros dinamicamente.
    params = {'page': page, 'limit': limit}
    if country:
        params['country'] = country
    
    # Usa a função auxiliar para fazer a requisição. O endpoint para broadcast é a raiz com parâmetros.
    data = _make_request("/", params=params)

    # Verifica se a requisição retornou dados e extrai a lista de transmissões.
    if data and isinstance(data.get("broadcasts"), list):
        broadcasts = data.get("broadcasts", [])
        log.info(f"✅ {len(broadcasts)} transmissões encontradas para os parâmetros: {params}.")
        return broadcasts
    
    log.warning(f"Nenhuma transmissão encontrada ou formato de resposta inesperado para os parâmetros: {params}")
    return []

def get_user_stream_info(username: str) -> Optional[Dict[str, Any]]:
    """
    Retorna um agregado de informações sobre a transmissão de um usuário específico.
    Combina dados de /liveInfo, /info e /?poster={username}.

    Args:
        username (str): O nome do usuário a ser buscado.

    Returns:
        Optional[Dict[str, Any]]: Um dicionário contendo 'streamInfo', 'graphData', 'posterInfo' ou None.
    """
    log.info(f"Buscando informações de stream agregadas para o usuário: {username}")
    # O endpoint é a raiz, com o nome do usuário como parâmetro 'stream'.
    return _make_request("/", params={'stream': username})

def get_user_live_info(username: str) -> Optional[Dict[str, Any]]:
    """
    Retorna dados específicos da transmissão ao vivo de um usuário, como as URLs de stream.

    Args:
        username (str): O nome do usuário.

    Returns:
        Optional[Dict[str, Any]]: Dicionário com os dados da transmissão ao vivo ou None.
    """
    log.info(f"Buscando informações de live para o usuário: {username}")
    return _make_request(f"/user/{username}/liveInfo")

def get_user_profile_info(username: str) -> Optional[Dict[str, Any]]:
    """
    Retorna dados do perfil público de um usuário.

    Args:
        username (str): O nome do usuário.

    Returns:
        Optional[Dict[str, Any]]: Dicionário com os dados do perfil ou None.
    """
    log.info(f"Buscando informações de perfil para o usuário: {username}")
    return _make_request(f"/user/{username}/info")

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-12 (v1.1.0):
# - CORREÇÃO: `API_BASE_URL` atualizada para "https://api.xcam.gay".
# - FEATURE: Adicionada a função `get_user_stream_info` para o endpoint `?stream={username}`.
# - FEATURE: Adicionada a função `get_user_live_info` para o endpoint `user/{username}/liveInfo`.
# - FEATURE: Adicionada a função `get_user_profile_info` para o endpoint `user/{username}/info`.
# - MELHORIA: A função `get_online_broadcasts` agora suporta o parâmetro de filtro `country`.
# - REFATORAÇÃO: Criada a função interna `_make_request` para centralizar a lógica de requisição e tratamento de erros.

# @roadmap futuro:
# - Implementar um modelo de classes (ex: `XCamAPIClient`) para organizar melhor as chamadas se a API crescer.
# - Adicionar caching (com TTL) para requisições que não mudam com frequência (ex: info de perfil).
# - Criar modelos de dados (ex: com Pydantic) para validar as respostas da API e fornecer autocompletar.
