/**
 * GitCommit Pro v3 - UI Manager
 * Theme management, clipboard, toast notifications, modals, and keyboard shortcuts.
 */

const UIManager = (() => {

  const THEME_KEY = 'gitcommit_pro_theme';

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    applyTheme(theme);

    // Listen for system theme changes if no explicit user preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIconUse = document.getElementById('themeIconUse');
    if (themeIconUse) {
      themeIconUse.setAttribute('href', theme === 'dark' ? '#icon-sun' : '#icon-moon');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  /**
   * Modern Async Clipboard Copy with resilient fallback.
   */
  async function copyToClipboard(text) {
    if (!text) return false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('Navigator clipboard failed, trying fallback textarea', err);
    }

    // Fallback using temporary textarea
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback copy failed', err);
      return false;
    }
  }

  /**
   * Toast notification display.
   */
  let toastTimer = null;
  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    // Remove existing toasts
    toastContainer.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    
    const iconName = type === 'success' ? 'icon-check' : 'icon-alert';
    toast.innerHTML = `
      <svg class="svg-icon"><use href="#${iconName}"></use></svg>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, 2400);
  }

  /**
   * Modal Management
   */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      const input = modal.querySelector('input');
      if (input) setTimeout(() => input.focus(), 50);
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
    });
  }

  return {
    initTheme,
    toggleTheme,
    copyToClipboard,
    showToast,
    openModal,
    closeModal,
    closeAllModals
  };

})();
