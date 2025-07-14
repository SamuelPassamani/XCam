# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         xcam_api.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.6.0
# @lastupdate:     2025-07-14
# @description:    Este módulo serve como um cliente dedicado para a API do XCam. Ele encapsula
#                  toda a lógica de comunicação, incluindo a busca de modelos online e a busca
#                  de informações de stream de um utilizador específico (lógica de fallback).
#                  Utiliza um logger modular para registo de eventos.
# @modes:          - Cliente de API RESTful.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# --- Importações de Bibliotecas Padrão ---
import requests                     # Biblioteca padrão para realizar requisições HTTP em Python.
import logging                      # Biblioteca padrão para logging.
import json                         # Para o caso de a resposta da API não ser um JSON válido.
from typing import Dict, Any, List, Optional # Tipos para anotações, melhorando a clareza do código.

# --- Importações de Módulos do Projeto ---
from config import API_BASE_URL     # Importa a URL base do nosso arquivo de configuração central.

# --- Variáveis Globais ---
# CORREÇÃO: Inicializa um logger específico para este módulo, seguindo o padrão correto.
logger = logging.getLogger(__name__)

# Define o tempo máximo em segundos que uma requisição irá esperar por uma resposta da API.
REQUEST_TIMEOUT = 15

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def get_online_models(page: int = 1, limit: int = 1000, country: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Busca uma lista paginada de modelos online da API XCam.

    Args:
        page (int, optional): O número da página a ser consultada. Padrão é 1.
        limit (int, optional): O número de resultados por página. Padrão é 1000.
        country (Optional[str], optional): Código do país (ex: 'br', 'us'). Padrão é None (todos).

    Returns:
        List[Dict[str, Any]]: Uma lista de dicionários, cada um representando um modelo online.
                              Retorna uma lista vazia em caso de erro.
    """
    # O endpoint para a lista de modelos online.
    endpoint = "/"
    # Constrói o dicionário de parâmetros para a requisição.
    params = {'page': page, 'limit': limit}
    # Adiciona o país aos parâmetros apenas se for fornecido.
    if country:
        params['country'] = country
    
    # Constrói a URL completa para a requisição.
    url = f"{API_BASE_URL}{endpoint}"
    logger.info(f"📡 Buscando lista de modelos em: {url} com parâmetros: {params}")

    try:
        # Realiza a requisição HTTP GET.
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        # Levanta uma exceção para códigos de erro (4xx ou 5xx).
        response.raise_for_status()
        # Converte a resposta JSON em um dicionário Python.
        data = response.json()

        # Valida a estrutura da resposta e extrai a lista de modelos.
        if data and isinstance(data.get("broadcasts"), dict) and isinstance(data["broadcasts"].get("items"), list):
            models = data["broadcasts"]["items"]
            logger.info(f"✅ {len(models)} modelos encontrados.")
            return models
        else:
            logger.warning(f"⚠️ Formato de resposta inesperado ou lista de modelos vazia em {url}")
            return []

    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Erro de rede/HTTP ao buscar modelos online: {e}")
        return []
    except json.JSONDecodeError:
        logger.error(f"❌ Falha ao decodificar a resposta JSON da URL: {url}")
        return []
    except Exception as e:
        logger.error(f"❌ Erro inesperado ao buscar modelos online: {e}", exc_info=True)
        return []

def get_user_live_info(username: str) -> Optional[Dict[str, Any]]:
    """
    FEATURE: Busca informações detalhadas do stream de um utilizador específico.
    Esta função serve como fallback para quando a URL do stream não vem na lista principal.

    Args:
        username (str): O nome do utilizador para o qual buscar as informações.

    Returns:
        Optional[Dict[str, Any]]: Um dicionário com os detalhes do stream, ou None se falhar.
    """
    # Constrói o endpoint dinâmico para o utilizador específico.
    endpoint = f"/user/{username}/liveInfo"
    # Constrói a URL completa para a requisição.
    url = f"{API_BASE_URL}{endpoint}"
    logger.info(f"📡 Buscando URL de fallback para '{username}' em: {url}")

    try:
        # Realiza a requisição HTTP GET.
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        # Levanta uma exceção para códigos de erro.
        response.raise_for_status()
        # Retorna os dados do stream se a requisição for bem-sucedida.
        live_info = response.json()
        logger.info(f"✅ Informações de stream encontradas para '{username}'.")
        return live_info

    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Erro de rede/HTTP ao buscar live info para '{username}': {e}")
        return None
    except json.JSONDecodeError:
        logger.error(f"❌ Falha ao decodificar a resposta JSON para live info de '{username}' em: {url}")
        return None
    except Exception as e:
        logger.error(f"❌ Erro inesperado ao buscar live info para '{username}': {e}", exc_info=True)
        return None

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-14 (v1.6.0):
# - FEATURE: Adicionada a nova função `get_user_live_info(username)` para buscar a URL do stream
#   num endpoint secundário, implementando a lógica de fallback.
# - CORREÇÃO: Removida a importação `from utils.logger import log` e padronizado o uso do logger
#   com `import logging; logger = logging.getLogger(__name__)`, resolvendo o `ImportError`.
# - DOCS: Atualização completa dos comentários e da estrutura do arquivo para o padrão XCam.
#
# 2025-07-14 (v1.5.0):
# - CORREÇÃO CRÍTICA: O endpoint da API foi corrigido de "/v1/online" para "/".
#
# 2025-07-14 (v1.4.0):
# - REFACTOR: Padronizado o uso do logger e renomeada a função principal.

# @roadmap futuro:
# - Implementar um modelo de classes (ex: `XCamAPIClient`) para organizar melhor as chamadas se a API crescer.
# - Adicionar caching (com TTL) para requisições, especialmente para `get_user_live_info`.
# - Criar modelos de dados (ex: com Pydantic) para validar as respostas da API de forma mais robusta.
