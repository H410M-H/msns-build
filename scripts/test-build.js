import { spawnSync } from 'child_process';

console.log('[v0] Starting build test...');

const result = spawnSync('npm', ['run', 'build'], {
  cwd: '/vercel/share/v0-project',
  encoding: 'utf-8'
});

console.log('[v0] STDOUT:');
console.log(result.stdout || 'No output');
console.log('[v0] STDERR:');
console.log(result.stderr || 'No errors');
console.log('[v0] Exit code:', result.status);
console.log('[v0] Signal:', result.signal);
