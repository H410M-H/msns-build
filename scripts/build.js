import { execSync } from 'child_process';

try {
  console.log('Building project...');
  execSync('npm run build', { 
    cwd: '/vercel/share/v0-project',
    stdio: 'inherit' 
  });
  console.log('Build successful!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
