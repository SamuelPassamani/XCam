<div align="center">
  <img src="https://xcam.gay/src/logo.svg" width="120" alt="XCam Logo"/>
  <h1>XCam App</h1>
  <p>Interface principal para explorar, filtrar e interagir com transmissões ao vivo na plataforma XCam.</p>

  <p align="center">
    <a href="https://xcam.gay">xcam.gay</a> •
    <a href="https://beta.xcam.gay">Versão Beta</a> •
    <a href="https://api.xcam.gay">API</a> •
    <a href="mailto:contato@xcam.gay">contato@xcam.gay</a>
  </p>

  <p align="center">
    <img src="https://api.netlify.com/api/v1/badges/ded26182-8393-4141-ab43-7ba4c85cc568/deploy-status" alt="XCam Web App">
  </p>
</div>

---

## 📦 Sobre

O **XCam App** é o coração da experiência do usuário na plataforma XCam. Ele serve como a aplicação principal (Single Page Application) onde os usuários podem descobrir, filtrar e assistir a transmissões ao vivo de forma intuitiva e eficiente.

---

## 🔧 Funcionalidades

- **Visualização em Grade:** Exibe as transmissões em uma grade responsiva, adaptando-se a diferentes tamanhos de tela.
- **Filtragem Dinâmica:** Permite filtrar modelos por gênero, orientação sexual, país e tags.
- **Scroll Infinito:** Carrega novas transmissões automaticamente conforme o usuário rola a página.
- **Busca por Usuário:** Permite encontrar um modelo específico pelo nome de usuário.
- **Internacionalização (i18n):** Suporte a múltiplos idiomas para uma experiência de usuário global.
- **Modal de Usuário:** Exibe informações detalhadas do modelo em um modal, sem sair da página principal.

---

## 📁 Estrutura da pasta `xcam-app/`

```
xcam-app/
├── index.html              # Estrutura principal da aplicação
├── script.js               # Lógica principal, incluindo renderização e filtros
├── style.css               # Estilos da aplicação
├── chat/                   # Componente de chat
├── user/                   # Perfil público do usuário
└── src/                    # Assets (imagens, vídeos de erro, etc.)
```

---

## 🚀 Como usar

Acesse a aplicação principal através da URL:
[https://xcam.gay/](https://xcam.gay/)

A versão beta, com funcionalidades experimentais, está disponível em:
[https://beta.xcam.gay/](https://beta.xcam.gay/)

---

## 🧠 Lógica de execução (resumo)

1. A aplicação inicializa, carregando as transmissões iniciais da `XCam API`.
2. A grade de modelos é renderizada dinamicamente.
3. O usuário pode aplicar filtros, que disparam novas requisições à API com os parâmetros selecionados.
4. A rolagem da página aciona o carregamento de mais modelos (scroll infinito).
5. Clicar em um modelo abre um modal com informações detalhadas, incluindo um player de vídeo.

---

## 🧩 Tecnologias Utilizadas

| Tecnologia   | Descrição                                        |
| ------------ | ------------------------------------------------ |
| HTML5 + CSS3 | Estrutura e estilização da aplicação             |
| JavaScript   | Lógica de renderização, filtros e interações     |
| XCam API     | Fonte de dados para as transmissões              |
| Netlify      | Deploy, CDN, e otimização de entrega             |

---

## 👤 Desenvolvedor

**Samuel (idealizador do projeto XCam)**
📧 [contato@xcam.gay](mailto:contato@xcam.gay)
🌐 [https://xcam.gay](https://xcam.gay)
