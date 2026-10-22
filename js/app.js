/**
 * GitCommit Pro v3 - Main Application Controller
 * Coordinates State, Escaper, Conventional Builder, Gitmoji, Linter, and Terminal Simulator.
 */

document.addEventListener('DOMContentLoaded', () => {

  // Global State
  const state = {
    mode: 'conventional', // 'conventional' | 'freeform'
    shell: 'bash',        // 'bash' | 'powershell' | 'cmd' | 'ansi' | 'fish' | 'raw'
    chaining: 'none',     // 'none' | 'add_commit' | 'add_commit_push'
    branch: 'main',
    flags: [],
    conventional: {
      type: 'feat',
      scope: '',
      gitmoji: '',
      description: '',
      body: '',
      isBreaking: false,
      breakingDescription: '',
      issues: ''
    },
    freeformText: '',
    currentCompiled: null
  };

  // DOM Elements
  const elements = {
    // Mode toggles
    modeConventionalBtn: document.getElementById('modeConventionalBtn'),
    modeFreeformBtn: document.getElementById('modeFreeformBtn'),
    conventionalSection: document.getElementById('conventionalSection'),
    freeformSection: document.getElementById('freeformSection'),

    // Conventional form inputs
    typeGrid: document.getElementById('typeGrid'),
    scopeInput: document.getElementById('scopeInput'),
    descInput: document.getElementById('descInput'),
    bodyInput: document.getElementById('bodyInput'),
    breakingToggle: document.getElementById('breakingToggle'),
    breakingGroup: document.getElementById('breakingGroup'),
    breakingDescInput: document.getElementById('breakingDescInput'),
    issuesInput: document.getElementById('issuesInput'),
    selectedGitmojiBadge: document.getElementById('selectedGitmojiBadge'),
    clearGitmojiBtn: document.getElementById('clearGitmojiBtn'),

    // Freeform textarea
    rawTextarea: document.getElementById('rawTextarea'),
    clearRawBtn: document.getElementById('clearRawBtn'),

    // Shell tabs & flags
    shellTabs: document.querySelectorAll('.shell-tab'),
    chainingSelect: document.getElementById('chainingSelect'),
    branchGroup: document.getElementById('branchGroup'),
    branchInput: document.getElementById('branchInput'),
    flagCheckboxes: document.querySelectorAll('.flag-checkbox'),

    // Output & Terminal Simulator
    terminalCommand: document.getElementById('terminalCommand'),
    copyBtn: document.getElementById('copyBtn'),
    copyRawBtn: document.getElementById('copyRawBtn'),
    terminalBranchBadge: document.getElementById('terminalBranchBadge'),
    terminalPromptSymbol: document.getElementById('terminalPromptSymbol'),
    logSubject: document.getElementById('logSubject'),
    logBody: document.getElementById('logBody'),
    logHash: document.getElementById('logHash'),
    logDate: document.getElementById('logDate'),

    // Linter elements
    charCounter: document.getElementById('charCounter'),
    linterStatus: document.getElementById('linterStatus'),
    linterHints: document.getElementById('linterHints'),

    // Modals & Triggers
    openGitmojiBtn: document.getElementById('openGitmojiBtn'),
    gitmojiModal: document.getElementById('gitmojiModal'),
    gitmojiSearchInput: document.getElementById('gitmojiSearchInput'),
    gitmojiGrid: document.getElementById('gitmojiGrid'),
    gitmojiCatBtns: document.querySelectorAll('.gitmoji-cat-btn'),

    openHistoryBtn: document.getElementById('openHistoryBtn'),
    historyModal: document.getElementById('historyModal'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),

    openTemplatesBtn: document.getElementById('openTemplatesBtn'),
    templatesModal: document.getElementById('templatesModal'),
    templatesGrid: document.getElementById('templatesGrid'),

    themeToggleBtn: document.getElementById('themeToggleBtn')
  };

  // 1. Initialize Application
  function init() {
    UIManager.initTheme();
    renderTypeChips();
    renderGitmojis();
    renderTemplates();
    generateRandomCommitHash();
    updateDateDisplay();
    setupEventListeners();
    registerServiceWorker();

    // Initial compile
    updateCommand();
  }

  // 2. Render Conventional Types Selector
  function renderTypeChips() {
    elements.typeGrid.innerHTML = '';
    ConventionalEngine.TYPES.forEach(item => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `type-chip ${item.id === state.conventional.type ? 'active' : ''}`;
      chip.dataset.type = item.id;
      chip.innerHTML = `
        <span class="type-name">
          <span>${item.emoji}</span>
          <span>${item.id}</span>
          <span class="badge ${item.badgeClass}" style="font-size:0.6rem; padding:0.1rem 0.35rem; margin-left:auto;">${item.semver}</span>
        </span>
        <span class="type-desc">${item.description}</span>
      `;
      chip.addEventListener('click', () => {
        state.conventional.type = item.id;
        document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        updateCommand();
      });
      elements.typeGrid.appendChild(chip);
    });
  }

  // 3. Render Templates
  function renderTemplates() {
    elements.templatesGrid.innerHTML = '';
    HistoryStore.getTemplates().forEach(t => {
      const card = document.createElement('div');
      card.className = 'history-item';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="history-content">
          <div style="font-weight:700; font-size:0.9rem; margin-bottom:0.25rem;">
            ${t.gitmoji || '✨'} ${t.title}
          </div>
          <div class="history-text" style="color:var(--text-muted); font-size:0.75rem;">
            ${t.type}${t.scope ? `(${t.scope})` : ''}: ${t.description}
          </div>
        </div>
        <button class="btn btn-secondary btn-icon" title="Apply Template" style="flex-shrink:0;">
          <svg class="svg-icon"><use href="#icon-check"></use></svg>
        </button>
      `;
      card.addEventListener('click', () => {
        applyTemplate(t);
        UIManager.closeModal('templatesModal');
        UIManager.showToast(`Applied "${t.title}" template!`);
      });
      elements.templatesGrid.appendChild(card);
    });
  }

  function applyTemplate(t) {
    state.mode = 'conventional';
    switchMode('conventional');

    state.conventional.type = t.type;
    state.conventional.scope = t.scope || '';
    state.conventional.gitmoji = t.gitmoji || '';
    state.conventional.description = t.description || '';
    state.conventional.body = t.body || '';
    state.conventional.issues = t.issues || '';
    state.conventional.isBreaking = Boolean(t.isBreaking);

    // Update DOM inputs
    elements.scopeInput.value = state.conventional.scope;
    elements.descInput.value = state.conventional.description;
    elements.bodyInput.value = state.conventional.body;
    elements.issuesInput.value = state.conventional.issues;
    elements.breakingToggle.checked = state.conventional.isBreaking;
    elements.breakingGroup.style.display = state.conventional.isBreaking ? 'block' : 'none';

    renderTypeChips();
    updateGitmojiBadge();
    updateCommand();
  }

  // 4. Render Gitmoji Directory
  function renderGitmojis(query = '', category = 'all') {
    elements.gitmojiGrid.innerHTML = '';
    const list = GitmojiCatalog.search(query, category);

    if (list.length === 0) {
      elements.gitmojiGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:2rem; color:var(--text-muted);">No Gitmoji matched "${query}"</div>`;
      return;
    }

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'gitmoji-card';
      card.innerHTML = `
        <span class="gitmoji-emoji">${item.emoji}</span>
        <div class="gitmoji-meta">
          <span class="gitmoji-code">${item.code}</span>
          <span class="gitmoji-desc">${item.desc}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        selectGitmoji(item.emoji);
        UIManager.closeModal('gitmojiModal');
      });
      elements.gitmojiGrid.appendChild(card);
    });
  }

  function selectGitmoji(emoji) {
    if (state.mode === 'conventional') {
      state.conventional.gitmoji = emoji;
      updateGitmojiBadge();
    } else {
      // In freeform mode, insert at cursor position
      const textarea = elements.rawTextarea;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      textarea.value = val.substring(0, start) + emoji + ' ' + val.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length + 1;
      state.freeformText = textarea.value;
    }
    updateCommand();
    UIManager.showToast(`Selected ${emoji}`);
  }

  function updateGitmojiBadge() {
    if (state.conventional.gitmoji) {
      elements.selectedGitmojiBadge.textContent = state.conventional.gitmoji;
      elements.selectedGitmojiBadge.style.display = 'inline-flex';
      elements.clearGitmojiBtn.style.display = 'inline-flex';
    } else {
      elements.selectedGitmojiBadge.style.display = 'none';
      elements.clearGitmojiBtn.style.display = 'none';
    }
  }

  // 5. Render History Modal
  function renderHistory() {
    elements.historyList.innerHTML = '';
    const history = HistoryStore.getHistory();

    if (history.length === 0) {
      elements.historyList.innerHTML = `
        <div style="text-align:center; padding:2.5rem; color:var(--text-muted);">
          <svg class="svg-icon" style="width:2rem; height:2rem; margin-bottom:0.5rem; opacity:0.5;"><use href="#icon-history"></use></svg>
          <div>No commit history yet. Generated commits will be saved here automatically!</div>
        </div>
      `;
      return;
    }

    history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-item';
      
      const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });

      card.innerHTML = `
        <div class="history-content">
          <div class="history-text">${escapeHtml(item.command)}</div>
          <div class="history-meta">
            <span>${timeStr}</span>
            <span style="text-transform:uppercase;">${item.shell}</span>
          </div>
        </div>
        <div class="history-actions">
          <button class="btn btn-secondary btn-icon" title="Copy Command" data-action="copy">
            <svg class="svg-icon"><use href="#icon-copy"></use></svg>
          </button>
          <button class="btn btn-ghost btn-icon" title="Load into Builder" data-action="load">
            <svg class="svg-icon"><use href="#icon-check"></use></svg>
          </button>
          <button class="btn btn-danger-ghost btn-icon" title="Delete" data-action="delete">
            <svg class="svg-icon"><use href="#icon-trash"></use></svg>
          </button>
        </div>
      `;

      card.querySelector('[data-action="copy"]').addEventListener('click', (e) => {
        e.stopPropagation();
        UIManager.copyToClipboard(item.command);
        UIManager.showToast('Copied from history!');
      });

      card.querySelector('[data-action="load"]').addEventListener('click', (e) => {
        e.stopPropagation();
        loadHistoryItem(item);
        UIManager.closeModal('historyModal');
        UIManager.showToast('Loaded commit into editor!');
      });

      card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
        e.stopPropagation();
        HistoryStore.removeEntry(item.id);
        renderHistory();
      });

      elements.historyList.appendChild(card);
    });
  }

  function loadHistoryItem(item) {
    if (item.rawText) {
      const parsed = ConventionalEngine.parseMessage(item.rawText);
      if (parsed) {
        state.mode = 'conventional';
        switchMode('conventional');
        state.conventional.type = parsed.type;
        state.conventional.scope = parsed.scope;
        state.conventional.description = parsed.description;
        state.conventional.body = parsed.body;
        state.conventional.issues = parsed.footers;
        state.conventional.isBreaking = parsed.isBreaking;

        elements.scopeInput.value = parsed.scope;
        elements.descInput.value = parsed.description;
        elements.bodyInput.value = parsed.body;
        elements.issuesInput.value = parsed.footers;
        elements.breakingToggle.checked = parsed.isBreaking;
        elements.breakingGroup.style.display = parsed.isBreaking ? 'block' : 'none';
        renderTypeChips();
      } else {
        state.mode = 'freeform';
        switchMode('freeform');
        elements.rawTextarea.value = item.rawText;
        state.freeformText = item.rawText;
      }
      updateCommand();
    }
  }

  // 6. Mode Switching
  function switchMode(mode) {
    state.mode = mode;
    if (mode === 'conventional') {
      elements.modeConventionalBtn.classList.add('active');
      elements.modeFreeformBtn.classList.remove('active');
      elements.conventionalSection.style.display = 'block';
      elements.freeformSection.style.display = 'none';
    } else {
      elements.modeConventionalBtn.classList.remove('active');
      elements.modeFreeformBtn.classList.add('active');
      elements.conventionalSection.style.display = 'none';
      elements.freeformSection.style.display = 'block';

      // If switching from conventional, sync text if freeform empty
      if (!elements.rawTextarea.value) {
        elements.rawTextarea.value = ConventionalEngine.buildMessage(state.conventional);
        state.freeformText = elements.rawTextarea.value;
      }
    }
    updateCommand();
  }

  // 7. Core Command Generation & Simulator Update
  function updateCommand() {
    let rawCommitMessage = '';

    if (state.mode === 'conventional') {
      rawCommitMessage = ConventionalEngine.buildMessage(state.conventional);
    } else {
      rawCommitMessage = elements.rawTextarea.value;
    }

    // Collect active flags
    state.flags = [];
    elements.flagCheckboxes.forEach(cb => {
      if (cb.checked) state.flags.push(cb.value);
    });

    state.chaining = elements.chainingSelect.value;
    state.branch = elements.branchInput.value || 'main';

    // Compile command through multi-shell escaper
    const compiled = ShellEscaper.compile({
      rawText: rawCommitMessage,
      shell: state.shell,
      flags: state.flags,
      chaining: state.chaining,
      branch: state.branch
    });

    state.currentCompiled = compiled;

    // Render highlighted terminal command
    renderTerminalOutput(compiled.command);

    // Update Terminal Header branch badge
    elements.terminalBranchBadge.textContent = `git:(${state.branch})`;
    elements.terminalPromptSymbol.textContent = (state.shell === 'cmd' || state.shell === 'powershell') ? '>' : '$';

    // Update Realistic Git Log Simulator
    updateGitLogSimulator(compiled.paragraphs, rawCommitMessage);

    // Run Linter & Quality checks
    updateLinter(rawCommitMessage);
  }

  // 8. Terminal Syntax Highlighting
  function renderTerminalOutput(cmd) {
    if (!cmd || cmd.includes('Your commit message will appear here...')) {
      elements.terminalCommand.innerHTML = `<span class="syn-placeholder">${escapeHtml(cmd)}</span>`;
      return;
    }

    let formatted = escapeHtml(cmd);

    // Highlight chaining &&
    formatted = formatted.replace(/(&amp;&amp;)/g, '<span class="syn-chain">$1</span>');

    // Highlight git commands
    formatted = formatted.replace(/\b(git\s+(?:commit|add|push))\b/g, '<span class="syn-cmd">$1</span>');

    // Highlight flags (-m, -a, --amend, etc.)
    formatted = formatted.replace(/(\s-[a-zA-Z]|\s--[a-z-]+)/g, '<span class="syn-flag">$1</span>');

    // Highlight double-quoted strings
    formatted = formatted.replace(/(".*?")/g, '<span class="syn-str">$1</span>');

    // Highlight ANSI-C quoted strings ($'...')
    formatted = formatted.replace(/(\$'.*?')/g, '<span class="syn-str">$1</span>');

    elements.terminalCommand.innerHTML = formatted;
  }

  // 9. Realistic Git Log -1 Simulator
  function updateGitLogSimulator(paragraphs, rawText) {
    if (!rawText.trim()) {
      elements.logSubject.textContent = 'Waiting for commit input...';
      elements.logBody.textContent = '';
      return;
    }

    const lines = rawText.trim().split('\n');
    const subject = lines[0] || '';
    const bodyLines = lines.slice(1).join('\n').trim();

    elements.logSubject.textContent = subject;
    elements.logBody.textContent = bodyLines;
  }

  // 10. Commit Quality Linter Display
  function updateLinter(rawText) {
    const report = CommitLinter.lint(rawText);

    elements.charCounter.textContent = `${report.subjectLength} / 50`;
    elements.charCounter.className = 'char-counter';

    if (report.lengthStatus === 'err') {
      elements.charCounter.classList.add('char-err');
    } else if (report.lengthStatus === 'warn') {
      elements.charCounter.classList.add('char-warn');
    } else {
      elements.charCounter.classList.add('char-ok');
    }

    // Render hints / warnings
    const combinedTips = [...report.issues, ...report.tips];
    if (combinedTips.length > 0) {
      elements.linterHints.innerHTML = combinedTips.map(t => `<span>• ${escapeHtml(t)}</span>`).join(' ');
      elements.linterHints.style.display = 'flex';
    } else if (rawText.trim()) {
      elements.linterHints.innerHTML = '<span style="color:#10B981;">✓ Message conforms to standard Git 50/72 guidelines.</span>';
      elements.linterHints.style.display = 'flex';
    } else {
      elements.linterHints.style.display = 'none';
    }
  }

  // 11. Event Listeners Setup
  function setupEventListeners() {
    // Mode Switching
    elements.modeConventionalBtn.addEventListener('click', () => switchMode('conventional'));
    elements.modeFreeformBtn.addEventListener('click', () => switchMode('freeform'));

    // Conventional inputs
    elements.scopeInput.addEventListener('input', e => {
      state.conventional.scope = e.target.value;
      updateCommand();
    });

    elements.descInput.addEventListener('input', e => {
      state.conventional.description = e.target.value;
      updateCommand();
    });

    elements.bodyInput.addEventListener('input', e => {
      state.conventional.body = e.target.value;
      updateCommand();
    });

    elements.issuesInput.addEventListener('input', e => {
      state.conventional.issues = e.target.value;
      updateCommand();
    });

    elements.breakingToggle.addEventListener('change', e => {
      state.conventional.isBreaking = e.target.checked;
      elements.breakingGroup.style.display = e.target.checked ? 'block' : 'none';
      updateCommand();
    });

    elements.breakingDescInput.addEventListener('input', e => {
      state.conventional.breakingDescription = e.target.value;
      updateCommand();
    });

    elements.clearGitmojiBtn.addEventListener('click', () => {
      state.conventional.gitmoji = '';
      updateGitmojiBadge();
      updateCommand();
    });

    // Freeform Input
    elements.rawTextarea.addEventListener('input', e => {
      state.freeformText = e.target.value;
      updateCommand();
    });

    elements.clearRawBtn.addEventListener('click', () => {
      elements.rawTextarea.value = '';
      state.freeformText = '';
      updateCommand();
    });

    // Shell Selection Tabs
    elements.shellTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.shellTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.shell = tab.dataset.shell;
        updateCommand();
      });
    });

    // Chaining & Flags
    elements.chainingSelect.addEventListener('change', e => {
      state.chaining = e.target.value;
      elements.branchGroup.style.display = (state.chaining === 'add_commit_push') ? 'block' : 'none';
      updateCommand();
    });

    elements.branchInput.addEventListener('input', e => {
      state.branch = e.target.value;
      updateCommand();
    });

    elements.flagCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => updateCommand());
    });

    // Clipboard Copy Buttons
    elements.copyBtn.addEventListener('click', () => handleCopyCommand());
    elements.copyRawBtn.addEventListener('click', () => handleCopyRaw());

    // Theme Toggle
    elements.themeToggleBtn.addEventListener('click', () => UIManager.toggleTheme());

    // Modals
    elements.openGitmojiBtn.addEventListener('click', () => {
      UIManager.openModal('gitmojiModal');
      renderGitmojis(elements.gitmojiSearchInput.value);
    });

    elements.gitmojiSearchInput.addEventListener('input', e => {
      const activeCat = document.querySelector('.gitmoji-cat-btn.active')?.dataset.category || 'all';
      renderGitmojis(e.target.value, activeCat);
    });

    elements.gitmojiCatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.gitmojiCatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGitmojis(elements.gitmojiSearchInput.value, btn.dataset.category);
      });
    });

    elements.openHistoryBtn.addEventListener('click', () => {
      renderHistory();
      UIManager.openModal('historyModal');
    });

    elements.clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your commit history?')) {
        HistoryStore.clearAll();
        renderHistory();
        UIManager.showToast('History cleared.');
      }
    });

    elements.openTemplatesBtn.addEventListener('click', () => {
      UIManager.openModal('templatesModal');
    });

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => UIManager.closeAllModals());
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) UIManager.closeAllModals();
      });
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', e => {
      // Escape closes modals
      if (e.key === 'Escape') {
        UIManager.closeAllModals();
      }

      // Ctrl + Enter (or Cmd + Enter): Copy command
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCopyCommand();
      }

      // Alt + 1: Conventional Mode
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        switchMode('conventional');
      }

      // Alt + 2: Freeform Mode
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        switchMode('freeform');
      }

      // Alt + G: Gitmoji Picker
      if (e.altKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        UIManager.openModal('gitmojiModal');
      }

      // Alt + H: History
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        renderHistory();
        UIManager.openModal('historyModal');
      }
    });
  }

  // 12. Copy Handlers
  async function handleCopyCommand() {
    if (!state.currentCompiled || !state.currentCompiled.rawMessage) {
      UIManager.showToast('Please enter a commit message first.', 'warn');
      return;
    }

    const command = state.currentCompiled.command;
    const ok = await UIManager.copyToClipboard(command);

    if (ok) {
      // Save to localStorage history
      HistoryStore.addEntry({
        rawText: state.currentCompiled.rawMessage,
        command: command,
        shell: state.shell
      });

      UIManager.showToast('✓ Command copied to clipboard!');
      triggerCopyAnimation(elements.copyBtn);
    } else {
      UIManager.showToast('Failed to copy command.', 'err');
    }
  }

  async function handleCopyRaw() {
    if (!state.currentCompiled || !state.currentCompiled.rawMessage) {
      UIManager.showToast('No commit message to copy.', 'warn');
      return;
    }

    const ok = await UIManager.copyToClipboard(state.currentCompiled.rawMessage);
    if (ok) {
      UIManager.showToast('✓ Raw message copied (for VS Code/GitHub)!');
    }
  }

  function triggerCopyAnimation(btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 150);
  }

  // Helper Utilities
  function generateRandomCommitHash() {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 7; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    elements.logHash.textContent = `commit ${hash}9b4c2e17f8a`;
  }

  function updateDateDisplay() {
    const now = new Date();
    elements.logDate.textContent = `Date:   ${now.toUTCString()}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 13. Service Worker Registration for 100% Offline PWA
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('SW registration note:', err.message);
      });
    }
  }

  // Run Initialization
  init();

});
