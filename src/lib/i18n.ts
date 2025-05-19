import path from 'path';
import fs from 'fs/promises';

export async function loadTranslations(locale: string, namespace: string) {
  const filePath = path.resolve(
    process.cwd(),
    'src/locales',
    locale,
    `${namespace}.json`
  );
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}