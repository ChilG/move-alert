import * as Haptics from 'expo-haptics';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { z } from 'zod';

import {
  subscribeToReminderNotificationResponsesAsync,
  syncReminderNotificationsAsync,
} from '@/components/move-alert/reminder-notifications';
import { useAuth } from '@/components/move-alert/auth-state';
import { useLanguagePreference } from '@/components/move-alert/language-state';
import { supabase } from '@/lib/supabase';
import {
  activityTemplateDescriptionKeys,
  activityTemplateDurationKeys,
  activityTemplateTargetKeys,
  activityTemplateTitleKeys,
  activityTemplateTones,
  defaultActivityTemplates,
  defaultQuietHoursDays,
  initialTimeline,
  reminderIntervals,
  timelineLabelKeys,
  timelineStatuses,
  weekDays,
  type StretchItem,
  type TimelineItem,
  type WeekDay,
} from './move-alert-data';

type MoveAlertState = {
  completedToday: number;
  skippedToday: number;
  streakDays: number;
  intervalMinutes: number;
  reminderEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStartTime: string;
  quietHoursEndTime: string;
  quietHoursDays: WeekDay[];
  completedStretchCounts: Record<string, number>;
  completedStretchIds: string[];
  timeline: TimelineItem[];
};

type StretchCooldown = {
  activeStretchId: string;
  endsAt: number;
};

type SyncStatus = 'idle' | 'loading' | 'saving' | 'synced' | 'error';

type MoveAlertContextValue = {
  activityTemplates: StretchItem[];
  dailyGoal: number;
  state: MoveAlertState;
  progressPercent: number;
  completeStretch: (stretchId: string) => void;
  errorMessage: string | null;
  isSyncing: boolean;
  skipBreak: () => void;
  setIntervalMinutes: (intervalMinutes: number) => void;
  setQuietHoursEndTime: (time: string) => void;
  setQuietHoursStartTime: (time: string) => void;
  stretchCooldown: StretchCooldown | null;
  syncStatus: SyncStatus;
  toggleQuietHoursDay: (day: WeekDay) => void;
  toggleReminder: () => void;
  toggleQuietHours: () => void;
};

const initialState: MoveAlertState = {
  completedToday: 0,
  skippedToday: 0,
  streakDays: 0,
  intervalMinutes: 45,
  reminderEnabled: true,
  quietHoursEnabled: true,
  quietHoursStartTime: '22:00',
  quietHoursEndTime: '07:00',
  quietHoursDays: defaultQuietHoursDays,
  completedStretchCounts: {},
  completedStretchIds: [],
  timeline: initialTimeline,
};

const moveAlertSettingsRowSchema = z.object({
  interval_minutes: z
    .number()
    .int()
    .refine((value) => reminderIntervals.includes(value))
    .catch(initialState.intervalMinutes),
  quiet_hours_enabled: z.boolean().catch(initialState.quietHoursEnabled),
  quiet_hours_end_time: z.string().catch(initialState.quietHoursEndTime),
  quiet_hours_start_time: z.string().catch(initialState.quietHoursStartTime),
  quiet_hours_days: z
    .array(z.number().int())
    .catch(initialState.quietHoursDays),
  reminder_enabled: z.boolean().catch(initialState.reminderEnabled),
});

const moveAlertDailySummaryRowSchema = z.object({
  completed_count: z.number().int().min(0).catch(initialState.completedToday),
  skipped_count: z.number().int().min(0).catch(initialState.skippedToday),
  streak_days: z.number().int().min(0).catch(initialState.streakDays),
});

const completedStretchRowSchema = z.object({
  completed_count: z.number().int().positive().catch(1),
  stretch_id: z.string(),
});

const activityTemplateRowSchema = z.object({
  completion_label_key: z.enum([
    'timeline.neckResetCompleted',
    'timeline.shoulderRollsCompleted',
    'timeline.wristReleaseCompleted',
    'timeline.deskBackStretchCompleted',
  ]),
  description_key: z.enum(activityTemplateDescriptionKeys),
  duration_key: z.enum(activityTemplateDurationKeys),
  duration_seconds: z.number().int().positive(),
  icon: z.string().min(1),
  id: z.string().min(1),
  target_key: z.enum(activityTemplateTargetKeys),
  title_key: z.enum(activityTemplateTitleKeys),
  tone: z.enum(activityTemplateTones),
});

