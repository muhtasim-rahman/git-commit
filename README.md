<div align="center">

  <img src="assets/logo.svg" alt="GitCommit Pro v3 Logo" width="380">

  <p align="center">
    <strong>Universal Multi-Shell Git Commit Engine & Conventional Message Composer</strong>
  </p>

  <p align="center">
    <a href="https://github.com/muhtasim-rahman/git-commit/releases"><img src="https://img.shields.io/badge/version-3.0.0-blue.svg?style=for-the-badge&logo=git" alt="Version"></a>
    <a href="https://muhtasim-rahman.github.io/git-commit/"><img src="https://img.shields.io/badge/demo-live%20preview-emerald.svg?style=for-the-badge&logo=githubpages&logoColor=white" alt="Live Demo"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-purple.svg?style=for-the-badge" alt="License"></a>
    <img src="https://img.shields.io/badge/dependencies-zero-success.svg?style=for-the-badge" alt="Zero Dependencies">
    <img src="https://img.shields.io/badge/PWA-offline%20ready-cyan.svg?style=for-the-badge&logo=pwa" alt="PWA Ready">
  </p>

  <p align="center">
    <a href="#-features">Key Features</a> •
    <a href="#-architecture--file-structure">Architecture</a> •
    <a href="#-shell-escaping-matrix">Shell Compatibility</a> •
    <a href="#-keyboard-shortcuts">Shortcuts</a> •
    <a href="#-github-pages-deployment">Deployment</a>
  </p>

</div>

---

## 📖 Overview

Writing clean, descriptive, multiline Git commit messages directly inside terminal environments often results in escaped character errors, broken quotation marks, corrupted variables, or command-line interruptions—especially across differing shells like **Windows CMD**, **PowerShell (5.1 & 7+)**, **Bash**, **Zsh**, and **Fish**.

**GitCommit Pro v3** solves this permanently. It is a client-side, zero-dependency developer utility that compiles structured or freeform release notes into **rock-solid single-line Git commands** engineered to execute flawlessly in your target shell without escaping quirks or broken formatting.

---

## ✨ Features

### 1. 🎯 Conventional Commits v1.0.0 Guided Builder
- **Color-Coded Semantic Types**: Includes `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `revert` with automatic **SemVer** impact correlation (*MAJOR*, *MINOR*, *PATCH*).
- **Optional Scope**: Real-time kebab-case formatting for module/component targets (e.g. `auth`, `ui`, `api`).
- **Breaking Change Detection**: One-click toggle appends `!` to header and injects `BREAKING CHANGE:` footer.
- **Issue & PR References**: Automatic formatting for `Fixes #123`, `Closes #45`, and trailers.

### 2. 📝 Smart Freeform Release Notes Parser
- Paste multiline raw text, bulleted notes, or changelogs.
- Automatically handles paragraph boundaries without inserting unwanted duplicate Git blank lines.

### 3. 🎨 Built-in Gitmoji Directory
- Searchable catalog of **70+ standard Gitmojis** with instant keyword filtering (`features`, `fixes`, `docs`, `refactor`, `performance`, `tooling`).
- One-click insertion directly into your commit message.

