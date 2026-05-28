import { createClient } from 'npm:@supabase/supabase-js@2';

import {
  getBearerToken,
  parseSupabasePublishableKeys,
  sendManualReminderPushToUser,
} from '../_shared/reminder-runner.ts';

type ManualReminderRequestBody = {
  userId?: unknown;
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseSecretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}') as Record<string, string>;
const supabaseSecretKey = supabaseSecretKeys.default;
const supabasePublishableKeys = [
  ...parseSupabasePublishableKeys(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')),
  ...parseSupabasePublishableKeys(Deno.env.get('SUPABASE_ANON_KEY')),
];

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEYS.default.');
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
  },
});

function isPublishableKeyAuthorized(request: Request) {
  const apiKey = request.headers.get('apikey') ?? '';

  return supabasePublishableKeys.includes(apiKey);
}

async function readBody(request: Request): Promise<ManualReminderRequestBody> {
  return (await request.json().catch(() => ({}))) as ManualReminderRequestBody;
}

Deno.serve(async (request) => {
  if (!isPublishableKeyAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'Supabase publishable key is required.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'User session authorization is required.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  try {
    const [{ data: userData, error: userError }, body] = await Promise.all([
      supabase.auth.getUser(accessToken),
      readBody(request),
    ]);
    const sessionUserId = userData.user?.id;
    const requestedUserId = typeof body.userId === 'string' ? body.userId : '';

    if (userError || !sessionUserId) {
      return new Response(JSON.stringify({ error: 'Invalid user session.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    if (!requestedUserId || requestedUserId !== sessionUserId) {
      return new Response(JSON.stringify({ error: 'Requested user does not match the current session.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const summary = await sendManualReminderPushToUser(supabase, sessionUserId);

    return new Response(JSON.stringify({ source: 'manual', userId: sessionUserId, ...summary }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unable to send manual reminder push.',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
