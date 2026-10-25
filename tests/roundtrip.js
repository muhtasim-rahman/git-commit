// Runs generated Bash commands in a throwaway repo and compares git's stored message with the expected one.
// Usage: node tests/roundtrip.js   (needs git and bash)
const { execSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const E = require('../js/escaper.js');
const samples = [
  'v1.0.0 Initial Release\n- Feature A\n- Feature B',
  'fix: `getUser()` $HOME "quoted" \'single\' !bang \\ back\\slash C:\\Users\\x\\',
  'Title\n\nPara with 100% & | < > ^ ;\n\n- a\n- b $(echo no) `echo no`',
  'Unicode ✨ বাংলা 日本\n\nEOF\nGIT_COMMIT_EOF'
];
let bad = 0, n = 0;
for (const mode of ['stream', 'compact']) for (const labels of [false, true]) for (const s of samples) {
  n++;
  const g = E.generate(s, { shell: 'bash', mode, sections: false, fences: false, smart: false, split: true, labels });
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'gcp-'));
  execSync('git init -q && git config user.email t@t && git config user.name t', { cwd: d });
  execSync(g.cmd.replace('git commit', 'git commit -q --allow-empty'), { cwd: d, shell: '/bin/bash' });
  const got = execSync('git log -1 --format=%B', { cwd: d }).toString().trimEnd();
  if (got !== g.message) { bad++; console.log('FAIL', mode, labels, JSON.stringify(s), '\n got:', JSON.stringify(got), '\n exp:', JSON.stringify(g.message)); }
}
const f = E.generate('feat: x', { shell: 'bash', mode: 'compact', split: true, signoff: true, noverify: true, add: true, push: true });
if (!/git add -A && git commit --no-verify --signoff -m 'feat: x' && git push$/.test(f.cmd)) { bad++; console.log('FAIL flags', f.cmd); }
n++;
console.log(bad ? bad + ' failed' : 'All round-trips passed (' + n + ' cases)');
process.exit(bad ? 1 : 0);