const timelineItemRowSchema = z.object({
  item_time: z.string(),
  label_key: z.enum(timelineLabelKeys),
  status: z.enum(timelineStatuses),
});

const MoveAlertContext = createContext<MoveAlertContextValue | null>(null);
const SAVE_DEBOUNCE_MS = 400;

function tapFeedback() {
  Haptics.selectionAsync().catch(() => {});
}

function formatTimelineTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

function parseTimelineTime(time: string, date: Date) {
  const parsedTime = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!parsedTime) return null;

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number(parsedTime[1]),
    Number(parsedTime[2]),
  );
}

function getNextBreakTime(intervalMinutes: number, date: Date) {
  const nextBreak = new Date(date);
  nextBreak.setMinutes(nextBreak.getMinutes() + intervalMinutes);

  return formatTimelineTime(nextBreak);
}

function getCompletedTimelineLabelKey(
  stretchId: string,
  activityTemplates: StretchItem[],
): TimelineItem['labelKey'] {
  const activityTemplate = activityTemplates.find(
    (template) => template.id === stretchId,
  );

  return activityTemplate?.completionLabelKey ?? 'timeline.neckResetCompleted';
}

function getStretchCooldownMs(
  stretchId: string,
  activityTemplates: StretchItem[],
) {
  const stretch = activityTemplates.find((item) => item.id === stretchId);

  return stretch ? stretch.durationSeconds * 1000 : null;
}

function withNextMovementBreak(
  timelineItems: TimelineItem[],
  intervalMinutes: number,
  date: Date,
) {
  const timelineHistoryLimit = 5;
  const historyItems = timelineItems.filter((item) => item.status !== 'next');
  const visibleHistoryItems = historyItems.slice(-timelineHistoryLimit);

  return [
    ...visibleHistoryItems,
    {
      labelKey: 'timeline.nextMovementBreak',
      status: 'next',
      time: getNextBreakTime(intervalMinutes, date),
    },
  ] satisfies TimelineItem[];
}

function withTimelineEvent(
  state: MoveAlertState,
  event: Pick<TimelineItem, 'labelKey' | 'status'>,
  date: Date,
) {
  return withNextMovementBreak(
    [
      ...state.timeline,
      {
        ...event,
        time: formatTimelineTime(date),
      },
    ],
    state.intervalMinutes,
    date,
  );
}

function getLatestTimelineItemByStatus(
  timelineItems: TimelineItem[],
  status: TimelineItem['status'],
) {
  return timelineItems.reduce<TimelineItem | null>(
    (latestItem, item) => (item.status === status ? item : latestItem),
    null,
  );
}

function isWaitingForSkippedBreak(state: MoveAlertState, date: Date) {
  const latestHistoryItem = state.timeline
    .filter((item) => item.status !== 'next')
    .at(-1);
  const nextBreakItem = getLatestTimelineItemByStatus(state.timeline, 'next');
  const nextBreakDate = nextBreakItem
    ? parseTimelineTime(nextBreakItem.time, date)
    : null;

  return (
    latestHistoryItem?.labelKey === 'timeline.breakSkipped' &&
    nextBreakDate !== null &&
    nextBreakDate.getTime() > date.getTime()
  );
}

function getLocalDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function toSettingsRow(userId: string, state: MoveAlertState) {
  return {
    interval_minutes: state.intervalMinutes,
    quiet_hours_days: state.quietHoursDays,
    quiet_hours_end_time: state.quietHoursEndTime,
    quiet_hours_enabled: state.quietHoursEnabled,
    quiet_hours_start_time: state.quietHoursStartTime,
    reminder_enabled: state.reminderEnabled,
    user_id: userId,
  };
}

function toDailySummaryRow(
  userId: string,
  summaryDate: string,
  state: MoveAlertState,
) {
  return {
    completed_count: state.completedToday,
    skipped_count: state.skippedToday,
    streak_days: state.streakDays,
    summary_date: summaryDate,
    user_id: userId,
  };
}

function toCompletedStretchRows(
  userId: string,
  summaryDate: string,
  state: MoveAlertState,
) {
  return Object.entries(state.completedStretchCounts)
    .filter(([, completedCount]) => completedCount > 0)
    .map(([stretchId, completedCount]) => ({
      completed_count: completedCount,
      stretch_id: stretchId,
      summary_date: summaryDate,
      user_id: userId,
    }));
}

