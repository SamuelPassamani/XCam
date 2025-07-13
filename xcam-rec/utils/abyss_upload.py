# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------------------
# 1. CABEÇALHO / INÍCIO
# ---------------------------------------------------------------------------------------------

# @titulo:         abyss_upload.py
# @author:         Samuel Passamani / Um Projeto do Estudio A.Sério [AllS Company]
# @info:           https://aserio.work/
# @version:        1.3.0
# @lastupdate:     2025-07-13
# @description:    Este módulo é responsável por fazer o upload de arquivos para o serviço
#                  de alojamento Hydrax/Abyss.to. Ele encapsula a chamada ao comando `curl`
#                  usando a URL de upload correta e autenticada, com tratamento de erros
#                  detalhado e logging integrado.
# @modes:          - Wrapper de subprocesso para `curl`.

# ---------------------------------------------------------------------------------------------
# 2. CONFIGURAÇÕES & VARIÁVEIS GLOBAIS
# ---------------------------------------------------------------------------------------------

# Importações de bibliotecas necessárias.
import os           # Usado para verificar se o arquivo a ser enviado existe.
import subprocess   # Biblioteca para executar comandos externos como o `curl`.
from typing import Optional # Para anotações de tipo.

# Importa a instância do nosso logger customizado.
from utils.logger import log

# URL de upload correta e estática, que já contém a chave da API,
# conforme o notebook de referência `XCam_REC_V3.8.ipynb`.
ABYSS_UPLOAD_URL = "http://up.hydrax.net/0128263f78f0b426d617bb61c2a8ff43"

# ---------------------------------------------------------------------------------------------
# 3. CORPO
# ---------------------------------------------------------------------------------------------

def upload_file(file_path: str) -> Optional[str]:
    """
    Realiza o upload de um arquivo para o serviço de alojamento usando curl.

    Args:
        file_path (str): O caminho completo para o arquivo que será enviado.

    Returns:
        Optional[str]: A URL do arquivo em caso de sucesso, ou None em caso de falha.
    """
    # 1. Verificação Prévia: Garante que o arquivo a ser enviado realmente existe.
    if not os.path.exists(file_path):
        log.error(f"Arquivo para upload não encontrado: {file_path}")
        return None

    # 2. Construção do Comando:
    # O comando `curl` é montado com o caminho do arquivo e a URL de upload estática.
    command = [
        'curl',
        '-F', f'file=@{file_path}',
        ABYSS_UPLOAD_URL
    ]

    log.info(f"☁️  Iniciando upload de '{os.path.basename(file_path)}'...")

    try:
        # 3. Execução do Subprocesso:
        process = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )

        # 4. Processamento do Resultado:
        # A resposta da API é uma string JSON, então precisamos de a processar.
        # Exemplo de resposta: {"status":true,"id":"c3VOKe9RL","url":"https://short.icu/c3VOKe9RL"}
        response_json = process.stdout.strip()
        
        # Tenta fazer o parse da resposta JSON.
        try:
            response_data = json.loads(response_json)
            # Verifica se o upload foi bem-sucedido e se a URL está presente.
            if response_data.get("status") is True and "url" in response_data:
                upload_url = response_data["url"]
                log.info(f"✅ Upload concluído com sucesso. URL: {upload_url}")
                return upload_url
            else:
                # Se o status for false ou a URL não estiver presente.
                log.error(f"O serviço de upload retornou um erro: {response_json}")
                return None
        except json.JSONDecodeError:
            # Se a resposta não for um JSON válido.
            log.error(f"Resposta inesperada (não-JSON) do serviço de upload: {response_json}")
            return None

    # 5. Tratamento de Erros:
    except FileNotFoundError:
        log.critical("Comando 'curl' não encontrado. O `curl` é necessário para o upload.")
        log.critical("   Por favor, instale-o e garanta que esteja no PATH do sistema.")
        return None
    except subprocess.CalledProcessError as e:
        log.error("O comando `curl` falhou durante o upload.")
        log.error(f"   [Curl Stderr]: {e.stderr.strip()}")
        return None
    except Exception as e:
        log.error(f"Ocorreu uma exceção inesperada durante o upload: {e}")
        return None

# ---------------------------------------------------------------------------------------------
# 4. RODAPÉ / FIM DO CÓDIGO
# ---------------------------------------------------------------------------------------------

# @log de mudanças:
# 2025-07-13 (v1.3.0):
# - CORREÇÃO CRÍTICA FINAL: A constante `ABYSS_UPLOAD_URL` foi corrigida para o valor exato do notebook.
# - CORREÇÃO CRÍTICA: A função `upload_file` foi ajustada para não mais aceitar um `api_token`,
#   pois a autenticação está embutida na URL.
# - MELHORIA: Adicionado o parsing da resposta JSON do serviço de upload para verificar o status e extrair a URL.
#
# 2025-07-13 (v1.2.0):
# - CORREÇÃO CRÍTICA: A constante `ABYSS_API_URL` foi corrigida para "https://up.abyss.to/upload-api.php".
#
# 2025-07-13 (v1.1.0):
# - CORREÇÃO CRÍTICA: A função `upload_file` agora aceita um `api_token` para autenticação.
#
# 2025-07-13 (v1.0.0):
# - Criação inicial do módulo `abyss_upload.py`.

# @roadmap futuro:
# - Adicionar um mecanismo de "retry" para o upload em caso de falhas de rede intermitentes.
# - Implementar o upload usando a biblioteca `requests` em vez de `curl`, para eliminar uma dependência externa.
# - Considerar o uso de variáveis de ambiente para carregar a `ABYSS_UPLOAD_URL` de forma mais segura.
