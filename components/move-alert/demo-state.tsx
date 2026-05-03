import * as Haptics from 'expo-haptics';
import {
  createContext,
  PropsWithChildren,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { z } from 'zod';

import { useAuth } from '@/components/move-alert/auth-state';
import { supabase } from '@/lib/supabase';
import { dailyGoal, reminderIntervals } from './demo-data';

type MoveAlertState = {
  completedToday: number;
  skippedToday: number;
  streakDays: number;
  intervalMinutes: number;
  reminderEnabled: boolean;
  quietHoursEnabled: boolean;
  completedStretchIds: string[];
};

type SyncStatus = 'idle' | 'loading' | 'saving' | 'synced' | 'error';

type MoveAlertContextValue = {
  state: MoveAlertState;
  progressPercent: number;
  completeStretch: (stretchId: string) => void;
  errorMessage: string | null;
  isSyncing: boolean;
  skipBreak: () => void;
  setIntervalMinutes: (intervalMinutes: number) => void;
  syncStatus: SyncStatus;
  toggleReminder: () => void;
  toggleQuietHours: () => void;
  resetDemo: () => void;
};

const initialState: MoveAlertState = {
  completedToday: 3,
  skippedToday: 1,
  streakDays: 4,
  intervalMinutes: 45,
  reminderEnabled: true,
  quietHoursEnabled: true,
  completedStretchIds: ['neck-reset'],
};

const moveAlertStateRowSchema = z.object({
  completed_stretch_ids: z.array(z.string()).catch([]),
  completed_today: z.number().int().min(0).catch(initialState.completedToday),
  interval_minutes: z
    .number()
    .int()
    .refine((value) => reminderIntervals.includes(value))
    .catch(initialState.intervalMinutes),
  quiet_hours_enabled: z.boolean().catch(initialState.quietHoursEnabled),
  reminder_enabled: z.boolean().catch(initialState.reminderEnabled),
  skipped_today: z.number().int().min(0).catch(initialState.skippedToday),
  streak_days: z.number().int().min(0).catch(initialState.streakDays),
});

const MoveAlertContext = createContext<MoveAlertContextValue | null>(null);

function tapFeedback() {
  Haptics.selectionAsync().catch(() => {});
}

function toDatabaseRow(userId: string, state: MoveAlertState) {
  return {
    completed_stretch_ids: state.completedStretchIds,
    completed_today: state.completedToday,
    interval_minutes: state.intervalMinutes,
    quiet_hours_enabled: state.quietHoursEnabled,
    reminder_enabled: state.reminderEnabled,
    skipped_today: state.skippedToday,
    streak_days: state.streakDays,
    user_id: userId,
  };
}

function fromDatabaseRow(row: unknown): MoveAlertState {
  const parsedRow = moveAlertStateRowSchema.parse(row);

  return {
    completedToday: parsedRow.completed_today,
    completedStretchIds: parsedRow.completed_stretch_ids,
    intervalMinutes: parsedRow.interval_minutes,
    quietHoursEnabled: parsedRow.quiet_hours_enabled,
    reminderEnabled: parsedRow.reminder_enabled,
    skippedToday: parsedRow.skipped_today,
    streakDays: parsedRow.streak_days,
  };
}

function serializeState(state: MoveAlertState) {
  return JSON.stringify(state);
}

export function MoveAlertProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [state, setState] = useState(initialState);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const loadedUserIdRef = useRef<string | null>(null);
  const lastSyncedStateRef = useRef<string | null>(null);

  const progressPercent = Math.min(
    Math.round((state.completedToday / dailyGoal) * 100),
    100,
  );

  useEffect(() => {
    let isMounted = true;
    const userId = user?.id ?? null;

    loadedUserIdRef.current = null;
    lastSyncedStateRef.current = null;

    if (!userId) {
      setState(initialState);
      setSyncStatus('idle');
      setErrorMessage(null);
      return;
    }

    const activeUserId = userId;

    setSyncStatus('loading');
    setErrorMessage(null);

    async function hydrateState() {
      const { data, error } = await supabase
        .from('move_alert_states')
        .select(
          [
            'completed_today',
            'skipped_today',
            'streak_days',
            'interval_minutes',
            'reminder_enabled',
            'quiet_hours_enabled',
            'completed_stretch_ids',
          ].join(','),
        )
        .eq('user_id', activeUserId)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setErrorMessage(error.message);
        setSyncStatus('error');
        loadedUserIdRef.current = activeUserId;
        return;
      }

      const nextState = data ? fromDatabaseRow(data) : initialState;
      const nextSerializedState = serializeState(nextState);

      setState(nextState);
      lastSyncedStateRef.current = data ? nextSerializedState : null;
      loadedUserIdRef.current = activeUserId;

      if (data) {
        setSyncStatus('synced');
        return;
      }

      const { error: upsertError } = await supabase
        .from('move_alert_states')
        .upsert(toDatabaseRow(activeUserId, nextState), {
          onConflict: 'user_id',
        });

      if (!isMounted) return;

      if (upsertError) {
        setErrorMessage(upsertError.message);
        setSyncStatus('error');
        return;
      }

      lastSyncedStateRef.current = nextSerializedState;
      setSyncStatus('synced');
    }

    void hydrateState();

    const channel = supabase
      .channel(`move-alert-state:${activeUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `user_id=eq.${activeUserId}`,
          schema: 'public',
          table: 'move_alert_states',
        },
        (payload) => {
          if (!isMounted || payload.eventType === 'DELETE') return;

          const nextState = fromDatabaseRow(payload.new);
          const nextSerializedState = serializeState(nextState);

          lastSyncedStateRef.current = nextSerializedState;
          setState((current) =>
            serializeState(current) === nextSerializedState
              ? current
              : nextState,
          );
          setErrorMessage(null);
          setSyncStatus('synced');
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    const userId = user?.id ?? null;

    if (!userId || loadedUserIdRef.current !== userId) return;

    const activeUserId = userId;
    const serializedState = serializeState(state);

    if (lastSyncedStateRef.current === serializedState) return;

    let isMounted = true;

    async function saveState() {
      setSyncStatus('saving');
      setErrorMessage(null);

      const { error } = await supabase
        .from('move_alert_states')
        .upsert(toDatabaseRow(activeUserId, state), {
          onConflict: 'user_id',
        });

      if (!isMounted) return;

      if (error) {
        setErrorMessage(error.message);
        setSyncStatus('error');
        return;
      }

      lastSyncedStateRef.current = serializedState;
      setSyncStatus('synced');
    }

    void saveState();

    return () => {
      isMounted = false;
    };
  }, [state, user?.id]);

  const value = useMemo<MoveAlertContextValue>(
    () => ({
      state,
      progressPercent,
      completeStretch: (stretchId) => {
        tapFeedback();
        setState((current) => {
          const alreadyCompleted =
            current.completedStretchIds.includes(stretchId);

          return {
            ...current,
            completedToday: alreadyCompleted
              ? current.completedToday
              : Math.min(current.completedToday + 1, dailyGoal),
            completedStretchIds: alreadyCompleted
              ? current.completedStretchIds
              : [...current.completedStretchIds, stretchId],
          };
        });
      },
      errorMessage,
      isSyncing: syncStatus === 'loading' || syncStatus === 'saving',
      skipBreak: () => {
        tapFeedback();
        setState((current) => ({
          ...current,
          skippedToday: current.skippedToday + 1,
        }));
      },
      setIntervalMinutes: (intervalMinutes) => {
        if (!reminderIntervals.includes(intervalMinutes)) return;

        tapFeedback();
        setState((current) => ({
          ...current,
          intervalMinutes,
        }));
      },
      toggleReminder: () => {
        tapFeedback();
        setState((current) => ({
          ...current,
          reminderEnabled: !current.reminderEnabled,
        }));
      },
      syncStatus,
      toggleQuietHours: () => {
        tapFeedback();
        setState((current) => ({
          ...current,
          quietHoursEnabled: !current.quietHoursEnabled,
        }));
      },
      resetDemo: () => {
        tapFeedback();
        setState(initialState);
      },
    }),
    [errorMessage, progressPercent, state, syncStatus],
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
