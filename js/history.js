/**
 * GitCommit Pro v3 - History & Template Manager
 * LocalStorage persistence, favorites, and pre-packaged developer templates.
 */

const HistoryStore = (() => {

  const STORAGE_KEY = 'gitcommit_pro_history_v3';
  const MAX_HISTORY = 40;

  const TEMPLATES = [
    {
      id: 'initial',
      title: 'Initial Commit',
      type: 'feat',
      scope: 'init',
      gitmoji: '🎉',
      description: 'initial repository setup and architecture',
      body: '- Configure build scripts and project dependencies\n- Add README and license documentation\n- Setup CI/CD workflow pipeline'
    },
    {
      id: 'version-bump',
      title: 'Release Version Bump',
      type: 'chore',
      scope: 'release',
      gitmoji: '🔖',
      description: 'bump version to v3.0.0',
      body: '- Update package.json and changelog\n- Tag production release artifacts'
    },
    {
      id: 'hotfix',
      title: 'Critical Hotfix',
      type: 'fix',
      scope: 'auth',
      gitmoji: '🚑️',
      description: 'resolve session token invalidation race condition',
      body: 'Prevent premature session logout when concurrent requests refresh the JWT token.',
      issues: 'Fixes #104'
    },
    {
      id: 'deps-upgrade',
      title: 'Dependency Upgrade',
      type: 'build',
      scope: 'deps',
      gitmoji: '⬆️',
      description: 'upgrade core dependencies to latest stable versions',
      body: '- Update runtime packages\n- Resolve breaking API changes\n- Verify all automated test suites pass'
    },
    {
      id: 'docs-revamp',
      title: 'Documentation Revamp',
      type: 'docs',
      scope: 'readme',
      gitmoji: '📝',
      description: 'update deployment instructions and API references',
      body: 'Add comprehensive troubleshooting guide and modern architecture diagrams.'
    },
    {
      id: 'perf-boost',
      title: 'Performance Boost',
      type: 'perf',
      scope: 'render',
      gitmoji: '⚡️',
      description: 'optimize dom rendering with virtualized lists',
      body: 'Reduce initial render time by 45% and eliminate memory leaks on high-frequency updates.'
    }
  ];

  function getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to read commit history from localStorage', e);
      return [];
    }
  }

  function saveHistory(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
    } catch (e) {
      console.warn('Failed to save commit history to localStorage', e);
    }
  }

  function addEntry(entry) {
    const history = getHistory();
    const newEntry = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      rawText: entry.rawText,
      command: entry.command,
      shell: entry.shell || 'bash',
      isFavorite: false
    };

    // Prevent immediate duplicate if identical to top entry
    if (history.length > 0 && history[0].command === newEntry.command) {
      return history[0];
    }

    history.unshift(newEntry);
    saveHistory(history);
    return newEntry;
  }

  function toggleFavorite(id) {
    const history = getHistory();
    const item = history.find(h => h.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      saveHistory(history);
    }
    return history;
  }

  function removeEntry(id) {
    let history = getHistory();
    history = history.filter(h => h.id !== id);
    saveHistory(history);
    return history;
  }

  function clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    return [];
  }

  function getTemplates() {
    return TEMPLATES;
  }

  return {
    getHistory,
    addEntry,
    toggleFavorite,
    removeEntry,
    clearAll,
    getTemplates
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HistoryStore;
}
