/**
 * GitCommit Pro v3 - Conventional Commits v1.0.0 Module
 * Structured commit generator with SemVer correlation.
 */

const ConventionalEngine = (() => {

  const TYPES = [
    {
      id: 'feat',
      name: 'feat',
      emoji: '✨',
      label: 'Feature',
      description: 'A new feature for the user',
      semver: 'MINOR',
      badgeClass: 'badge-feat'
    },
    {
      id: 'fix',
      name: 'fix',
      emoji: '🐛',
      label: 'Bug Fix',
      description: 'A bug fix for the codebase',
      semver: 'PATCH',
      badgeClass: 'badge-fix'
    },
    {
      id: 'docs',
      name: 'docs',
      emoji: '📝',
      label: 'Documentation',
      description: 'Documentation only changes',
      semver: 'PATCH',
      badgeClass: 'badge-docs'
    },
    {
      id: 'style',
      name: 'style',
      emoji: '💄',
      label: 'Style',
      description: 'Formatting, white-space, missing semicolons',
      semver: 'PATCH',
      badgeClass: 'badge-style'
    },
    {
      id: 'refactor',
      name: 'refactor',
      emoji: '♻️',
      label: 'Refactor',
      description: 'Code change that neither fixes a bug nor adds a feature',
      semver: 'PATCH',
      badgeClass: 'badge-refactor'
    },
    {
      id: 'perf',
      name: 'perf',
      emoji: '⚡️',
      label: 'Performance',
      description: 'A code change that improves performance',
      semver: 'PATCH',
      badgeClass: 'badge-perf'
    },
    {
      id: 'test',
      name: 'test',
      emoji: '✅',
      label: 'Tests',
      description: 'Adding missing tests or correcting existing tests',
      semver: 'PATCH',
      badgeClass: 'badge-test'
    },
    {
      id: 'build',
      name: 'build',
      emoji: '📦',
      label: 'Build',
      description: 'Changes that affect build system or dependencies',
      semver: 'PATCH',
      badgeClass: 'badge-chore'
    },
    {
      id: 'ci',
      name: 'ci',
      emoji: '👷',
      label: 'CI/CD',
      description: 'Changes to CI/CD workflows and scripts',
      semver: 'PATCH',
      badgeClass: 'badge-chore'
    },
    {
      id: 'chore',
      name: 'chore',
      emoji: '🔧',
      label: 'Chore',
      description: 'Routine tasks, maintenance, tooling updates',
      semver: 'PATCH',
      badgeClass: 'badge-chore'
    },
    {
      id: 'revert',
      name: 'revert',
      emoji: '⏪',
      label: 'Revert',
      description: 'Reverts a previous commit',
      semver: 'PATCH',
      badgeClass: 'badge-fix'
    }
  ];

  /**
   * Build a standard Conventional Commit string.
   */
  function buildMessage(data = {}) {
    const {
      type = 'feat',
      scope = '',
      gitmoji = '',
      description = '',
      body = '',
      isBreaking = false,
      breakingDescription = '',
      issues = ''
    } = data;

    if (!description.trim() && !body.trim()) {
      return '';
    }

    // 1. Header: <type>[optional scope][!]: [gitmoji] <description>
    let header = type || 'feat';
    
    if (scope && scope.trim()) {
      // Normalize scope: lowercase, no spaces
      const cleanScope = scope.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      header += `(${cleanScope})`;
    }

    if (isBreaking) {
      header += '!';
    }

    header += ': ';

    if (gitmoji && gitmoji.trim()) {
      header += `${gitmoji.trim()} `;
    }

    header += (description || '').trim();

    // 2. Body
    const parts = [header];

    if (body && body.trim()) {
      parts.push(body.trim());
    }

    // 3. Footers
    const footers = [];

    if (isBreaking && breakingDescription && breakingDescription.trim()) {
      footers.push(`BREAKING CHANGE: ${breakingDescription.trim()}`);
    }

    if (issues && issues.trim()) {
      footers.push(issues.trim());
    }

    if (footers.length > 0) {
      parts.push(footers.join('\n'));
    }

    return parts.join('\n\n');
  }

  /**
   * Parse a Conventional Commit string back into its constituent parts.
   */
  function parseMessage(text) {
    if (!text || !text.trim()) return null;

    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const sections = normalized.split(/\n{2,}/);
    const header = sections[0].trim();

    // Regex for: type(scope)!: description
    const headerRegex = /^([a-zA-Z0-9_-]+)(?:\(([^)]+)\))?(!)?:\s*(.*)$/;
    const match = header.match(headerRegex);

    if (!match) return null;

    const [, type, scope, breakingMark, descWithEmoji] = match;
    const isBreaking = Boolean(breakingMark);

    // Remaining sections
    let body = '';
    let footers = '';

    if (sections.length > 1) {
      const rest = sections.slice(1);
      // Check if last section is footer
      const last = rest[rest.length - 1];
      if (/^(BREAKING CHANGE:|Fixes|Closes|Co-authored-by:)/i.test(last)) {
        footers = last;
        body = rest.slice(0, rest.length - 1).join('\n\n');
      } else {
        body = rest.join('\n\n');
      }
    }

    return {
      type: type.toLowerCase(),
      scope: scope || '',
      isBreaking,
      description: descWithEmoji || '',
      body,
      footers
    };
  }

  return {
    TYPES,
    buildMessage,
    parseMessage
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConventionalEngine;
}
