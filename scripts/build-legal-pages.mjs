import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, '.env');
const templateDir = path.join(repoRoot, 'legal', 'templates');
const outputDir = path.join(repoRoot, 'legal', 'dist');

function parseEnvFile(source) {
  return source.split('\n').reduce((accumulator, line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return accumulator;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex <= 0) {
      return accumulator;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    return {
      ...accumulator,
      [key]: value,
    };
  }, {});
}

async function loadEnv() {
  const envFile = await readFile(envPath, 'utf8');
  return {
    ...parseEnvFile(envFile),
    ...process.env,
  };
}

async function buildTemplate(templateFileName, replacements) {
  const templatePath = path.join(templateDir, templateFileName);
  const template = await readFile(templatePath, 'utf8');

  return Object.entries(replacements).reduce(
    (html, [placeholder, value]) => html.replaceAll(`{{${placeholder}}}`, value),
    template,
  );
}

async function main() {
  const env = await loadEnv();
  const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.',
    );
  }

  await mkdir(outputDir, { recursive: true });

  const replacements = {
    ACCOUNT_DELETION_URL: './account-deletion.html',
    SUPABASE_ANON_KEY: supabaseKey,
    SUPABASE_URL: supabaseUrl,
  };

  const privacyPolicyHtml = await buildTemplate(
    'privacy-policy.template.html',
    replacements,
  );
  const accountDeletionHtml = await buildTemplate(
    'account-deletion.template.html',
    replacements,
  );

  await Promise.all([
    writeFile(path.join(outputDir, 'privacy-policy.html'), privacyPolicyHtml),
    writeFile(
      path.join(outputDir, 'account-deletion.html'),
      accountDeletionHtml,
    ),
  ]);

  process.stdout.write(`Built legal pages in ${outputDir}\n`);
}

void main();