function toTimelineItemRows(
  userId: string,
  summaryDate: string,
  state: MoveAlertState,
) {
  return state.timeline.map((item, position) => ({
    item_time: item.time,
    label_key: item.labelKey,
    position,
    status: item.status,
    summary_date: summaryDate,
    user_id: userId,
  }));
}

function normalizeDatabaseTime(time: string) {
  const parsedTime = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(time);

  return parsedTime ? `${parsedTime[1]}:${parsedTime[2]}` : null;
}

function normalizeQuietHoursDays(days: number[]) {
  const validDays = days.filter((day): day is WeekDay =>
    weekDays.includes(day as WeekDay),
  );
  const uniqueDays = Array.from(new Set(validDays));

  return uniqueDays.length > 0 ? uniqueDays : initialState.quietHoursDays;
}

function getCompletedStretchCounts(
  rows: z.infer<typeof completedStretchRowSchema>[],
) {
  return rows.reduce<Record<string, number>>(
    (counts, row) => ({
      ...counts,
      [row.stretch_id]: row.completed_count,
    }),
    {},
  );
}

function fromDatabaseRows({
  completedStretchRows,
  dailySummaryRow,
  settingsRow,
  timelineRows,
}: {
  completedStretchRows: unknown[];
  dailySummaryRow: unknown;
  settingsRow: unknown;
  timelineRows: unknown[];
}): MoveAlertState {
  const parsedSettings = settingsRow
    ? moveAlertSettingsRowSchema.parse(settingsRow)
    : null;
  const parsedDailySummary = dailySummaryRow
    ? moveAlertDailySummaryRowSchema.parse(dailySummaryRow)
    : null;
  const parsedCompletedStretchRows = z
    .array(completedStretchRowSchema)
    .catch([])
    .parse(completedStretchRows);
  const parsedTimelineRows = z
    .array(timelineItemRowSchema)
    .catch([])
    .parse(timelineRows);
  const timeline = parsedTimelineRows
    .map((item) => {
      const time = normalizeDatabaseTime(item.item_time);

      return time
        ? {
            labelKey: item.label_key,
            status: item.status,
            time,
          }
        : null;
    })
    .filter((item): item is TimelineItem => item !== null);
  const completedStretchCounts = getCompletedStretchCounts(
    parsedCompletedStretchRows,
  );

  return {
    completedToday:
      parsedDailySummary?.completed_count ?? initialState.completedToday,
    completedStretchCounts,
    completedStretchIds: Object.keys(completedStretchCounts),
    intervalMinutes:
      parsedSettings?.interval_minutes ?? initialState.intervalMinutes,
    quietHoursDays: normalizeQuietHoursDays(
      parsedSettings?.quiet_hours_days ?? initialState.quietHoursDays,
    ),
    quietHoursEndTime:
      normalizeDatabaseTime(
        parsedSettings?.quiet_hours_end_time ?? initialState.quietHoursEndTime,
      ) ?? initialState.quietHoursEndTime,
    quietHoursEnabled:
      parsedSettings?.quiet_hours_enabled ?? initialState.quietHoursEnabled,
    quietHoursStartTime:
      normalizeDatabaseTime(
        parsedSettings?.quiet_hours_start_time ??
          initialState.quietHoursStartTime,
      ) ?? initialState.quietHoursStartTime,
    reminderEnabled:
      parsedSettings?.reminder_enabled ?? initialState.reminderEnabled,
    skippedToday:
      parsedDailySummary?.skipped_count ?? initialState.skippedToday,
    streakDays: parsedDailySummary?.streak_days ?? initialState.streakDays,
    timeline,
  };
}

function serializeValue(value: unknown) {
  return JSON.stringify(value);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to sync move alert.';
}

function fromActivityTemplateRows(rows: unknown[]): StretchItem[] {
  const parsedTemplates = z
    .array(activityTemplateRowSchema)
    .catch([])
    .parse(rows);

  if (parsedTemplates.length === 0) return defaultActivityTemplates;

  return parsedTemplates.map((template) => ({
    completionLabelKey: template.completion_label_key,
    descriptionKey: template.description_key,
    durationKey: template.duration_key,
    durationSeconds: template.duration_seconds,
    icon: template.icon,
    id: template.id,
    targetKey: template.target_key,
    titleKey: template.title_key,
    tone: template.tone,
  }));
}

