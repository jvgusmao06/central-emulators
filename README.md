# Central Emulators (Emulator Hub) 🕹️

> Um hub e launcher moderno para múltiplos emuladores retro, construído com **Tauri v2**, **Rust**, e **React 19 (TypeScript)**.

---

## 📖 Visão Geral

O **Central Emulators** centraliza a gestão, o download e a execução de emuladores retro em uma interface unificada e intuitiva (estilo Steam / OpenEmu).

Em vez de embutir os emuladores diretamente no mesmo código-fonte, o projeto adota uma **arquitetura desacoplada e modular**:
- **Interface e Gerenciador (Este Repositório):** Responsável pela interface gráfica, catálogo de downloads via GitHub Releases, gerenciamento das pastas de ROMs, listagem dos jogos e disparo dos executáveis com os argumentos corretos.
- **Núcleos de Emulação (Repositórios Separados):** Cada emulador (CHIP-8, Game Boy, NES, etc.) é mantido, versionado e compilado de forma independente.

---

## 🚀 Funcionalidades Atuais

- 📥 **Loja de Downloads Integrada:** Baixa e instala binários de emuladores diretamente das GitHub Releases oficiais com streaming em tempo real.
- 💾 **Detecção Automática no Disco:** Escaneia a pasta física de executáveis e sincroniza o status de instalação na hora.
- 📂 **Biblioteca de Jogos (ROM Library):**
  - Gerenciamento de pastas de ROMs individuais por console.
  - Filtro automático por extensões suportadas (`.ch8`, `.gb`, `.gbc`, etc.).
  - Busca em tempo real por títulos.
  - Visualização de metadados (tamanho do arquivo, extensão, nome formatado).
- 🎮 **Lançamento Direto de Jogos (Instant Play):** Dispara o processo do emulador de forma não-bloqueante via CLI passando a ROM selecionada como argumento.
- 🗑️ **Desinstalação de Núcleos:** Exclusão limpa de emuladores instalados diretamente pela interface.

---

## 🏛️ Arquitetura do Sistema

```
                    ┌───────────────────────────┐
                    │     Central Emulators     │
                    │   (Tauri v2 + React TS)   │
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│   CHIP-8 Core     │    │  Game Boy Core    │    │    NES Core       │
│  (Em progresso)   │    │   (Planejado)     │    │   (Planejado)     │
└───────────────────┘    └───────────────────┘    └───────────────────┘
```

### Como funciona a integração:
1. O usuário escolhe um emulador na aba **Downloads** e clica em **Baixar e Instalar**.
2. O backend em Rust baixa o executável correspondente à plataforma (Windows ou Linux) e salva na pasta `installed_emulators/`.
3. Na aba **Meus Emuladores**, o usuário clica em **Ver ROMs** e visualiza todos os jogos da sua pasta configurada.
4. Ao clicar em **Jogar**, o backend executa:
   ```bash
   chip8.exe "caminho/para/jogo.ch8"
   ```

---

## 🎮 Consoles Suportados e Planejados

| Console / Sistema | Linguagem do Core | Extensões | Repositório | Status |
| :--- | :--- | :--- | :--- | :--- |
| **CHIP-8** | C | `.ch8` | [jvgusmao06/Chip-8](https://github.com/jvgusmao06/Chip-8) | Em Integração |
| **Game Boy (DMG-01)** | C / Rust | `.gb`, `.gbc` | Planejado | Planejado |
| **NES** | C++ / Rust | `.nes` | Planejado | Planejado |

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
- **Desktop Runtime & Backend:** [Tauri v2](https://v2.tauri.app/), [Rust](https://www.rust-lang.org/)
- **Comunicação de Rede:** `reqwest` (stream de downloads), API do GitHub

---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v20+)
- [Rust & Cargo](https://www.rust-lang.org/)
- Dependências de desenvolvimento do [Tauri v2](https://v2.tauri.app/start/prerequisites/) para o seu sistema operacional.

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/jvgusmao06/central-emulators.git
cd central-emulators

# 2. Instale as dependências do Node.js
npm install

# 3. Execute o frontend em modo de desenvolvimento (Vite)
npm run dev

# 4. Ou execute o aplicativo desktop completo com o Tauri
npm run tauri dev

# 5. Para compilar o executável final de produção
npm run tauri build
```
