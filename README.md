# Documentação Técnica — Projeto XCam

Este documento descreve a estrutura técnica do projeto **XCam**, uma plataforma modular para exibição de transmissões ao vivo, com foco em performance, clareza e responsividade.

---

## ✏️ Visão Geral da Arquitetura

- **Frontend puro (Vanilla JS, HTML, CSS)**
- **Modularização por responsabilidade**: dados, filtros, renderização e modal.
- **Separado por módulos ES6 (import/export)**
- **Fonte de dados externa**: `https://xcam.moviele.workers.dev/v1/?limit=1500&format=json`
- **Autoatualização com intervalo configurável**

---

## 🔗 Módulos e Funções

### data.js

Responsável por buscar e armazenar os dados recebidos da API.

```js
fetchBroadcasts(url): Promise<Array>
getAllBroadcasts(): Array
getFilteredBroadcasts(): Array
setFilteredBroadcasts(list: Array): void
resetFilters(): void
startAutoUpdate(callback: Function, interval?: number): void
```

### filters.js

Aplica regras de filtragem, ordenação e paginação.

```js
filterBroadcasts(broadcasts: Array, filters: Object): Array
sortBroadcastsByViewers(broadcasts: Array): Array
paginateBroadcasts(broadcasts: Array, page: number, perPage: number): Array
```

### domUtils.js

Manipula o DOM: cria elementos, substitui conteúdo e mostra notificacões.

```js
renderBroadcastGrid(container, broadcasts, page, perPage, onClick)
renderCarousel(container, broadcasts, max, onClick)
renderPagination(container, total, current, perPage, onChange)
createBroadcastCard(broadcast, onClick): HTMLElement
showToast(message: string, type?: string): void
formatViewers(n: number): string
```

### playerUtils.js

Carrega o player e transmissões relacionadas dentro do modal.

```js
loadPlayer(container: HTMLElement, id: string): void
renderRelatedBroadcasts(container: HTMLElement, allBroadcasts: Array, currentId: string, onClick): void
```

### translations.js / translations-reverse.js

Dicionários para tradução bidirecional de códigos:

```js
countryNames['fr'] => 'França'
genderTranslations['male'] => 'Masculino'
orientationTranslations['gay'] => 'Gay'
```

Usado em:

- `openModal()` para exibir descrições legíveis
- `populateCountryOptions()` para popular select

### main.js

Script principal que integra os módulos anteriores.

```js
initApp(): Promise<void>
updateUI(): void
openModal(id: string): void
setupFilters(), setupSearch(), setupMobileMenu(): void
```

---

## 🌐 index.html

- Contêineres com `id` específicos para:
  - `#main-carousel`, `#broadcasts-grid`, `#pagination`
  - Filtros: `#country-filter`, `#gender-filter`, `#orientation-filter`
  - Modal: `#broadcast-modal > #modal-content`
  - `#related-grid` dentro do modal
  - `#toast-container` para notificações

---

## 🎨 style.css (Tailwind + Custom)

- Cores: `primary`, `secondary`, `dark`, `accent`
- Classes para:
  - `.broadcast-card`, `.carousel-slide`, `.modal`, `.related-card`
  - `.live-badge`, `.tag`, `.toast.toast-success|error|info`
  - `.pagination-button`, `.modal-player`, `.modal-related`
- Usa animações (`fadeIn`, `slideUp`, `pulse`)

---

## ⚖️ Convenções

- Todos os módulos usam `export` para suas funções principais
- Estilos são definidos por classes reutilizáveis
- IDs no HTML são usados como ponto de referência para DOM
- Toasts desaparecem após 3 segundos com transição CSS
- Debounce na busca é de 300ms
- Página padrão é 1; cada página exibe 30 resultados

---

## ✅ Testes e Comportamentos Esperados

- `initApp()` popula tudo corretamente e atualiza a cada 60s
- Clicar em um card chama `openModal(id)` com:
  - player via `<iframe>`
  - recomendações por `country` ou `gender`
- Mudança de filtros invoca `updateUI()`
- Campo de busca reduz resultados em tempo real

---

## 📌 Conclusão

O projeto XCam segue padrões modernos de desenvolvimento, com separação de responsabilidades, modularização via ES Modules, e organização clara entre lógica, apresentação e interatividade.

Essa documentação oferece referência rápida para manutenção, extensão ou debugging do sistema.
