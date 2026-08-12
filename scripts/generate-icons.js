import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceImage = path.resolve('public/app-icon.png');
const resDir = path.resolve('android/app/src/main/res');

const densities = [
  { name: 'mipmap-mdpi', iconSize: 48, foregroundSize: 108, logoSize: 72 },
  { name: 'mipmap-hdpi', iconSize: 72, foregroundSize: 162, logoSize: 108 },
  { name: 'mipmap-xhdpi', iconSize: 96, foregroundSize: 216, logoSize: 144 },
  { name: 'mipmap-xxhdpi', iconSize: 144, foregroundSize: 324, logoSize: 216 },
  { name: 'mipmap-xxxhdpi', iconSize: 192, foregroundSize: 432, logoSize: 288 },
];

async function generateIcons() {
  console.log('Generating Android app icons from', sourceImage);

  for (const density of densities) {
    const dir = path.join(resDir, density.name);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 1. Standard ic_launcher.png (square)
    await sharp(sourceImage)
      .resize(density.iconSize, density.iconSize)
      .toFile(path.join(dir, 'ic_launcher.png'));

    // 2. Circular mask for ic_launcher_round.png
    const circleSvg = Buffer.from(
      `<svg width="${density.iconSize}" height="${density.iconSize}">
        <circle cx="${density.iconSize / 2}" cy="${density.iconSize / 2}" r="${density.iconSize / 2}" fill="#fff"/>
      </svg>`
    );

    const resizedForRound = await sharp(sourceImage)
      .resize(density.iconSize, density.iconSize)
      .toBuffer();

    await sharp(resizedForRound)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // 3. Adaptive ic_launcher_foreground.png (transparent background, padded logo)
    const resizedLogo = await sharp(sourceImage)
      .resize(density.logoSize, density.logoSize)
      .toBuffer();

    await sharp({
      create: {
        width: density.foregroundSize,
        height: density.foregroundSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{
        input: resizedLogo,
        top: Math.round((density.foregroundSize - density.logoSize) / 2),
        left: Math.round((density.foregroundSize - density.logoSize) / 2)
      }])
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`✅ Generated icons for ${density.name}`);
  }
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
