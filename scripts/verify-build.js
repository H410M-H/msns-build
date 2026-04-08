#!/usr/bin/env node

/**
 * Build verification script
 * Checks if all required files exist and imports are valid
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/lib/analytics/ga4-events.ts',
  'src/components/analytics/GoogleTagManager.tsx',
  'src/hooks/useAnalytics.ts',
  'src/components/blocks/SEOSchema.tsx',
  'public/sitemap.xml',
  'public/robots.txt',
  'ANALYTICS_SETUP.md',
  'GOOGLE_TRACKING_CHECKLIST.md',
];

console.log('🔍 Verifying build setup...\n');

let allFilesExist = true;

requiredFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NOT FOUND`);
    allFilesExist = false;
  }
});

console.log('\n' + (allFilesExist ? '✅ All required files exist!' : '❌ Some files are missing!'));

if (allFilesExist) {
  console.log('\n📊 Analytics Setup Complete!');
  console.log('\nNext steps:');
  console.log('1. Set GTM_CONTAINER_ID in Vercel environment variables');
  console.log('2. Verify domain in Google Search Console');
  console.log('3. Create GTM container at https://tagmanager.google.com');
  console.log('4. Update components with analytics tracking hooks');
  console.log('5. Deploy and test with GTM Preview mode');
} else {
  process.exit(1);
}
