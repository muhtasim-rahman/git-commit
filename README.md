<p align="center"><img src="assets/logo.svg" width="96" alt="GitCommit Pro logo"></p>

<h1 align="center">GitCommit Pro</h1>

<p align="center"><b>Multiline commit messages, turned into safe, copy-ready git commands.</b></p>

<p align="center">Bash · Zsh · PowerShell · CMD &nbsp;|&nbsp; Private · Offline · No build step</p>

<p align="center"><a href="https://muhtasim-rahman.github.io/git-commit/">Open the app</a> · <a href="#how-to-use">How to use</a> · <a href="#options-reference">Options</a> · <a href="CHANGELOG.md">Changelog</a></p>

<!-- Screenshots: add images to assets/ and link them here, for example:
<p align="center"><img src="assets/screenshot-light.png" width="720" alt="GitCommit Pro in light mode"></p> -->

---

## What it does

Write or paste a commit message with a title, paragraphs and bullet points. GitCommit Pro builds one command that you paste into your terminal. Git stores your message exactly as you wrote it, even when it contains quotes, `$`, backticks, `!`, `%` or backslashes, which every shell treats differently.

Everything runs in your browser. Nothing is uploaded, there is no account and no tracking.

## How to use

1. **Write your message** in the left panel. The first line is the subject. A blank line starts a new paragraph.
2. **Choose your terminal**: Bash / Zsh, PowerShell or CMD.
3. **Choose an output mode** (see below). Stream is the default.
4. **Turn on extras** if you need them, such as `git add -A`, a tag, or `git push`.
5. **Copy the command** (button or `Ctrl+Enter`), open a terminal in your repository, paste and press Enter.

Tip: hover or tap any option to see what it does. Every copied command is saved in History on the left.

## Output modes

| Mode | What you get | Best for |
| --- | --- | --- |
| **Stream** | `git commit -F - <<'EOF'` in Bash/Zsh, a here-string piped to `git commit -F -` in PowerShell | Any text. No inline escaping. |
| **Compact** | One line with one `-m` per paragraph | Short messages, quick paste |
| **File** | Downloads `commit-msg.txt` and gives `git commit -F commit-msg.txt` | CMD and anything unusual |

CMD has no heredoc, so Stream switches to File there automatically.

## Options reference

**Clean-up (left panel)**

| Option | What it does |
| --- | --- |
| Blank line | Adds a blank line after the subject so `git log --oneline` stays readable. On by default. |
| Straight quotes | Turns curly quotes into plain quotes. On by default. |
| Remove ``` | Removes pasted code-fence lines. On by default. |
| Sections | Moves `Owner actions:` and `Removed files:` lists out of the commit message. On by default. |
| Title/Description | Adds `Title:` before the subject and `Description:` before the body. Off by default. |

**Git options (right panel)**

| Option | Command added |
| --- | --- |
| add -A | `git add -A` before the commit |
| push | `git push` after the commit |
| Tag | `git tag -a vX.Y.Z` from a version found in the subject; push uses `--follow-tags` |
| rm files | `git rm --ignore-unmatch` for the `Removed files:` list |
| Amend | `--amend`. With push, uses `--force-with-lease`. Avoid on shared branches. |
| Sign-off | `--signoff` |
| No hooks | `--no-verify` |
| Allow empty | `--allow-empty` |

All git options are off by default.

**Subject builder.** Pick a Conventional Commit type, optional scope, emoji and the `!` breaking flag, then press the sparkle button to rewrite the first line, for example `feat(ui)!: ✨ new layout`.

**Smart sections.** Write a heading on its own line and list items below it:

```
Owner actions:
- Enable GitHub Pages
- Update the screenshots
```

The items appear as a checklist next to the command and are not part of the commit.

**Other tools.** Subject length check (50 / 72), character and word count, secret warning, git-log preview, auto-saved draft, history of the last 20 commands, paste and example buttons, light / dark / system theme.

## Shell notes

| Shell | Stream | Compact | File |
| --- | --- | --- | --- |
| Bash / Zsh / Git Bash / Termux | yes | yes | yes |
| PowerShell 7+ | yes | yes | yes |
| Windows PowerShell 5.1 | yes (UTF-8 set automatically) | avoid `"` in text | yes |
| CMD | uses File | limited, warns | yes |

## Install and run

- **Online:** open the live app. Use your browser's install option to add it as an app that works offline.
- **Locally:** open `index.html`, or serve the folder with `npx serve .`. The service worker only registers over `http(s)`.

## Deploy to GitHub Pages

Settings → Pages → Deploy from branch → `main` / root. All paths are relative, so it works at `/git-commit/`.

## Tests

```bash
node tests/roundtrip.js
```

Runs generated Bash commands in a temporary repository and checks that Git stored the exact message. PowerShell 5.1 and CMD are not covered by automated tests; try them in a throwaway repository.

## Project structure

```
index.html  manifest.webmanifest  sw.js
css/styles.css
js/escaper.js   command engine (no DOM)
js/app.js       UI, history, theme
assets/         logo and icons
tests/roundtrip.js
```

## Contributing

Issues and pull requests are welcome. Run `node tests/roundtrip.js` before you open a pull request.

## License

MIT © [Muhtasim Rahman](https://mdturzo.web.app)