async function loadMoveAlertState(userId: string, summaryDate: string) {
  const [
    activityTemplatesResult,
    settingsResult,
    dailySummaryResult,
    completedStretchesResult,
    timelineResult,
  ] = await Promise.all([
    supabase
      .from('move_alert_activity_templates')
      .select(
        [
          'id',
          'title_key',
          'target_key',
          'duration_key',
          'description_key',
          'duration_seconds',
          'icon',
          'tone',
          'completion_label_key',
        ].join(', '),
      )
      .eq('is_active', true)
      .order('position', { ascending: true }),
    supabase
      .from('move_alert_settings')
      .select(
        [
          'interval_minutes',
          'reminder_enabled',
          'quiet_hours_enabled',
          'quiet_hours_start_time',
          'quiet_hours_end_time',
          'quiet_hours_days',
        ].join(', '),
      )
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('move_alert_daily_summaries')
      .select('completed_count, skipped_count, streak_days')
      .eq('user_id', userId)
      .eq('summary_date', summaryDate)
      .maybeSingle(),
    supabase
      .from('move_alert_completed_stretches')
      .select('stretch_id, completed_count')
      .eq('user_id', userId)
      .eq('summary_date', summaryDate)
      .order('created_at', { ascending: true }),
    supabase
      .from('move_alert_timeline_items')
      .select('label_key, status, item_time')
      .eq('user_id', userId)
      .eq('summary_date', summaryDate)
      .order('position', { ascending: true }),
  ]);

  const error =
    activityTemplatesResult.error ??
    settingsResult.error ??
    dailySummaryResult.error ??
    completedStretchesResult.error ??
    timelineResult.error;

  if (error) throw new Error(error.message);

  const completedStretchRows = completedStretchesResult.data ?? [];
  const timelineRows = timelineResult.data ?? [];
  const hasStoredState =
    Boolean(settingsResult.data) ||
    Boolean(dailySummaryResult.data) ||
    completedStretchRows.length > 0 ||
    timelineRows.length > 0;

  return {
    activityTemplates: fromActivityTemplateRows(
      activityTemplatesResult.data ?? [],
    ),
    exists: hasStoredState,
    state: fromDatabaseRows({
      completedStretchRows,
      dailySummaryRow: dailySummaryResult.data,
      settingsRow: settingsResult.data,
      timelineRows,
    }),
  };
}

async function saveMoveAlertState(
  userId: string,
  summaryDate: string,
  state: MoveAlertState,
) {
  const [settingsResult, dailySummaryResult] = await Promise.all([
    supabase
      .from('move_alert_settings')
      .upsert(toSettingsRow(userId, state), { onConflict: 'user_id' }),
    supabase
      .from('move_alert_daily_summaries')
      .upsert(toDailySummaryRow(userId, summaryDate, state), {
        onConflict: 'user_id,summary_date',
      }),
  ]);
  const upsertError = settingsResult.error ?? dailySummaryResult.error;

  if (upsertError) throw new Error(upsertError.message);

  const [deleteCompletedResult, deleteTimelineResult] = await Promise.all([
    supabase
      .from('move_alert_completed_stretches')
      .delete()
      .eq('user_id', userId)
      .eq('summary_date', summaryDate),
    supabase
      .from('move_alert_timeline_items')
      .delete()
      .eq('user_id', userId)
      .eq('summary_date', summaryDate),
  ]);
  const deleteError = deleteCompletedResult.error ?? deleteTimelineResult.error;

  if (deleteError) throw new Error(deleteError.message);

  const completedStretchRows = toCompletedStretchRows(
    userId,
    summaryDate,
    state,
  );
  const timelineRows = toTimelineItemRows(userId, summaryDate, state);
  const [insertCompletedResult, insertTimelineResult] = await Promise.all([
    completedStretchRows.length > 0
      ? supabase
          .from('move_alert_completed_stretches')
          .insert(completedStretchRows)
      : Promise.resolve({ error: null }),
    timelineRows.length > 0
      ? supabase.from('move_alert_timeline_items').insert(timelineRows)
      : Promise.resolve({ error: null }),
  ]);
  const insertError = insertCompletedResult.error ?? insertTimelineResult.error;

  if (insertError) throw new Error(insertError.message);
}

