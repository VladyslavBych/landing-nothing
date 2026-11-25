import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const RAW_DIR = path.resolve('src/assets/raw-images');
const OUT_DIR = path.resolve('public/images');

async function optimizeImages() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = await fs.readdir(RAW_DIR);
  const imageFiles = files.filter((file) =>
      /\.(png|jpe?g|webp)$/i.test(file),
  );

  for (const file of imageFiles) {
    const ext = path.extname(file);
    const name = path.basename(file, ext);
    const inputPath = path.join(RAW_DIR, file);

    const fullWidth = name === 'hero' || name === 'banner' ? 1440 : 720;
    const halfWidth = Math.floor(fullWidth / 2);

    for (const width of [halfWidth, fullWidth]) {
      const pipeline = sharp(inputPath).resize({
        width,
        withoutEnlargement: true,
      });

      await pipeline
          .clone()
          .avif({ quality: 65 })
          .toFile(path.join(OUT_DIR, `${name}-${width}.avif`));

      await pipeline
          .clone()
          .webp({ quality: 80 })
          .toFile(path.join(OUT_DIR, `${name}-${width}.webp`));

      await pipeline
          .clone()
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(path.join(OUT_DIR, `${name}-${width}.jpg`));
    }

    console.log(`Optimized: ${name} (${halfWidth}w, ${fullWidth}w)`);
  }
}

optimizeImages().catch((err) => {
  console.error('Image optimization failed:', err);
  process.exit(1);
});