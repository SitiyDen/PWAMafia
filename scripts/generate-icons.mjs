/**
 * Генерирует иконки для PWA с логотипом на черном фоне
 * Запуск: node scripts/generate-icons.mjs
 */
import { mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');
const logoPath = join(__dirname, '..', 'src', 'assets', 'logoPS.png');

if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });

async function generateIcons() {
  try {
    const sizes = [192, 512];

    for (const size of sizes) {
      const iconPath = join(iconsDir, `icon-${size}.png`);

      // Создаем черный фон
      const background = Buffer.alloc(size * size * 4);
      for (let i = 0; i < background.length; i += 4) {
        background[i] = 0;     // R
        background[i + 1] = 0; // G
        background[i + 2] = 0; // B
        background[i + 3] = 255; // A
      }

      // Вычисляем размер логотипа (78% от размера иконки)
      const logoSize = Math.floor(size * 0.78);

      // Масштабируем логотип и накладываем на черный фон
      await sharp(logoPath)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer()
        .then((logoBuffer) => {
          const left = Math.floor((size - logoSize) / 2);
          const top = Math.floor((size - logoSize) / 2);

          return sharp({
            create: {
              width: size,
              height: size,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 1 },
            },
          })
            .composite([
              {
                input: logoBuffer,
                left,
                top,
              },
            ])
            .png()
            .toFile(iconPath);
        });

      console.log(`✓ Создана иконка ${size}x${size}`);
    }

    console.log('✓ Иконки PWA успешно созданы в public/icons/');
  } catch (error) {
    console.error('Ошибка при создании иконок:', error.message);
    process.exit(1);
  }
}

generateIcons();
