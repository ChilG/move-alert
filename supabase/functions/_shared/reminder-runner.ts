import {
  getNextServerReminderDate,
  getReminderPushMessage,
  isQuietHoursActiveForTimezone,
  type ReminderScheduleInput,
} from './reminder-helpers.ts';

type SupabaseClientLike = {
  auth: {
    getUser: (accessToken: string) => Promise<{ data: { user?: { id?: string } | null }; error: Error | null }>;
  };
  from: (table: string) => {
    insert: (values: Record<string, unknown>) => Promise<{ error: Error | null }>;
    select: (columns: string) => {
      eq: (
        column: string,
        value: unknown,
      ) => {
        eq: (
          column: string,
          value: unknown,
        ) => {
          order: (
            column: string,
            options: { ascending: boolean },
          ) => Promise<{ data: unknown[] | null; error: Error | null }>;
        };
      };
      order: (
        column: string,
        options: { ascending: boolean },
      ) => {
        limit: (count: number) => Promise<{ data: unknown[] | null; error: Error | null }>;
      };
    };
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: unknown) => Promise<{ error: Error | null }>;
    };
  };
  rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown[] | null; error: Error | null }>;
};

type ClaimedReminderRow = {
  interval_minutes: number;
  next_reminder_at: string;
  quiet_hours_days: number[];
  quiet_hours_enabled: boolean;
  quiet_hours_end_time: string;
  quiet_hours_start_time: string;
  timezone: string;
  user_id: string;
};

type PushTokenRow = {
  expo_push_token: string;
  id: string;
  language: string;
  timezone: string;
};

type ExpoPushTicket = {
  details?: {
    error?: string;
  };
  id?: string;
  message?: string;
  status: 'error' | 'ok';
};

type ExpoPushResponse = {
  data?: ExpoPushTicket | ExpoPushTicket[];
  errors?: Array<{ message?: string }>;
};

export type ReminderRunSummary = {
  claimed: number;
  failed: number;
  sent: number;
  skipped: number;
};

const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
type ReminderPushSource = 'manual' | 'server';

function toScheduleInput(row: ClaimedReminderRow, timezone: string): ReminderScheduleInput {
  return {
    intervalMinutes: row.interval_minutes,
    nextReminderAt: row.next_reminder_at,
    quietHoursDays: row.quiet_hours_days,
    quietHoursEnabled: row.quiet_hours_enabled,
    quietHoursEndTime: row.quiet_hours_end_time,
    quietHoursStartTime: row.quiet_hours_start_time,
    timezone,
  };
}

function normalizeExpoTickets(response: ExpoPushResponse, tokenCount: number) {
  const tickets = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];

  return Array.from({ length: tokenCount }, (_, index) => tickets[index] ?? null);
}

