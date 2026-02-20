import { execSync } from 'child_process';

console.log('[v0] Starting build...');

try {
  const output = execSync('npm run build', {
    cwd: '/vercel/share/v0-project',
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  console.log(output);
  console.log('[v0] Build succeeded!');
} catch (error) {
  console.error('[v0] Build failed:');
  console.error(error.stdout);
  console.error(error.stderr);
  process.exit(1);
}
