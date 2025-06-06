# XCam_REC_V3.4

Automação robusta para captura, gravação e versionamento de transmissões ao vivo da XCam em ambientes Google Colab, com integração ao GitHub e Google Drive.

---

## Sumário

- [Objetivo](#objetivo)
- [Funcionalidades](#funcionalidades)
- [Fluxo de Execução](#fluxo-de-execução)
- [Parâmetros Globais](#parâmetros-globais)
- [Requisitos](#requisitos)
- [Como Utilizar](#como-utilizar)
- [Arquitetura e Design](#arquitetura-e-design)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Considerações de Segurança](#considerações-de-segurança)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Objetivo

Este notebook tem como missão automatizar todo o processo de:
- Descoberta de transmissões online na XCam (API oficial)
- Gravação eficiente de streams (com ffmpeg)
- Geração e validação automática de posters (imagens estáticas)
- Upload para storage externo (Abyss)
- Versionamento e sincronização de metadados (JSON) e imagens no GitHub
- Persistência de arquivos no Google Drive, garantindo redundância e portabilidade

Ideal para uso intensivo, processamento em lote e integração com pipelines CI/CD em ambientes baseados em nuvem.

---

## Funcionalidades

- **Configuração centralizada de parâmetros:**  
  Todos os limites, thresholds e caminhos críticos são definidos em uma célula única, facilitando ajustes e manutenção.

- **Instalação automatizada de dependências:**  
  Instala e verifica o ffmpeg automaticamente no ambiente Colab.

- **Gerenciamento de repositório e storage:**  
  Clona o repositório GitHub e replica no Google Drive para persistência.

- **Busca inteligente e flexível de transmissões:**  
  Suporte a busca em lote, busca unitária e busca personalizada de usuários.

- **Geração robusta de posters:**  
  Baixa da API ou gera via ffmpeg caso o poster esteja ausente ou inválido.

- **Gravação controlada de streams:**  
  Define tempo máximo/mínimo, grava múltiplas transmissões em paralelo, valida duração real e descarta gravações curtas.

- **Controle de concorrência:**  
  Log temporário impede duplicidade em execuções simultâneas.

- **Commit e push automáticos:**  
  Versiona apenas arquivos relevantes, com batch commit configurável.

- **Upload automatizado para Abyss:**  
  Faz upload dos vídeos gravados e recebe slug para indexação.

- **Atualização e versionamento de metadados:**  
  Mantém arquivos JSON atualizados com status detalhado de cada transmissão.

- **Limpeza de arquivos temporários:**  
  Garante ambiente limpo, removendo arquivos desnecessários após o processamento.

---

## Fluxo de Execução

1. **Configuração inicial:**  
   - Montagem do Google Drive  
   - Definição dos parâmetros globais

2. **Instalação de dependências:**  
   - Checagem e instalação do ffmpeg

3. **Clonagem de repositório:**  
   - Ambiente local e Drive sincronizados

4. **Busca de transmissões:**  
   - Via API XCam: busca em lote ou por usuário específico (modo interativo ou automático)
   - Fallback para liveInfo se necessário

5. **Geração e validação de posters:**  
   - Download do poster da API ou geração via ffmpeg

6. **Gravação das transmissões:**  
   - Controle de tempo, logs de progresso, validação de duração

7. **Upload e versionamento:**  
   - Upload para Abyss, atualização de JSON, commit e push para o GitHub

8. **Limpeza e finalização:**  
   - Remoção de arquivos temporários e atualização do log

---

## Parâmetros Globais

| Parâmetro                | Descrição                                                       | Valor Padrão |
|--------------------------|-----------------------------------------------------------------|--------------|
| LIMIT_DEFAULT            | Máximo de transmissões processadas em paralelo                  | 25           |
| PAGE_DEFAULT             | Página inicial para busca na API                                | 1            |
| RECORD_SECONDS           | Tempo máximo de gravação por vídeo (segundos)                   | 12780        |
| RECORD_SECONDS_MIN       | Tempo mínimo para considerar a gravação válida (segundos)       | 660          |
| API_SEARCH_LIMIT         | Limite de transmissões retornadas ao buscar usuários específicos| 1500         |
| COMMIT_PUSH_THRESHOLD    | Quantidade de transmissões para batch commit/push               | 25           |

Todos os parâmetros podem ser ajustados facilmente na primeira célula do notebook.

---

## Requisitos

- Google Colab (recomendado)
- Conta Google Drive (opcional, para persistência)
- Conta GitHub com token de acesso (PAT) configurado
- Dependências Python: `requests`, `multiprocessing`, `ffmpeg`, `subprocess`, entre outros (instalados automaticamente)

---

## Como Utilizar

1. **Abra o notebook no Google Colab:**  
   [Abrir no Colab](https://colab.research.google.com/github/SamuelPassamani/XCam/blob/main/xcam-colab/XCam_REC_V3.4.ipynb)

2. **Execute célula por célula:**  
   Siga a ordem das células para garantir correta configuração e execução.

3. **Ajuste parâmetros se necessário:**  
   Modifique limites e thresholds na célula de configurações para adequar ao seu uso.

4. **Responda à interação (opcional):**  
   Informe usuários específicos se desejar gravar transmissões direcionadas.

5. **Acompanhe os logs:**  
   O notebook imprime logs detalhados de progresso, erros e status de uploads/commits.

---

## Arquitetura e Design

- **Modularidade:**  
  Cada célula/função resolve uma única responsabilidade, seguindo Clean Architecture.

- **Escalabilidade:**  
  Suporte a múltiplas gravações paralelas, processamento em lote e integração com pipelines CI/CD.

- **Resiliência e Logs:**  
  Tratamento robusto de exceções, logs de progresso e controle de concorrência com lock/log temporário.

- **Interoperabilidade:**  
  Funciona em ambientes Colab, integrando-se a Google Drive e GitHub sem dependências exclusivas.

---

## Estrutura de Pastas

```
xcam-colab/
│
├── XCam_REC_V3.4.ipynb   # Notebook principal de automação
├── <arquivos gerados temporários>
├── <pastas de saída de gravações>
│
└── ...
```
- Arquivos temporários e gravações ficam em `/content/temp_recordings` por padrão no Colab.
- Repositório é clonado em `/content/XCam` e no Google Drive, se disponível.

---

## Considerações de Segurança

- **NUNCA compartilhe seu GitHub Token em ambientes públicos.**  
  Garanta que o token tenha permissões mínimas necessárias e, se possível, armazene via variáveis de ambiente.

- **Uploads para Abyss são públicos:**  
  Garanta que os vídeos gravados não exponham informações sensíveis.

---

## Contribuição

Contribuições, sugestões e melhorias são bem-vindas!  
Abra uma Issue ou Pull Request seguindo as boas práticas do GitHub.

---

## Licença

[MIT](./LICENSE)

---