export function getBearerToken(request: Request) {
  return (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
}

export function parseSupabasePublishableKeys(value: string | undefined) {
  if (!value) return [];

  try {
    const parsedValue = JSON.parse(value) as string | Record<string, string>;

    return typeof parsedValue === 'string' ? [parsedValue] : Object.values(parsedValue);
  } catch {
    return [value];
  }
}

export function getBatchLimit(defaultBatchLimit: number) {
  const parsedLimit = Number(Deno.env.get('REMINDER_BATCH_LIMIT') ?? defaultBatchLimit);

  return Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : defaultBatchLimit;
}

async function writeDeliveryLog({
  errorMessage,
  pushTokenId,
  scheduledFor,
  status,
  supabase,
  userId,
}: {
  errorMessage?: string | null;
  pushTokenId?: string | null;
  scheduledFor: string | null;
  status: 'failed' | 'invalid_token' | 'no_active_tokens' | 'sent' | 'skipped_quiet_hours';
  supabase: SupabaseClientLike;
  userId: string;
}) {
  await supabase.from('move_alert_push_delivery_logs').insert({
    error_message: errorMessage ?? null,
    push_token_id: pushTokenId ?? null,
    scheduled_for: scheduledFor,
    status,
    user_id: userId,
  });
}

async function advanceReminder(supabase: SupabaseClientLike, row: ClaimedReminderRow, now: Date) {
  const nextReminderDate = getNextServerReminderDate(toScheduleInput(row, row.timezone), now);

  await supabase
    .from('move_alert_settings')
    .update({
      last_reminder_sent_at: now.toISOString(),
      next_reminder_at: nextReminderDate.toISOString(),
      reminder_processing_at: null,
    })
    .eq('user_id', row.user_id);
}

async function unlockReminder(supabase: SupabaseClientLike, row: ClaimedReminderRow) {
  await supabase
    .from('move_alert_settings')
    .update({
      reminder_processing_at: null,
    })
    .eq('user_id', row.user_id);
}

async function getActivePushTokens(supabase: SupabaseClientLike, userId: string) {
  const { data: tokens, error: tokensError } = await supabase
    .from('move_alert_push_tokens')
    .select('id, expo_push_token, language, timezone')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_seen_at', { ascending: false });

  if (tokensError) {
    throw tokensError;
  }

  return (tokens ?? []) as PushTokenRow[];
}

async function sendReminderPush(
  row: Pick<ClaimedReminderRow, 'next_reminder_at'>,
  tokens: PushTokenRow[],
  source: ReminderPushSource,
) {
  const messages = tokens.map((token) => {
    const message = getReminderPushMessage(token.language);

    return {
      body: message.body,
      channelId: 'move-reminders-signature-v2',
      data: {
        scheduledAt: row.next_reminder_at,
        scope: 'move-reminder',
        source,
      },
      priority: 'high',
      sound: 'default',
      title: message.title,
      to: token.expo_push_token,
    };
  });
  const response = await fetch(expoPushUrl, {
    body: JSON.stringify(messages),
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const responseBody = (await response.json().catch(() => ({}))) as ExpoPushResponse;

  if (!response.ok || responseBody.errors?.length) {
    const message = responseBody.errors
      ?.map((error) => error.message)
      .filter(Boolean)
      .join('; ');

    throw new Error(message || `Expo Push API returned HTTP ${response.status}`);
  }

  return normalizeExpoTickets(responseBody, tokens.length);
}

async function writeTicketLogs({
  scheduledFor,
  supabase,
  tickets,
  tokens,
  userId,
}: {
  scheduledFor: string;
  supabase: SupabaseClientLike;
  tickets: Array<ExpoPushTicket | null>;
  tokens: PushTokenRow[];
  userId: string;
}) {
  await Promise.all(
    tokens.map(async (token, index) => {
      const ticket = tickets[index];
      const ticketError = ticket?.details?.error;
      const isInvalidToken = ticketError === 'DeviceNotRegistered';
      const isSent = ticket?.status === 'ok';

      if (isInvalidToken) {
        await supabase.from('move_alert_push_tokens').update({ is_active: false }).eq('id', token.id);
      }

      await writeDeliveryLog({
        errorMessage: isSent ? null : ticket?.message || ticketError || 'Expo push ticket failed.',
        pushTokenId: token.id,
        scheduledFor,
        status: isSent ? 'sent' : isInvalidToken ? 'invalid_token' : 'failed',
        supabase,
        userId,
      });
    }),
  );
}

async function processReminder(supabase: SupabaseClientLike, row: ClaimedReminderRow) {
  const scheduledFor = row.next_reminder_at;
  const now = new Date();
  const activeTokens = await getActivePushTokens(supabase, row.user_id);

  if (activeTokens.length === 0) {
    await writeDeliveryLog({
      errorMessage: 'No active Expo push tokens for user.',
      scheduledFor,
      status: 'no_active_tokens',
      supabase,
      userId: row.user_id,
    });
    await advanceReminder(supabase, row, now);
    return { sent: 0, skipped: 1 };
  }

  const deliverableTokens = activeTokens.filter((token) => {
    return !isQuietHoursActiveForTimezone(toScheduleInput(row, token.timezone || row.timezone), now);
  });

  if (deliverableTokens.length === 0) {
    await writeDeliveryLog({
      scheduledFor,
      status: 'skipped_quiet_hours',
      supabase,
      userId: row.user_id,
    });
    await advanceReminder(supabase, row, now);
    return { sent: 0, skipped: activeTokens.length };
  }

  const tickets = await sendReminderPush(row, deliverableTokens, 'server');

  await writeTicketLogs({ scheduledFor, supabase, tickets, tokens: deliverableTokens, userId: row.user_id });
  await advanceReminder(supabase, row, now);

  return {
    sent: tickets.filter((ticket) => ticket?.status === 'ok').length,
    skipped: activeTokens.length - deliverableTokens.length,
  };
}

export async function sendManualReminderPushToUser(
  supabase: SupabaseClientLike,
  userId: string,
): Promise<ReminderRunSummary> {
  const scheduledFor = new Date().toISOString();
  const activeTokens = await getActivePushTokens(supabase, userId);

  if (activeTokens.length === 0) {
    await writeDeliveryLog({
      errorMessage: 'No active Expo push tokens for user.',
      scheduledFor,
      status: 'no_active_tokens',
      supabase,
      userId,
    });

    return {
      claimed: 0,
      failed: 0,
      sent: 0,
      skipped: 1,
    };
  }

  const tickets = await sendReminderPush({ next_reminder_at: scheduledFor }, activeTokens, 'manual');

  await writeTicketLogs({ scheduledFor, supabase, tickets, tokens: activeTokens, userId });

  return {
    claimed: 0,
    failed: tickets.filter((ticket) => ticket?.status !== 'ok').length,
    sent: tickets.filter((ticket) => ticket?.status === 'ok').length,
    skipped: 0,
  };
}

export async function runDueReminderPushes(
  supabase: SupabaseClientLike,
  batchLimit: number,
): Promise<ReminderRunSummary> {
  const { data, error } = await supabase.rpc('move_alert_claim_due_reminders', {
    batch_limit: batchLimit,
  });

  if (error) {
    throw error;
  }

  const claimedRows = ((data ?? []) as ClaimedReminderRow[]).filter((row) => row.next_reminder_at);
  const summary = {
    claimed: claimedRows.length,
    failed: 0,
    sent: 0,
    skipped: 0,
  };

  for (const row of claimedRows) {
    try {
      const result = await processReminder(supabase, row);
      summary.sent += result.sent;
      summary.skipped += result.skipped;
    } catch (reminderError) {
      summary.failed += 1;
      await writeDeliveryLog({
        errorMessage: reminderError instanceof Error ? reminderError.message : 'Unable to process reminder.',
        scheduledFor: row.next_reminder_at,
        status: 'failed',
        supabase,
        userId: row.user_id,
      });
      await unlockReminder(supabase, row);
    }
  }

  return summary;
}
