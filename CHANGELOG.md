# Changelog

## 5.0.0
- New logo and a GitHub-style minimal theme (light, dark, system).
- Two-column layout: message and history on the left, command, actions and git-log preview on the right. Fully responsive.
- Icon-based compact controls with tooltips on every option.
- History shows the commit title; copy, restore and remove per item.
- Optional `Title:` / `Description:` labels (off by default).
- New git options: `--amend`, `--signoff`, `--no-verify`, `--allow-empty`. Amend + push uses `--force-with-lease`.
- Paste and Example buttons; in-page quick guide; footer with docs link and developer badge.
- Service worker is network-first, so updates show up right away.
- README rewritten as full user documentation.

## 4.0.0
- Rebuilt from scratch: separate CSS/JS, offline PWA, no CDN.
- New command engine with Stream, Compact and File modes; correct quoting for Bash/Zsh, PowerShell and CMD.
- Fixed per-line `-m` spacing, CRLF handling, innerHTML preview, clipboard API.
- Added history, auto-save, subject builder, linter, workflow chain, Owner actions checklist, new logo.
