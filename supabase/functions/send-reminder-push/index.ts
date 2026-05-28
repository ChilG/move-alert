import { createClient } from 'npm:@supabase/supabase-js@2';

import { getBatchLimit, getBearerToken, runDueReminderPushes } from '../_shared/reminder-runner.ts';

const defaultBatchLimit = 100;
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseSecretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}') as Record<string, string>;
const supabaseSecretKey = supabaseSecretKeys.default;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEYS.default.');
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
  },
});

function isCronRequestAuthorized(request: Request) {
  return getBearerToken(request) === supabaseSecretKey;
}

Deno.serve(async (request) => {
  if (!isCronRequestAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'Cron authorization is required.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  try {
    const summary = await runDueReminderPushes(supabase, getBatchLimit(defaultBatchLimit));

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unable to run reminder scheduler.',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
