(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const E = GCP.E, K = 'gcp4:';
  const st = {
    get(k, d) { try { const v = localStorage.getItem(K + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ }
    }
  };
  const plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  const S = Object.assign({ shell: /win/i.test(plat) ? 'powershell' : 'bash', mode: 'stream', add: false, push: false, tag: false, sections: true, rm: false, fences: true, smart: true, split: true, theme: 'system' }, st.get('s', {}));
  const FLAGS = ['add', 'push', 'tag', 'sections', 'rm', 'fences', 'smart', 'split'];
  const ta = $('#msg');
  ta.value = st.get('draft', '');
  let out = null, hist = st.get('hist', []), tt;

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const btn = (t, f) => { const b = el('button', 'mini', t); b.type = 'button'; b.onclick = f; return b; };
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800); };

  function theme() {
    if (S.theme === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = S.theme;
    $('#theme').textContent = 'Theme: ' + S.theme;
  }
  function save() { st.set('s', S); }
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
      ow.append(el('h3', '', 'Owner actions'));
      out.owner.forEach(a => { const l = el('label', 'chk'), c = document.createElement('input'); c.type = 'checkbox'; l.append(c, el('span', '', a)); ow.append(l); });
    }
    $('#dl').hidden = !out.file;
  }

  function renderHist() {
    const h = $('#hist'); h.replaceChildren();
    $('#hist-empty').hidden = hist.length > 0;
    hist.forEach(x => {
      const r = el('div', 'hrow');
      r.append(el('code', '', x.cmd.split('\n')[0].slice(0, 90)), btn('Copy', () => copy(x.cmd, false)), btn('Load', () => { ta.value = x.msg; render(); }));
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