### 4. 🛡️ Bulletproof Multi-Shell Escaping Engine
| Shell Target | Escaping Strategy |
| :--- | :--- |
| **Bash / Zsh (Unix)** | Intelligent paragraph grouping, escapes `\`, `"`, `` ` ``, `$`, and prevents interactive `!` history expansion. |
| **ANSI-C Quoting (`$'...'`)** | High-performance single-string multiline format supported across Unix, macOS, WSL, and Git Bash. |
| **PowerShell (5.1 & 7+)** | Full backtick (`` ` ``) escaping table, escapes `$` variables, subexpressions `$(...)`, and preserves newlines with `` `n ``. |
| **Windows CMD (`cmd.exe`)** | Prevents environment variable corruption (`%` to `%%`), handles internal quotes safely for the C runtime, and eliminates illegal carets inside quoted arguments. |
| **Fish Shell** | Compliant Fish string escaping for double quotes and variables. |
| **Raw Commit Text** | Pristine unescaped message for direct pasting into **VS Code**, **GitHub Web UI**, or **JetBrains**. |

### 5. ⚡ Git Flags & Workflow Chaining
- Quick toggles for `-a` (stage all tracked files), `--amend`, `--no-verify` (bypass hooks), and `-s` (signoff).
- Workflow chaining:
  - `Standalone`: `git commit -m "..."`
  - `Add & Commit`: `git add . && git commit -m "..."`
  - `Full Pipeline`: `git add . && git commit -m "..." && git push origin <branch>`

### 6. 🔍 Real-Time Git Commit Quality Linter (50/72 Rule)
- **50-Character Subject Meter**: Live visual color indicators (Green: ≤ 50, Yellow: 51–72, Red: > 72).
- **Imperative Mood Checker**: Flags non-imperative verbs (*"Added"* → *"Add"*, *"Fixing"* → *"Fix"*, *"Updated"* → *"Update"*).
- **Punctuation Check**: Warns against trailing periods in the subject line.
- **Body Column Wrap**: Inspects body lines exceeding the 72-character margin.

### 7. 🖥️ Hyper-Realistic Terminal & Git Log Simulator
- Realistic macOS/Unix terminal simulation with dynamic branch pill (`git:(main)`).
- Terminal output with real-time syntax highlighting for commands, flags, strings, and chaining operators.
- Simulated `git log -1` preview displaying realistic commit SHA, author, timestamp, and message layout.

### 8. 💾 Local History & Developer Templates
- Automatic browser `localStorage` persistence saves recent commits so you never lose work.
- Pre-packaged templates: *Initial Commit*, *Release Version Bump*, *Critical Hotfix*, *Dependency Upgrade*, and *Performance Boost*.

### 9. 🚀 100% Offline & Zero External CDN Dependencies
- No Tailwind CDN runtime lag or flash of unstyled content (FOUC).
- Inlined SVG icons and custom CSS guarantee instant rendering.
- Progressive Web App (PWA) with Service Worker for full offline capabilities.

---

## 🏗 Architecture & File Structure

```
git-commit/
├── index.html                  # Accessible, semantic HTML5 single-page application
├── manifest.json               # Web App Manifest for standalone desktop/mobile installation
├── sw.js                       # Service Worker for 100% offline functionality
├── assets/
│   ├── logo.svg                # Vector brand logo
│   ├── favicon.svg             # Responsive vector favicon
│   └── icons.svg               # SVG icon definitions
├── css/
│   ├── style.css               # Design tokens, variables, typography, layout & animations
│   ├── components.css          # Form inputs, chips, badges, switches, modals & toasts
│   └── terminal.css            # Terminal simulator window & syntax highlighter
├── js/
│   ├── app.js                  # Main coordinator & reactive UI controller
│   ├── escaper.js              # Advanced multi-shell escaping & compiling engine
│   ├── conventional.js         # Conventional Commits v1.0.0 specification engine
│   ├── gitmoji.js              # Complete Gitmoji catalog with category search
│   ├── linter.js               # 50/72 rule checker & imperative mood validator
│   ├── history.js              # LocalStorage persistence & template manager
│   └── ui.js                   # Theme switcher, clipboard manager, modals & toasts
└── README.md                   # Documentation & guide
```

---

## ⚡ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (or <kbd>Cmd</kbd> + <kbd>Enter</kbd>) | **Copy Git Command** to clipboard |
| <kbd>Alt</kbd> + <kbd>1</kbd> | Switch to **Conventional Commits Mode** |
| <kbd>Alt</kbd> + <kbd>2</kbd> | Switch to **Freeform Release Notes Mode** |
| <kbd>Alt</kbd> + <kbd>G</kbd> | Open **Gitmoji Directory** |
| <kbd>Alt</kbd> + <kbd>T</kbd> | Open **Developer Templates** |
| <kbd>Alt</kbd> + <kbd>H</kbd> | Open **Commit History** |
| <kbd>Esc</kbd> | Close any open modal |

---

## 🚀 GitHub Pages Deployment

GitCommit Pro v3 requires **no build step**, bundler, or Node.js runtime. It works out-of-the-box on any static host.

1. Push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings** → **Pages**.
3. Under **Branch**, select `main` and root directory `/`, then click **Save**.
4. Your site will be live at:
   ```
   https://<your-username>.github.io/<repository-name>/
   ```

---

## 💻 Local Usage

Simply double-click `index.html` to open it in any web browser, or serve it using any local HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js npx
npx serve .
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for personal and commercial use.
