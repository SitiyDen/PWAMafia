/**
 * Генерирует иконки для PWA
 * Запуск: node scripts/generate-icons.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

// Минимальный валидный PNG 1x1 — браузер масштабирует при установке PWA
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });
writeFileSync(join(iconsDir, 'icon-192.png'), minimalPng);
writeFileSync(join(iconsDir, 'icon-512.png'), minimalPng);
console.log('Иконки созданы в public/icons/');
