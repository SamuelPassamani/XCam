<p align="center">
  <img src="https://xcam.gay/src/logo.svg" alt="Logotipo XCam" width="300"/>
</p>

# 📦 XCam v3.0 – Plataforma Modular para Transmissões ao Vivo

Bem-vindo ao repositório oficial do **XCam**, uma plataforma modular e escalável para agregar e exibir transmissões de vídeo ao vivo. Este projeto foi concebido com uma arquitetura de micro-serviços e micro-frontends, garantindo flexibilidade, manutenção simplificada e alta performance.

---

## 🏛️ Arquitetura do Projeto

O XCam utiliza uma abordagem descentralizada, onde cada funcionalidade principal é encapsulada em seu próprio módulo (diretório `xcam-*`). Esses módulos interagem entre si através de APIs e URLs bem definidas, operando de forma independente.

A arquitetura geral é composta por:

-   **Frontend Applications (`xcam-app`, `xcam-beta`):** Interfaces web que consomem os dados da `xcam-api` para exibir as transmissões aos usuários.
-   **API Central (`xcam-api`):** Um Cloudflare Worker que atua como um proxy inteligente, agregando dados de fontes externas, aplicando filtros e servindo um endpoint unificado e seguro para os frontends.
-   **Módulos de Conteúdo (`xcam-player`, `xcam-modal`):** Componentes de UI independentes, geralmente carregados via `iframe`, responsáveis por funcionalidades específicas como a reprodução de vídeo e a exibição de detalhes da transmissão.
-   **Sistema de Gravação (`xcam-rec`):** Um módulo backend em Python responsável por gravar, processar e fazer o upload das transmissões ao vivo.
-   **Infraestrutura de Suporte (`xcam-drive`, `xcam-redirects`):** Serviços de apoio, como uma CDN para arquivos estáticos e gerenciamento de redirecionamentos.

---

## 🧩 Descrição dos Módulos

Cada diretório `xcam-*` representa um módulo com uma responsabilidade única:

| Módulo | Descrição | Tecnologias Principais |
| :--- | :--- | :--- |
| **`xcam-api`** | **API Central:** Cloudflare Worker que serve como o coração do sistema, buscando, filtrando e servindo dados das transmissões. Gerencia CORS, cache e múltiplos endpoints (JSON, CSV, imagens, etc.). | `JavaScript (Cloudflare Worker)` |
| **`xcam-app`** | **Aplicação Principal:** Frontend legado que exibe a grade de transmissões, filtros e o carrossel de destaques. | `HTML`, `CSS`, `JavaScript` |
| **`xcam-beta`** | **Aplicação Moderna:** A versão mais recente do frontend, construída com uma arquitetura de Módulos ES, promovendo melhor organização e performance. | `HTML`, `CSS`, `JavaScript (ESM)` |
| **`xcam-drive`** | **CDN de Arquivos:** Um Cloudflare Worker que atua como um proxy para arquivos armazenados no Google Drive, funcionando como uma CDN leve para assets públicos (vídeos, imagens, etc.). | `JavaScript (Cloudflare Worker)` |
| **`xcam-modal`** | **Modal de Detalhes:** Componente de UI isolado, carregado via `iframe`, que exibe informações detalhadas de um streamer, incluindo player, biografia e redes sociais. | `HTML`, `CSS`, `JavaScript` |
| **`xcam-player`** | **Player de Vídeo Unificado:** Player de vídeo versátil (baseado em JWPlayer) que opera em múltiplos modos (completo, preview, carousel) para diferentes contextos da aplicação. | `HTML`, `CSS`, `JavaScript`, `JWPlayer` |
| **`xcam-rec`** | **Sistema de Gravação:** Módulo backend em Python que orquestra a gravação de transmissões ao vivo usando FFmpeg, adiciona marcas d'água, valida a duração e faz o upload dos vídeos. | `Python`, `FFmpeg`, `requests` |
| **`xcam-db`** | **Banco de Dados (Git-as-a-Database):** Diretório que armazena metadados das gravações (`rec.json`) para cada usuário, seguindo uma abordagem de "Git como banco de dados". | `JSON` |
| **`xcam-redirects`**| **Gerenciador de Redirecionamentos:** Provavelmente um conjunto de regras (ex: `_redirects` para Netlify) ou um worker para gerenciar redirecionamentos entre os diferentes subdomínios e serviços do XCam. | `Configuração Netlify` |
| **`xcam-status`** | **Página de Status:** Uma página pública simples para exibir o status operacional dos serviços do XCam. | `HTML`, `CSS` |

---

## 🚀 Como Começar

Para configurar o ambiente de desenvolvimento, siga os passos abaixo.

### Pré-requisitos

-   **Node.js:** Necessário para as ferramentas de desenvolvimento frontend.
-   **Python 3.x:** Necessário para executar o módulo de gravação `xcam-rec`.
-   **FFmpeg:** Essencial para o funcionamento do `xcam-rec`. Deve estar instalado e acessível no `PATH` do sistema.
-   **Cloudflare Wrangler:** CLI para desenvolver e publicar os Cloudflare Workers (`xcam-api`, `xcam-drive`).

### Configuração dos Módulos

#### Frontend (`xcam-beta`)

1.  Como a aplicação é composta por arquivos estáticos e Módulos ES, ela pode ser servida por qualquer servidor web simples.
2.  Para desenvolvimento local, você pode usar uma extensão como o **Live Server** no VS Code na raiz do diretório `xcam-beta`.

#### Módulo de Gravação (`xcam-rec`)

1.  Navegue até o diretório `xcam-rec`:
    ```bash
    cd xcam-rec
    ```
2.  Instale as dependências Python:
    ```bash
    pip install -r requirements.txt
    ```
3.  Execute o script principal com os parâmetros desejados (veja os argumentos em `main.py`):
    ```bash
    python main.py --workers 4 --max-duration 3600
    ```

#### Workers (`xcam-api`, `xcam-drive`)

1.  Navegue até o diretório do worker (ex: `cd xcam-api`).
2.  Autentique-se com o Wrangler:
    ```bash
    wrangler login
    ```
3.  Execute o worker em modo de desenvolvimento local:
    ```bash
    wrangler dev
    ```
4.  Para publicar, execute:
    ```bash
    wrangler publish
    ```

---

## 🌐 API Pública (`xcam-api`)

O endpoint principal da API é a porta de entrada para todos os dados de transmissão.

**Endpoint Base:** `https://api.xcam.gay/`

### Principais Funcionalidades e Endpoints

-   **Listagem de Transmissões:**
    -   `GET /`: Retorna uma lista paginada de todas as transmissões online.
    -   **Parâmetros:** `limit`, `page`, `order`, `gender`, `country`, `orientation`, `tags`, `format` (json/csv).

-   **Proxy de Mídia:**
    -   `GET /poster/{username}.jpg`: Retorna a imagem de preview (poster) de um usuário.
    -   `GET /avatar/{username}.jpg`: Retorna o avatar de um usuário.
    -   `GET /rec/?rec={username}`: Retorna os metadados de gravação (`rec.json`) de um usuário.

-   **Informações de Stream:**
    -   `GET /stream/{username}`: Redireciona para a URL do stream HLS ao vivo.
    -   `GET /?stream={username}`: Retorna um objeto JSON com dados agregados (GraphQL, stream info, poster info) de um usuário.

---

## 👨‍💻 Autor

Desenvolvido por **Samuel Passamani**  
📧 contato@xcam.gay  
🌐 Idealizador do XCam e da arquitetura escalável deste sistema.
