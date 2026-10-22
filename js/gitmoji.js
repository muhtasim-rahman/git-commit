/**
 * GitCommit Pro v3 - Gitmoji Directory
 * Complete searchable catalog of standard Gitmojis with categories.
 */

const GitmojiCatalog = (() => {

  const GITMOJIS = [
    // Features & Enhancements
    { emoji: '✨', code: ':sparkles:', desc: 'Introduce new features', category: 'features' },
    { emoji: '🎉', code: ':tada:', desc: 'Begin a project / Initial commit', category: 'features' },
    { emoji: '🚀', code: ':rocket:', desc: 'Deploy stuff', category: 'features' },
    { emoji: '📱', code: ':iphone:', desc: 'Work on responsive design', category: 'features' },
    { emoji: '🌐', code: ':globe_with_meridians:', desc: 'Internationalization and localization', category: 'features' },
    { emoji: '♿️', code: ':wheelchair:', desc: 'Improve accessibility', category: 'features' },
    { emoji: '🚸', code: ':children_crossing:', desc: 'Improve user experience / usability', category: 'features' },
    { emoji: '💡', code: ':bulb:', desc: 'Add or update comments in source code', category: 'features' },

    // Bug Fixes
    { emoji: '🐛', code: ':bug:', desc: 'Fix a bug', category: 'fixes' },
    { emoji: '🚑️', code: ':ambulance:', desc: 'Critical hotfix', category: 'fixes' },
    { emoji: '🔒️', code: ':lock:', desc: 'Fix security or privacy issues', category: 'fixes' },
    { emoji: '🩹', code: ':adhesive_bandage:', desc: 'Simple fix for a non-critical issue', category: 'fixes' },
    { emoji: '💚', code: ':green_heart:', desc: 'Fix CI Build', category: 'fixes' },
    { emoji: '🩺', code: ':stethoscope:', desc: 'Add or update healthcheck', category: 'fixes' },
    { emoji: '🚨', code: ':rotating_light:', desc: 'Fix compiler / linter warnings', category: 'fixes' },

    // Refactoring & Code Quality
    { emoji: '♻️', code: ':recycle:', desc: 'Refactor code', category: 'refactor' },
    { emoji: '⚡️', code: ':zap:', desc: 'Improve performance', category: 'performance' },
    { emoji: '🔥', code: ':fire:', desc: 'Remove code or files', category: 'refactor' },
    { emoji: '🎨', code: ':art:', desc: 'Improve structure / format of code', category: 'refactor' },
    { emoji: '🏗️', code: ':building_construction:', desc: 'Make architectural changes', category: 'refactor' },
    { emoji: '💄', code: ':lipstick:', desc: 'Add or update UI and style files', category: 'refactor' },
    { emoji: '🧹', code: ':broom:', desc: 'Deprecate or clean up obsolete code', category: 'refactor' },
    { emoji: '🧵', code: ':thread:', desc: 'Add or update code related to multithreading', category: 'performance' },

    // Documentation
    { emoji: '📝', code: ':memo:', desc: 'Add or update documentation', category: 'docs' },
    { emoji: '📄', code: ':page_facing_up:', desc: 'Add or update license', category: 'docs' },
    { emoji: '🍻', code: ':beers:', desc: 'Write code drunkenly', category: 'docs' },
    { emoji: '💬', code: ':speech_balloon:', desc: 'Add or update text and literals', category: 'docs' },

    // Tooling & DevOps
    { emoji: '🔧', code: ':wrench:', desc: 'Add or update configuration files', category: 'tools' },
    { emoji: '🔨', code: ':hammer:', desc: 'Add or update development scripts', category: 'tools' },
    { emoji: '📦', code: ':package:', desc: 'Add or update compiled files or packages', category: 'tools' },
    { emoji: '👷', code: ':construction_worker:', desc: 'Add or update CI build system', category: 'tools' },
    { emoji: '🐳', code: ':whale:', desc: 'Work with Docker', category: 'tools' },
    { emoji: '☸️', code: ':wheel_of_dharma:', desc: 'Work with Kubernetes', category: 'tools' },
    { emoji: '⬆️', code: ':arrow_up:', desc: 'Upgrade dependencies', category: 'tools' },
    { emoji: '⬇️', code: ':arrow_down:', desc: 'Downgrade dependencies', category: 'tools' },
    { emoji: '📌', code: ':pushpin:', desc: 'Pin dependencies to specific versions', category: 'tools' },
    { emoji: '➕', code: ':heavy_plus_sign:', desc: 'Add a dependency', category: 'tools' },
    { emoji: '➖', code: ':heavy_minus_sign:', desc: 'Remove a dependency', category: 'tools' },

    // Testing & Releases
    { emoji: '✅', code: ':white_check_mark:', desc: 'Add, update, or pass tests', category: 'tests' },
    { emoji: '🧪', code: ':test_tube:', desc: 'Add a failing test', category: 'tests' },
    { emoji: '🔖', code: ':bookmark:', desc: 'Release / Version tags', category: 'releases' },
    { emoji: '🏷️', code: ':label:', desc: 'Add or update types', category: 'tools' },
    { emoji: '💥', code: ':boom:', desc: 'Introduce breaking changes', category: 'features' },
    { emoji: '⏪️', code: ':rewind:', desc: 'Revert changes', category: 'fixes' },
    { emoji: '🔀', code: ':twisted_rightwards_arrows:', desc: 'Merge branches', category: 'releases' },
    { emoji: '🌱', code: ':seedling:', desc: 'Add or update seed files', category: 'tools' }
  ];

  function getAll() {
    return GITMOJIS;
  }

  function search(query = '', category = 'all') {
    const q = (query || '').toLowerCase().trim();
    
    return GITMOJIS.filter(item => {
      const matchesCat = (category === 'all') || (item.category === category);
      if (!matchesCat) return false;
      
      if (!q) return true;
      return (
        item.emoji.includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      );
    });
  }

  return {
    getAll,
    search
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitmojiCatalog;
}
