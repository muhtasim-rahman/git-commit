/**
 * GitCommit Pro v3 - Shell Escaping Engine
 * Production-tested escaping across Unix Bash, Zsh, PowerShell, Windows CMD, Fish, and Git Bash.
 */

const ShellEscaper = (() => {

  /**
   * Parse multiline text into structured paragraphs.
   * Preserves intentional paragraph boundaries without producing empty duplicate lines.
   */
  function parseParagraphs(text) {
    if (!text || !text.trim()) return [];
    
    // Normalize CRLF to LF
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split by two or more newlines (paragraphs)
    const rawParagraphs = normalized.split(/\n{2,}/);
    
    const paragraphs = [];
    rawParagraphs.forEach(para => {
      const trimmed = para.trim();
      if (trimmed) {
        paragraphs.push(trimmed);
      }
    });

    return paragraphs;
  }

  /**
   * Escape a string safely for Bash / Zsh double-quoted arguments.
   * Handles backslashes, double quotes, backticks, dollar signs, and history expansion '!'.
   */
  function escapeBashDoubleQuote(str) {
    return str
      .replace(/\\/g, '\\\\')    // Backslash first
      .replace(/"/g, '\\"')      // Double quotes
      .replace(/`/g, '\\`')      // Backticks
      .replace(/\$/g, '\\$')     // Variables / subexpressions
      .replace(/!/g, '"\'!\'"'); // Safe exclamation in interactive bash
  }

  /**
   * Escape a string for ANSI-C Quoting in Bash/Zsh ($'...')
   * Allows single-command multiline commit with literal newlines.
   */
  function escapeAnsiC(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '')
      .replace(/!/g, '\\!');
  }

  /**
   * Escape a string for PowerShell double quotes.
   * In PowerShell, backticks and dollar signs trigger interpolation.
   * When invoking native executables (git.exe), quotes must be escaped safely.
   */
  function escapePowerShell(str) {
    return str
      .replace(/`/g, '``')       // PowerShell escape char is backtick
      .replace(/\$/g, '`$')      // Prevent variable interpolation
      .replace(/"/g, '`"')       // PowerShell quote escape
      .replace(/\n/g, '`n')      // PowerShell newline
      .replace(/\r/g, '');
  }

  /**
   * Escape a string for Windows CMD (cmd.exe).
   * Inside double quotes, CMD does NOT use carets for & | < > ^.
   * Environment variables like %VAR% or standalone % must be escaped as %%.
   * Internal quotes are escaped as \" for MS C Runtime parser.
   */
  function escapeCmd(str) {
    return str
      .replace(/%/g, '%%')       // Prevent env var expansion
      .replace(/"/g, '\\"');     // Escape quotes for git.exe argv
  }

  /**
   * Escape for Fish Shell.
   */
  function escapeFish(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\$/g, '\\$');
  }

  /**
   * Main compile method.
   * @param {Object} options
   * @param {string} options.rawText - The full commit message (subject + body + footers)
   * @param {string} options.shell - 'bash' | 'powershell' | 'cmd' | 'fish' | 'ansi' | 'raw'
   * @param {Array<string>} options.flags - e.g. ['-a', '--amend', '--no-verify', '-s']
   * @param {string} options.chaining - 'none' | 'add_commit' | 'add_commit_push'
   * @param {string} options.branch - Branch name for push chaining (default 'main')
   * @returns {Object} { command, rawMessage, paragraphs }
   */
  function compile(options = {}) {
    const {
      rawText = '',
      shell = 'bash',
      flags = [],
      chaining = 'none',
      branch = 'main'
    } = options;

    const trimmed = (rawText || '').trim();
    if (!trimmed) {
      return {
        command: 'git commit -m "Your commit message will appear here..."',
        rawMessage: '',
        paragraphs: []
      };
    }

    const paragraphs = parseParagraphs(trimmed);
    const flagsString = flags.length > 0 ? ` ${flags.join(' ')}` : '';

    // RAW mode - for VS Code, JetBrains, GitHub Web commit box
    if (shell === 'raw') {
      return {
        command: trimmed,
        rawMessage: trimmed,
        paragraphs
      };
    }

    let commitCommand = `git commit${flagsString}`;

    // ANSI-C Quoting mode (Bash / Zsh / Git Bash single string)
    if (shell === 'ansi') {
      const escaped = escapeAnsiC(trimmed);
      commitCommand += ` -m $'${escaped}'`;
    }
    // Windows CMD
    else if (shell === 'cmd') {
      // In CMD, Git treats each -m as a separate paragraph
      paragraphs.forEach(p => {
        // Flatten multiple lines inside paragraph into spaces if needed, or escape
        const escaped = escapeCmd(p);
        commitCommand += ` -m "${escaped}"`;
      });
    }
    // PowerShell
    else if (shell === 'powershell') {
      paragraphs.forEach(p => {
        const escaped = escapePowerShell(p);
        commitCommand += ` -m "${escaped}"`;
      });
    }
    // Fish Shell
    else if (shell === 'fish') {
      paragraphs.forEach(p => {
        const escaped = escapeFish(p);
        commitCommand += ` -m "${escaped}"`;
      });
    }
    // Standard Unix Bash / Zsh (Default multi -m)
    else {
      paragraphs.forEach(p => {
        const escaped = escapeBashDoubleQuote(p);
        commitCommand += ` -m "${escaped}"`;
      });
    }

    // Apply Chaining
    let finalCommand = commitCommand;
    const targetBranch = branch.trim() || 'main';

    if (chaining === 'add_commit') {
      finalCommand = `git add . && ${commitCommand}`;
    } else if (chaining === 'add_commit_push') {
      finalCommand = `git add . && ${commitCommand} && git push origin ${targetBranch}`;
    }

    return {
      command: finalCommand,
      rawMessage: trimmed,
      paragraphs
    };
  }

  return {
    compile,
    parseParagraphs,
    escapeBashDoubleQuote,
    escapeAnsiC,
    escapePowerShell,
    escapeCmd,
    escapeFish
  };

})();

// Export for Node testing or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShellEscaper;
}
