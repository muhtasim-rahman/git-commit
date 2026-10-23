<p align="center"><img src="assets/logo.svg" width="96" alt="GitCommit Pro logo"></p>

<h1 align="center">GitCommit Pro</h1>

<p align="center">Turn any multiline message into a safe, copy-ready <code>git commit</code> command for Bash, Zsh, PowerShell and CMD.<br>Private, offline-ready, no build step.</p>

<p align="center"><a href="https://muhtasim-rahman.github.io/git-commit/">Live app</a> · <a href="CHANGELOG.md">Changelog</a> · MIT License</p>

---

## Why

Multiline commit messages break in terminals: quotes, `$`, backticks, `!`, `%` and backslashes all mean different things in each shell. GitCommit Pro builds the command for your shell and preserves your layout exactly as Git will store it.

## Features

- **Three output modes**
  - **Stream** (default): `git commit -F - <<'EOF'` for Bash/Zsh, a here-string piped to `git commit -F -` for PowerShell. No inline escaping, so any text is safe.
  - **Compact**: one line, one `-m` per paragraph. Bash/Zsh keep real newlines through `$'...'`.
  - **File**: downloads `commit-msg.txt` and gives `git commit -F commit-msg.txt`. Works in every shell, including CMD.
- **Correct paragraphs.** Git puts a blank line between every `-m`, so v4 only splits on real blank lines.
- **Input cleanup.** CRLF, BOM, trailing spaces, extra blank lines, smart quotes (optional), pasted ``` fences (optional), and an automatic blank line after the subject so `git log --oneline` stays readable.
- **Workflow chain** (all off by default): `git add -A`, tag from the version in the first line, `git push`. PowerShell chains with `if ($?)`, so it also works on Windows PowerShell 5.1.
- **Smart sections.** `Owner actions:` becomes a checklist outside the commit. `Removed files:` can become `git rm --ignore-unmatch` (opt-in).
- **Subject builder** with Conventional Commit types, scope, breaking flag and an emoji.
- **Linter and stats.** Subject length (50 / 72), characters, words, secret warning.
- **Git-log preview**, **auto-saved draft**, **history of the last 20 commands**, light / dark / system theme.
- **Installable PWA** that works offline. No CDN, no tracking, no network calls.

## Shell notes

| Shell | Stream | Compact | File |
| --- | --- | --- | --- |
| Bash / Zsh / Git Bash / Termux | yes | yes | yes |
| PowerShell 7+ | yes | yes | yes |
| Windows PowerShell 5.1 | yes (UTF-8 set automatically) | avoid `"` in text | yes |
| CMD | uses File | limited, warns | yes |

CMD has no heredoc and treats quotes, `%` and `&` specially, so File mode is the reliable choice there.

## Run

Open `index.html`, or serve the folder (`npx serve .`). The service worker only registers over `http(s)`.

## Deploy to GitHub Pages

Settings → Pages → Deploy from branch → `main` / root. All paths are relative, so it works at `/git-commit/`.

## Tests

```bash
node tests/roundtrip.js
```

Runs generated Bash commands in a temporary repo and checks Git stored the exact message. PowerShell 5.1 and CMD are not covered by automated tests; try them in a throwaway repo.

## Structure

```
index.html  manifest.webmanifest  sw.js
css/styles.css
js/escaper.js   command engine (no DOM)
js/app.js       UI, history, theme
assets/         logo and icons
tests/roundtrip.js
```

## License

MIT © Muhtasim Rahman
