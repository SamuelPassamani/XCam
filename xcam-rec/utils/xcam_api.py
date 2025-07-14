# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         xcam_api.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.4.0
# @lastupdate:     2025-07-14
# @description:    Este módulo serve como um cliente dedicado para a API do XCam. Ele encapsula
#                  toda a lógica de comunicação, incluindo a construção de URLs, tratamento
#                  de erros e parsing de respostas, utilizando um logger modular em vez de uma
#                  instância global.
# @modes:          - Cliente de API RESTful.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# --- Importações de Bibliotecas Padrão ---
import requests                     # Biblioteca padrão para realizar requisições HTTP em Python.
import logging                      # Biblioteca padrão para logging, usada para obter uma instância do logger.
from typing import Dict, Any, List, Optional # Tipos para anotações, melhorando a clareza do código.

# --- Importações de Módulos do Projeto ---
from config import API_BASE_URL     # Importa a URL base do nosso arquivo de configuração central.

# --- Variáveis Globais ---
# Inicializa um logger específico para este módulo. O nome do logger será 'utils.xcam_api',
# o que permite um controlo granular dos logs a partir do ponto de entrada da aplicação (main.py).
logger = logging.getLogger(__name__)

# Define o tempo máximo em segundos que uma requisição irá esperar por uma resposta da API.
REQUEST_TIMEOUT = 15

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def get_online_models(page: int = 1, limit: int = 1000, country: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Busca uma lista paginada de modelos online, com filtro opcional por país.

    Args:
        page (int, optional): O número da página a ser consultada. Padrão é 1.
        limit (int, optional): O número de resultados por página. Padrão é 1000.
        country (Optional[str], optional): Código do país (ex: 'br', 'us'). Padrão é None (todos).

    Returns:
        List[Dict[str, Any]]: Uma lista de dicionários, cada um representando um modelo online.
                              Retorna uma lista vazia em caso de erro.
    """
    # Constrói o endpoint e o dicionário de parâmetros para a requisição.
    endpoint = "/"
    params = {'page': page, 'limit': limit}
    if country:
        params['country'] = country
    
    # Constrói a URL completa para a requisição.
    url = f"{API_BASE_URL}{endpoint}"
    logger.info(f"📡 Realizando requisição para: {url} com parâmetros: {params}")

    try:
        # Realiza a requisição HTTP GET para a URL construída.
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        # Levanta uma exceção HTTPError para respostas com códigos de erro (4xx ou 5xx).
        response.raise_for_status()
        # Converte a resposta JSON em um dicionário Python.
        data = response.json()

        # Valida a estrutura da resposta e extrai a lista de modelos.
        # A API retorna um objeto principal que contém uma chave 'online'.
        if data and isinstance(data.get("online"), list):
            models = data["online"]
            logger.info(f"✅ {len(models)} modelos encontrados para os parâmetros: {params}.")
            return models
        else:
            logger.warning(f"⚠️ Formato de resposta inesperado ou lista de modelos vazia para os parâmetros: {params}")
            return []

    except requests.exceptions.RequestException as e:
        # Captura erros de rede, como falha de conexão, timeout ou erro de DNS.
        logger.error(f"❌ Erro de rede ou HTTP ao contatar a API do XCam: {e}")
        return []
    except json.JSONDecodeError:
        # Captura erros que ocorrem se a resposta da API não for um JSON válido.
        logger.error(f"❌ Falha ao decodificar a resposta JSON da URL: {url}")
        return []
    except Exception as e:
        # Captura quaisquer outras exceções inesperadas durante o processo.
        logger.error(f"❌ Ocorreu um erro inesperado ao processar a resposta da API: {e}", exc_info=True)
        return []

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-14 (v1.4.0):
# - CORREÇÃO: Removida a importação `from utils.logger import log`.
# - REFACTOR: Adotado o padrão `import logging; logger = logging.getLogger(__name__)` para
#   obter uma instância de logger modular, resolvendo o `ImportError`.
# - REFACTOR: O nome da função `get_online_broadcasts` foi alterado para `get_online_models` para
#   maior consistência com a resposta da API.
# - DOCS: Atualização completa dos comentários e da estrutura do arquivo para o padrão XCam.
#
# 2025-07-13 (v1.3.0):
# - REESCRITA: Código reescrito para ser mais explícito, removendo a função `_make_request`.
#
# @roadmap futuro:
# - Implementar um modelo de classes (ex: `XCamAPIClient`) para organizar melhor as chamadas se a API crescer.
# - Adicionar caching (com TTL) para requisições que não mudam com frequência.
# - Criar modelos de dados (ex: com Pydantic) para validar as respostas da API.
