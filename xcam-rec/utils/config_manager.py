# -*- coding: utf-8 -*-

"""
Módulo de Gerenciamento de Configuração para o XCam-CLI.

Este módulo é responsável por ler o arquivo de configuração 'config/app_config.ini'
e fornecer uma interface simples e segura para que os outros módulos da aplicação
possam acessar os parâmetros definidos.

Ele utiliza a biblioteca padrão 'configparser' do Python e implementa um padrão
singleton, onde uma única instância da classe 'ConfigManager' é criada e exportada
para ser usada em todo o projeto, garantindo que a configuração seja lida apenas uma vez.
"""

import configparser
import os
import logging

# O caminho para o arquivo de configuração é definido de forma relativa à raiz do projeto.
# Isso garante que o script funcione independentemente de onde ele for executado.
CONFIG_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'config', 'app_config.ini')

class ConfigManager:
    """
    Uma classe para ler e gerenciar as configurações do arquivo .ini.
    """
    def __init__(self, path=CONFIG_FILE_PATH):
        """
        Inicializa o gerenciador de configuração.

        Args:
            path (str): O caminho para o arquivo de configuração .ini.
        """
        self.config = configparser.ConfigParser()
        # Verifica se o arquivo de configuração existe antes de tentar lê-lo.
        if not os.path.exists(path):
            # Se o arquivo não existir, loga um erro crítico e levanta uma exceção.
            # Isso impede que a aplicação continue sem suas configurações essenciais.
            logging.critical(f"Arquivo de configuração não encontrado em: {path}")
            raise FileNotFoundError(f"O arquivo de configuração essencial 'app_config.ini' não foi encontrado no caminho esperado: {path}")
        
        self.config.read(path)
        logging.info(f"Configurações carregadas com sucesso de: {path}")

    def get(self, section: str, option: str, fallback: str = None) -> str:
        """
        Obtém um valor de configuração como uma string.

        Args:
            section (str): A seção no arquivo .ini (ex: [settings]).
            option (str): A chave da opção dentro da seção.
            fallback (str, optional): Um valor padrão para retornar se a opção não for encontrada.

        Returns:
            str: O valor da configuração.
        """
        return self.config.get(section, option, fallback=fallback)

    def getint(self, section: str, option: str, fallback: int = 0) -> int:
        """
        Obtém um valor de configuração como um inteiro.

        Args:
            section (str): A seção no arquivo .ini.
            option (str): A chave da opção.
            fallback (int, optional): Um valor padrão para retornar.

        Returns:
            int: O valor da configuração como inteiro.
        """
        try:
            return self.config.getint(section, option)
        except (configparser.NoOptionError, configparser.NoSectionError, ValueError):
            logging.warning(
                f"Opção '{option}' na seção '{section}' não encontrada ou inválida. "
                f"Usando valor padrão: {fallback}"
            )
            return fallback

    def getboolean(self, section: str, option: str, fallback: bool = False) -> bool:
        """
        Obtém um valor de configuração como um booleano.

        Args:
            section (str): A seção no arquivo .ini.
            option (str): A chave da opção.
            fallback (bool, optional): Um valor padrão para retornar.

        Returns:
            bool: O valor da configuração como booleano.
        """
        try:
            return self.config.getboolean(section, option)
        except (configparser.NoOptionError, configparser.NoSectionError, ValueError):
            logging.warning(
                f"Opção '{option}' na seção '{section}' não encontrada ou inválida. "
                f"Usando valor padrão: {fallback}"
            )
            return fallback

# --- Instância Singleton ---
# A instância do ConfigManager é criada aqui, uma única vez.
# Outros módulos devem importar esta instância 'config' para acessar as configurações.
# Exemplo de uso em outro arquivo:
# from utils.config_manager import config
#
# log_path = config.get('paths', 'log_path')
# timeout = config.getint('blacklist', 'timeout_seconds')

try:
    config = ConfigManager()
except FileNotFoundError as e:
    # Se a inicialização falhar, a variável 'config' será None.
    # A aplicação deve ser robusta o suficiente para lidar com isso,
    # geralmente encerrando a execução no 'main.py' se a configuração for essencial.
    config = None
    logging.error("Falha ao criar a instância do gerenciador de configuração.")

