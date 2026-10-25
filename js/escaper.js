/* GitCommit Pro v5 - command engine. No DOM access, so it can be tested in Node. */
(function (root) {
  'use strict';
  const E = {};
  const sq = s => "'" + s.replace(/'/g, "'\\''") + "'"; // POSIX single quotes: history-safe, no expansion
  const ansi = s => "$'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/!/g, '\\x21').replace(/\n/g, '\\n') + "'";
  const ps = s => "'" + s.replace(/[\u2018\u2019\u201A\u201B']/g, m => m + m) + "'"; // PS treats curly quotes as quotes
  const psMulti = s => { const p = s.split('\n').map(ps); return p.length > 1 ? '(' + p.join('+[char]10+') + ')' : p[0]; };
  const cmdq = s => '"' + s.replace(/"/g, '\\"') + '"';

  E.sections = t => {
    const r = { removed: [], owner: [] }, keep = [];
    let cur = null;
    for (const l of t.split('\n')) {
      const m = l.match(/^\s*(removed files|owner actions)\s*:\s*$/i);
      if (m) { cur = m[1][0].toLowerCase() === 'r' ? 'removed' : 'owner'; continue; }
      if (cur) {
        if (!l.trim()) { cur = null; keep.push(l); continue; }
        r[cur].push(l.replace(/^\s*[-*\u2022]\s*/, '').replace(/`/g, '').trim());
        continue;
      }
      keep.push(l);
    }
    return { removed: r.removed, owner: r.owner, text: keep.join('\n') };
  };

  E.clean = (t, o) => {
    t = t.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    if (o.fences) t = t.replace(/^[ \t]*```.*\n?/gm, '');
    if (o.smart) t = t.replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E]/g, '"');
    t = t.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
    if (o.split) { const l = t.split('\n'); if (l.length > 1 && l[1].trim()) { l.splice(1, 0, ''); t = l.join('\n'); } }
    return t;
  };

  // Optional "Title:" / "Description:" labels (off by default).
  E.label = t => {
    const i = t.indexOf('\n');
    if (i < 0) return 'Title: ' + t;
    const body = t.slice(i + 1).replace(/^\n+/, '');
    return 'Title: ' + t.slice(0, i) + (body ? '\n\nDescription:\n' + body : '');
  };

  E.generate = (raw, o) => {
    const w = [], t0 = raw.replace(/\r\n?/g, '\n');
    const sec = o.sections ? E.sections(t0) : { text: t0, removed: [], owner: [] };
    let msg = E.clean(sec.text, o);
    if (!msg) return { cmd: '', warnings: [], message: '', subject: '', owner: sec.owner, removed: sec.removed, file: null };
    const subject = msg.split('\n')[0];
    if (o.labels) msg = E.label(msg);
    const sh = o.shell, first = subject, paras = msg.split('\n\n');
    let mode = o.mode;
    if (sh === 'cmd' && mode === 'stream') { mode = 'file'; w.push('CMD has no heredoc, so File mode is used. Save commit-msg.txt in your repo folder.'); }
    const q = f => sh === 'bash' ? sq(f) : sh === 'powershell' ? ps(f) : '"' + f + '"';
    const fl = (o.amend ? ' --amend' : '') + (o.noverify ? ' --no-verify' : '') + (o.signoff ? ' --signoff' : '') + (o.empty ? ' --allow-empty' : '');
    const pre = [], post = [];
    if (o.rm && sec.removed.length) pre.push('git rm --ignore-unmatch -- ' + sec.removed.map(q).join(' '));
    if (o.add) pre.push('git add -A');
    if (o.tag) {
      const m = first.match(/\bv?(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.]+)?)/);
      if (m) post.push('git tag -a v' + m[1] + ' -m "Release v' + m[1] + '"'); else w.push('Tag: no version like 1.2.3 found in the first line.');
    }
    if (o.push) post.push(o.amend ? 'git push --force-with-lease' : o.tag && post.length ? 'git push --follow-tags' : 'git push');
    if (o.amend && o.push) w.push('Amend + push rewrites history, so --force-with-lease is used. Do not do this on shared branches.');

    let commit, body = null;
    if (mode === 'file') commit = 'git commit' + fl + ' -F commit-msg.txt';
    else if (mode === 'stream' && sh === 'bash') {
      let d = 'GIT_COMMIT_EOF'; const L = msg.split('\n');
      while (L.includes(d)) d += '_X';
      commit = 'git commit' + fl + " -F - <<'" + d + "'"; body = msg + '\n' + d;
    } else if (mode === 'stream') {
      commit = "@'\n" + msg + "\n'@ | git commit" + fl + ' -F -';
      if (/^'@/m.test(msg)) w.push("A line starts with '@, which ends a PowerShell here-string early. Use File mode.");
    } else if (sh === 'bash') {
      commit = 'git commit' + fl + paras.map(p => ' -m ' + (p.includes('\n') ? ansi(p) : sq(p))).join('');
    } else if (sh === 'powershell') {
      commit = 'git commit' + fl + paras.map(p => ' -m ' + psMulti(p)).join('');
      if (msg.includes('"')) w.push('Double quotes in inline PowerShell commands behave differently in 5.1 and 7+. Prefer Stream or File mode.');
    } else {
      commit = 'git commit' + fl + msg.split('\n').filter(l => l.trim()).map(l => ' -m ' + cmdq(l)).join('');
      w.push('CMD inline mode puts a blank line between every line. File mode keeps your layout exactly.');
      if (/["%]/.test(msg)) w.push('Quotes or % can be mangled by cmd.exe in inline mode. Use File mode.');
    }

    let cmd;
    if (mode === 'stream' && sh === 'bash') cmd = pre.map(p => p + ' && ').join('') + commit + post.map(p => ' && ' + p).join('') + '\n' + body;
    else if (mode === 'stream') cmd = ['$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)', ...pre, commit, ...post.map(p => 'if ($?) { ' + p + ' }')].join('\n');
    else {
      const all = [...pre, commit, ...post];
      cmd = sh === 'powershell' ? all.reduceRight((a, c) => a ? c + '; if ($?) { ' + a + ' }' : c, '') : all.join(' && ');
    }
    if (sh === 'cmd' && cmd.length > 8000) w.push('Command is over 8000 characters; cmd.exe stops at 8191. Use File mode.');
    if (sh === 'cmd' && /[^\x00-\x7F]/.test(msg)) w.push('Non-ASCII text in CMD: run "chcp 65001" first, or use File mode.');
    if (/(ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/.test(raw)) w.push('This looks like a secret or token. Remove it before committing.');
    return { cmd, warnings: w, message: msg, subject, owner: sec.owner, removed: sec.removed, file: mode === 'file' ? msg + '\n' : null };
  };

  root.GCP = root.GCP || {};
  root.GCP.E = E;
  if (typeof module !== 'undefined') module.exports = E;
})(typeof window !== 'undefined' ? window : globalThis);