export function MoveAlertProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const { resolvedLanguage } = useLanguagePreference();
  const [state, setState] = useState(initialState);
  const [activityTemplates, setActivityTemplates] = useState<StretchItem[]>(
    defaultActivityTemplates,
  );
  const [stretchCooldown, setStretchCooldown] =
    useState<StretchCooldown | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const loadedUserIdRef = useRef<string | null>(null);
  const loadedDateKeyRef = useRef<string | null>(null);
  const lastSyncedStateRef = useRef<string | null>(null);
  const currentStateRef = useRef(initialState);
  const currentSerializedStateRef = useRef(serializeValue(initialState));
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queuedSaveRef = useRef(false);
  const isSavingRef = useRef(false);
  const stretchCooldownRef = useRef<StretchCooldown | null>(null);
  const dailyGoal = activityTemplates.length;

  const progressPercent = Math.min(
    dailyGoal > 0 ? Math.round((state.completedToday / dailyGoal) * 100) : 0,
    100,
  );

  const updateStretchCooldown = useCallback(
    (nextCooldown: StretchCooldown | null) => {
      stretchCooldownRef.current = nextCooldown;
      setStretchCooldown(nextCooldown);
    },
    [],
  );

  const clearScheduledSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  const hasPendingLocalChanges = useCallback(() => {
    return (
      saveTimeoutRef.current !== null ||
      queuedSaveRef.current ||
      isSavingRef.current ||
      (lastSyncedStateRef.current !== null &&
        currentSerializedStateRef.current !== lastSyncedStateRef.current)
    );
  }, []);

  const flushStateToDatabase = useCallback(async () => {
    const userId = loadedUserIdRef.current;
    const summaryDate = loadedDateKeyRef.current;

    if (!userId || !summaryDate) return;
    if (isSavingRef.current) {
      queuedSaveRef.current = true;
      return;
    }

    const serializedSnapshot = currentSerializedStateRef.current;

    if (lastSyncedStateRef.current === serializedSnapshot) return;

    const stateSnapshot = currentStateRef.current;

    isSavingRef.current = true;
    queuedSaveRef.current = false;
    setSyncStatus('saving');
    setErrorMessage(null);

    try {
      await saveMoveAlertState(userId, summaryDate, stateSnapshot);

      if (currentSerializedStateRef.current === serializedSnapshot) {
        lastSyncedStateRef.current = serializedSnapshot;
        setSyncStatus('synced');
      }
    } catch (error) {
      if (currentSerializedStateRef.current === serializedSnapshot) {
        setErrorMessage(getErrorMessage(error));
        setSyncStatus('error');
      }
    } finally {
      isSavingRef.current = false;

      if (
        queuedSaveRef.current ||
        currentSerializedStateRef.current !== lastSyncedStateRef.current
      ) {
        queuedSaveRef.current = false;
        void flushStateToDatabase();
      }
    }
  }, []);

  useEffect(() => {
    if (!stretchCooldown) return;

    const timeout = setTimeout(
      () => {
        if (stretchCooldownRef.current?.endsAt !== stretchCooldown.endsAt) {
          return;
        }

        updateStretchCooldown(null);
      },
      Math.max(stretchCooldown.endsAt - Date.now(), 0),
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [stretchCooldown, updateStretchCooldown]);

  useEffect(() => {
    let isMounted = true;
    let reloadTimeout: ReturnType<typeof setTimeout> | null = null;
    const userId = user?.id ?? null;

    clearScheduledSave();
    queuedSaveRef.current = false;
    isSavingRef.current = false;
    loadedUserIdRef.current = null;
    loadedDateKeyRef.current = null;
    lastSyncedStateRef.current = null;
    updateStretchCooldown(null);

    if (!userId) {
      setState(initialState);
      setActivityTemplates(defaultActivityTemplates);
      setSyncStatus('idle');
      setErrorMessage(null);
      currentStateRef.current = initialState;
      currentSerializedStateRef.current = serializeValue(initialState);
      return;
    }

    const activeUserId = userId;
    const activeSummaryDate = getLocalDateKey();

    setSyncStatus('loading');
    setErrorMessage(null);

    async function hydrateState({
      createIfMissing,
    }: {
      createIfMissing: boolean;
    }) {
      try {
        const result = await loadMoveAlertState(
          activeUserId,
          activeSummaryDate,
        );

        if (!isMounted) return;

        const nextActivityTemplates = result.activityTemplates;
        const nextState = result.exists ? result.state : initialState;
        const nextSerializedState = serializeValue(nextState);
        const currentSerializedState = currentSerializedStateRef.current;
        const shouldAdoptRemoteState =
          lastSyncedStateRef.current === null ||
          !hasPendingLocalChanges() ||
          currentSerializedState === nextSerializedState;

        setActivityTemplates((current) =>
          serializeValue(current) === serializeValue(nextActivityTemplates)
            ? current
            : nextActivityTemplates,
        );
        if (shouldAdoptRemoteState) {
          currentStateRef.current = nextState;
          currentSerializedStateRef.current = nextSerializedState;
          setState((current) =>
            serializeValue(current) === nextSerializedState
              ? current
              : nextState,
          );
        }
        loadedUserIdRef.current = activeUserId;
        loadedDateKeyRef.current = activeSummaryDate;

        if (!result.exists && createIfMissing) {
          await saveMoveAlertState(activeUserId, activeSummaryDate, nextState);

          if (!isMounted) return;
        }

        lastSyncedStateRef.current = nextSerializedState;
        setErrorMessage(null);
        if (!hasPendingLocalChanges()) {
          setSyncStatus('synced');
        }
        return;
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(getErrorMessage(error));
        setSyncStatus('error');
      }
    }

    function scheduleHydrateState() {
      if (reloadTimeout) {
        clearTimeout(reloadTimeout);
      }

      reloadTimeout = setTimeout(() => {
        void hydrateState({ createIfMissing: false });
      }, 150);
    }

    void hydrateState({ createIfMissing: true });

    const channel = supabase
      .channel(`move-alert-state:${activeUserId}:${activeSummaryDate}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `user_id=eq.${activeUserId}`,
          schema: 'public',
          table: 'move_alert_settings',
        },
        scheduleHydrateState,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `user_id=eq.${activeUserId}`,
          schema: 'public',
          table: 'move_alert_daily_summaries',
        },
        scheduleHydrateState,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `user_id=eq.${activeUserId}`,
          schema: 'public',
          table: 'move_alert_completed_stretches',
        },
        scheduleHydrateState,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `user_id=eq.${activeUserId}`,
          schema: 'public',
          table: 'move_alert_timeline_items',
        },
        scheduleHydrateState,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'move_alert_activity_templates',
        },
        scheduleHydrateState,
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (reloadTimeout) {
        clearTimeout(reloadTimeout);
      }
      clearScheduledSave();
      void supabase.removeChannel(channel);
    };
  }, [
    clearScheduledSave,
    hasPendingLocalChanges,
    updateStretchCooldown,
    user?.id,
  ]);

  useEffect(() => {
    currentStateRef.current = state;
    currentSerializedStateRef.current = serializeValue(state);

    const userId = user?.id ?? null;

    if (
      !userId ||
      loadedUserIdRef.current !== userId ||
      !loadedDateKeyRef.current
    ) {
      return;
    }

    const serializedState = currentSerializedStateRef.current;

    if (lastSyncedStateRef.current === serializedState) return;

    clearScheduledSave();
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      void flushStateToDatabase();
    }, SAVE_DEBOUNCE_MS);

    return () => {
      clearScheduledSave();
    };
  }, [clearScheduledSave, flushStateToDatabase, state, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      void syncReminderNotificationsAsync(null);
      return;
    }

    void syncReminderNotificationsAsync({
      intervalMinutes: state.intervalMinutes,
      quietHoursDays: state.quietHoursDays,
      quietHoursEnabled: state.quietHoursEnabled,
      quietHoursEndTime: state.quietHoursEndTime,
      quietHoursStartTime: state.quietHoursStartTime,
      reminderEnabled: state.reminderEnabled,
      timeline: state.timeline,
    });
  }, [
    resolvedLanguage,
    state.intervalMinutes,
    state.quietHoursDays,
    state.quietHoursEnabled,
    state.quietHoursEndTime,
    state.quietHoursStartTime,
    state.reminderEnabled,
    state.timeline,
    user?.id,
  ]);

  const completeReminderBreak = useCallback(() => {
    const date = new Date();

    setState((current) => ({
      ...current,
      completedToday: current.completedToday + 1,
      timeline: withTimelineEvent(
        current,
        {
          labelKey: 'timeline.movementBreakCompleted',
          status: 'done',
        },
        date,
      ),
    }));
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let cleanup = () => {};
    let isMounted = true;

    void subscribeToReminderNotificationResponsesAsync(() => {
      completeReminderBreak();
    }).then((unsubscribe) => {
      if (!isMounted) {
        unsubscribe();
        return;
      }

      cleanup = unsubscribe;
    });

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [completeReminderBreak, user?.id]);

  const value = useMemo<MoveAlertContextValue>(
    () => ({
      activityTemplates,
      dailyGoal,
      state,
      progressPercent,
      completeStretch: (stretchId) => {
        const date = new Date();
        const cooldownMs = getStretchCooldownMs(stretchId, activityTemplates);
        const activeCooldown = stretchCooldownRef.current;

        if (!cooldownMs) return;

        if (activeCooldown && activeCooldown.endsAt > date.getTime()) {
          return;
        }

        tapFeedback();
        updateStretchCooldown({
          activeStretchId: stretchId,
          endsAt: date.getTime() + cooldownMs,
        });

        setState((current) => {
          const alreadyCompleted =
            current.completedStretchIds.includes(stretchId);

          return {
            ...current,
            completedToday: current.completedToday + 1,
            completedStretchCounts: {
              ...current.completedStretchCounts,
              [stretchId]: (current.completedStretchCounts[stretchId] ?? 0) + 1,
            },
            completedStretchIds: alreadyCompleted
              ? current.completedStretchIds
              : [...current.completedStretchIds, stretchId],
            timeline: withTimelineEvent(
              current,
              {
                labelKey: getCompletedTimelineLabelKey(
                  stretchId,
                  activityTemplates,
                ),
                status: 'done',
              },
              date,
            ),
          };
        });
      },
      errorMessage,
      isSyncing: syncStatus === 'loading' || syncStatus === 'saving',
      skipBreak: () => {
        const date = new Date();

        setState((current) => {
          if (
            !current.reminderEnabled ||
            isWaitingForSkippedBreak(current, date)
          ) {
            return current;
          }

          tapFeedback();

          return {
            ...current,
            skippedToday: current.skippedToday + 1,
            timeline: withTimelineEvent(
              current,
              {
                labelKey: 'timeline.breakSkipped',
                status: 'skipped',
              },
              date,
            ),
          };
        });
      },
      setIntervalMinutes: (intervalMinutes) => {
        if (!reminderIntervals.includes(intervalMinutes)) return;

        tapFeedback();
        setState((current) => ({
          ...current,
          intervalMinutes,
          timeline: withNextMovementBreak(
            current.timeline,
            intervalMinutes,
            new Date(),
          ),
        }));
      },
      setQuietHoursEndTime: (time) => {
        const normalizedTime = normalizeDatabaseTime(time);

        if (!normalizedTime) return;

        tapFeedback();
        setState((current) => ({
          ...current,
          quietHoursEndTime: normalizedTime,
        }));
      },
      setQuietHoursStartTime: (time) => {
        const normalizedTime = normalizeDatabaseTime(time);

        if (!normalizedTime) return;

        tapFeedback();
        setState((current) => ({
          ...current,
          quietHoursStartTime: normalizedTime,
        }));
      },
      toggleReminder: () => {
        tapFeedback();
        setState((current) => ({
          ...current,
          reminderEnabled: !current.reminderEnabled,
        }));
      },
      stretchCooldown,
      syncStatus,
      toggleQuietHoursDay: (day) => {
        if (!weekDays.includes(day)) return;

        tapFeedback();
        setState((current) => {
          const hasDay = current.quietHoursDays.includes(day);
          const nextDays = hasDay
            ? current.quietHoursDays.filter((quietDay) => quietDay !== day)
            : [...current.quietHoursDays, day].sort((a, b) => a - b);

          return {
            ...current,
            quietHoursDays:
              nextDays.length > 0 ? nextDays : current.quietHoursDays,
          };
        });
      },
      toggleQuietHours: () => {
        tapFeedback();
        setState((current) => ({
          ...current,
          quietHoursEnabled: !current.quietHoursEnabled,
        }));
      },
    }),
    [
      activityTemplates,
      dailyGoal,
      errorMessage,
      progressPercent,
      state,
      stretchCooldown,
      syncStatus,
      updateStretchCooldown,
    ],
  );

  return (
    <MoveAlertContext.Provider value={value}>
      {children}
    </MoveAlertContext.Provider>
  );
}

export function useMoveAlert() {
  const context = useContext(MoveAlertContext);

  if (!context) {
    throw new Error('useMoveAlert must be used inside MoveAlertProvider');
  }

  return context;
}
