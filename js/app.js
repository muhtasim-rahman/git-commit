(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const E = GCP.E, K = 'gcp4:';
  const st = {
    get(k, d) { try { const v = localStorage.getItem(K + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  };
  // One list drives the toggles, the tooltips and the "All options" docs.
  const OPTS = [
    ['split', 'clean', 'rows', 'Blank line', 'Adds a blank line after the subject so git log --oneline stays readable.'],
    ['smart', 'clean', 'quote', 'Straight quotes', 'Turns curly quotes into plain quotes, which shells understand.'],
    ['fences', 'clean', 'code', 'Remove ```', 'Removes pasted code-fence lines such as ``` from the message.'],
    ['sections', 'clean', 'list', 'Sections', 'Moves "Owner actions:" and "Removed files:" lists out of the commit message.'],
    ['labels', 'clean', 'mark', 'Title/Description', 'Adds "Title:" before the subject and "Description:" before the body. Off by default.'],
    ['add', 'git', 'plus', 'add -A', 'Runs git add -A before the commit so every change is staged.'],
    ['push', 'git', 'up', 'push', 'Runs git push after the commit. With Amend it uses --force-with-lease.'],
    ['tag', 'git', 'tag', 'Tag', 'Creates an annotated tag from a version like 1.2.3 found in the subject.'],
    ['rm', 'git', 'trash', 'rm files', 'Turns the "Removed files:" list into git rm --ignore-unmatch.'],
    ['amend', 'git', 'undo', 'Amend', 'Replaces the last commit instead of creating a new one (--amend).'],
    ['signoff', 'git', 'pen', 'Sign-off', 'Adds a Signed-off-by line with your Git name and email (--signoff).'],
    ['noverify', 'git', 'shield', 'No hooks', 'Skips pre-commit and commit-msg hooks (--no-verify). Use with care.'],
    ['empty', 'git', 'dash', 'Allow empty', 'Allows a commit with no file changes (--allow-empty).']
  ];
  const DEF = { mode: 'stream', theme: 'system', split: true, smart: true, fences: true, sections: true };
  OPTS.forEach(o => { if (!(o[0] in DEF)) DEF[o[0]] = false; });
  const plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  const S = Object.assign({ shell: /win/i.test(plat) ? 'powershell' : 'bash' }, DEF, st.get('s', {}));
  const FLAGS = OPTS.map(o => o[0]);
  const ico = n => '<svg class="i"><use href="#i-' + n + '"/></svg>';

  OPTS.forEach(([id, grp, icon, label, tip]) => {
    const l = document.createElement('label');
    l.className = 'chip'; l.dataset.tip = tip;
    l.innerHTML = '<input type="checkbox" id="f-' + id + '">' + ico(icon) + '<span>' + label + '</span>'; // constants only
    $('#o-' + grp).append(l);
    const d = document.createElement('div');
    d.innerHTML = ico(icon) + '<p style="margin:0"><b></b> <span></span></p>';
    d.querySelector('b').textContent = label; d.querySelector('span').textContent = tip;
    $('#optdocs').append(d);
  });

  const ta = $('#msg');
  ta.value = st.get('draft', '');
  let out = null, hist = st.get('hist', []), tt;
  const SAMPLE = 'feat(ui): v5.0.0 new layout\n\n- Two-column layout\n- History shows commit titles\n\nOwner actions:\n- Enable GitHub Pages\n- Update the screenshots';

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const ib = (icon, tip, f) => { const b = el('button', 'ib'); b.type = 'button'; b.dataset.tip = tip; b.setAttribute('aria-label', tip); b.innerHTML = ico(icon); b.onclick = f; return b; };
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800); };

  function theme() {
    if (S.theme === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = S.theme;
    $('#theme').dataset.tip = 'Theme: ' + S.theme + ' (click to change)';
  }
  const save = () => st.set('s', S);
  function sync() {
    $$('[data-shell]').forEach(b => b.setAttribute('aria-pressed', b.dataset.shell === S.shell));
    $$('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === S.mode));
    FLAGS.forEach(f => { $('#f-' + f).checked = !!S[f]; });
  }

  function render() {
    st.set('draft', ta.value);
    out = E.generate(ta.value, S);
    const o = $('#out');
    o.textContent = out.cmd || 'Your command will appear here.';
    o.classList.toggle('empty', !out.cmd);
    const w = $('#warn'); w.replaceChildren();
    out.warnings.forEach(x => w.append(el('li', '', x)));
    const n = out.subject.length, words = (out.message.match(/\S+/g) || []).length;
    const s = $('#stats');
    s.textContent = 'Subject ' + n + '/50 \u00b7 ' + out.message.length + ' chars \u00b7 ' + words + ' words';
    s.className = 'stats ' + (n > 72 ? 'er' : n > 50 ? 'wn' : 'ok');
    const pv = $('#pv'); pv.replaceChildren();
    if (out.message) {
      const L = out.message.split('\n');
      pv.append(el('div', 'pv-h', 'commit 9f3c2a1 (simulated)'), el('div', 'pv-s', L[0]));
      L.slice(1).forEach(l => pv.append(el('div', 'pv-b', l || '\u00a0')));
    } else pv.append(el('div', 'pv-b', 'Nothing to preview yet.'));
    const ow = $('#owner'); ow.replaceChildren(); ow.hidden = !out.owner.length;
    if (out.owner.length) {
      ow.append(el('h2', '', 'Owner actions'));
      out.owner.forEach(a => { const l = el('label', 'chk'), c = document.createElement('input'); c.type = 'checkbox'; l.append(c, el('span', '', a)); ow.append(l); });
    }
    $('#dl').hidden = !out.file;
  }

  const title = x => ((x.msg || '').split('\n').find(l => l.trim()) || x.cmd.split('\n')[0]).slice(0, 120);
  const ago = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : new Date(ts).toLocaleDateString(); };
  function renderHist() {
    const h = $('#hist'); h.replaceChildren();
    $('#hist-empty').hidden = hist.length > 0;
    hist.forEach((x, i) => {
      const r = el('div', 'hrow'), t = el('div', 't');
      t.append(el('b', '', title(x)), el('small', '', ago(x.ts)));
      r.append(t,
        ib('copy', 'Copy command', () => copy(x.cmd, false)),
        ib('undo', 'Restore this message into the editor', () => { ta.value = x.msg; render(); ta.focus(); toast('Restored'); }),
        ib('x', 'Remove from history', () => { hist.splice(i, 1); st.set('hist', hist); renderHist(); }));
      h.append(r);
    });
  }

  async function copy(text, log) {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch (e) {
      const t = document.createElement('textarea');
      t.value = text; t.style.cssText = 'position:fixed;opacity:0'; document.body.append(t); t.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) { /* ignore */ }
      t.remove();
      if (!ok) { toast('Copy failed. Select the text and copy it manually.'); return; }
    }
    toast('Copied');
    if (log) { hist = [{ cmd: text, msg: ta.value, ts: Date.now() }, ...hist.filter(h => h.cmd !== text)].slice(0, 20); st.set('hist', hist); renderHist(); }
  }

  $$('[data-shell]').forEach(b => b.onclick = () => { S.shell = b.dataset.shell; save(); sync(); render(); });
  $$('[data-mode]').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; save(); sync(); render(); });
  FLAGS.forEach(f => $('#f-' + f).onchange = e => { S[f] = e.target.checked; save(); render(); });
  ta.addEventListener('input', render);
  $('#theme').onclick = () => { S.theme = { system: 'light', light: 'dark', dark: 'system' }[S.theme]; save(); theme(); };
  $('#copy').onclick = () => copy(out.cmd, true);
  $('#copyraw').onclick = () => copy(out.message, false);
  $('#clear').onclick = () => { ta.value = ''; render(); ta.focus(); };
  $('#sample').onclick = () => { ta.value = SAMPLE; render(); };
  $('#paste').onclick = async () => {
    try { ta.value = await navigator.clipboard.readText(); render(); } catch (e) { toast('Clipboard blocked. Paste with Ctrl+V.'); ta.focus(); }
  };
  $('#clearhist').onclick = () => { hist = []; st.set('hist', hist); renderHist(); };
  $('#dl').onclick = () => {
    const a = document.createElement('a'), u = URL.createObjectURL(new Blob([out.file], { type: 'text/plain;charset=utf-8' }));
    a.href = u; a.download = 'commit-msg.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
  $('#apply').onclick = () => {
    const L = ta.value.split('\n');
    const d = (L[0] || '').replace(/^(?:\p{Extended_Pictographic}\uFE0F?\s*)?[a-z]+(?:\([^)]*\))?!?:\s*/iu, '').replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, '').trim() || 'describe the change';
    const sc = $('#b-scope').value.trim(), em = $('#b-emoji').value;
    L[0] = $('#b-type').value + (sc ? '(' + sc + ')' : '') + ($('#b-bang').checked ? '!' : '') + ': ' + (em ? em + ' ' : '') + d;
    ta.value = L.join('\n'); render(); toast('Subject updated');
  };
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); copy(out.cmd, true); } });

  theme(); sync(); render(); renderHist();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
