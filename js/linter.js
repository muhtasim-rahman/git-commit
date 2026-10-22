/**
 * GitCommit Pro v3 - Git Commit Quality Linter
 * Enforces the industry standard 50/72 rule and imperative commit guidelines.
 */

const CommitLinter = (() => {

  const NON_IMPERATIVE_MAP = {
    'added': 'add',
    'adding': 'add',
    'adds': 'add',
    'fixed': 'fix',
    'fixing': 'fix',
    'fixes': 'fix',
    'updated': 'update',
    'updating': 'update',
    'updates': 'update',
    'removed': 'remove',
    'removing': 'remove',
    'removes': 'remove',
    'deleted': 'delete',
    'deleting': 'delete',
    'deletes': 'delete',
    'changed': 'change',
    'changing': 'change',
    'changes': 'change',
    'implemented': 'implement',
    'implementing': 'implement',
    'implements': 'implement',
    'refactored': 'refactor',
    'refactoring': 'refactor',
    'refactors': 'refactor',
    'created': 'create',
    'creating': 'create',
    'creates': 'create',
    'merged': 'merge',
    'merging': 'merge',
    'merges': 'merge'
  };

  /**
   * Lint a commit message string.
   */
  function lint(commitText = '') {
    const issues = [];
    const tips = [];
    
    if (!commitText || !commitText.trim()) {
      return {
        subjectLength: 0,
        status: 'empty',
        issues: [],
        tips: []
      };
    }

    const lines = commitText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const subject = lines[0].trim();
    const subjectLen = subject.length;

    // 1. Subject length check (50/72 rule)
    let lengthStatus = 'ok'; // 'ok' | 'warn' | 'err'
    if (subjectLen > 72) {
      lengthStatus = 'err';
      issues.push(`Subject line is ${subjectLen} chars (exceeds recommended 72 max).`);
    } else if (subjectLen > 50) {
      lengthStatus = 'warn';
      tips.push(`Subject line is ${subjectLen} chars (ideal is 50 chars or less).`);
    }

    // 2. Trailing period check
    if (subject.endsWith('.')) {
      issues.push('Subject line should not end with a period.');
    }

    // 3. Imperative mood check
    // Extract description part if conventional commit
    let descPart = subject;
    const colonIdx = subject.indexOf(':');
    if (colonIdx !== -1) {
      descPart = subject.substring(colonIdx + 1).trim();
    }

    // Remove leading emoji if present
    descPart = descPart.replace(/^[\p{Emoji}\u200d\uFE0F]+\s*/u, '').trim();

    const firstWord = descPart.split(/\s+/)[0]?.toLowerCase();
    if (firstWord && NON_IMPERATIVE_MAP[firstWord]) {
      const suggestion = NON_IMPERATIVE_MAP[firstWord];
      tips.push(`Use imperative verb: "${suggestion}" instead of "${firstWord}".`);
    }

    // 4. Blank line after subject check (if body exists)
    if (lines.length > 1) {
      if (lines[1].trim() !== '') {
        issues.push('A blank line must separate the subject from the body.');
      }
    }

    // 5. Body lines width check (> 72 chars)
    let longBodyLinesCount = 0;
    for (let i = 2; i < lines.length; i++) {
      if (lines[i].length > 72) {
        longBodyLinesCount++;
      }
    }
    if (longBodyLinesCount > 0) {
      tips.push(`${longBodyLinesCount} line(s) in the body exceed 72 columns.`);
    }

    return {
      subjectLength: subjectLen,
      lengthStatus,
      issues,
      tips,
      isValid: issues.length === 0
    };
  }

  return {
    lint,
    NON_IMPERATIVE_MAP
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommitLinter;
}
