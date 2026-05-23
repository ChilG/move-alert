import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AppState } from 'react-native';

import {
  getBatteryOptimizationStatusAsync,
  type BatteryOptimizationStatus,
} from '@/components/move-alert/settings/battery-optimization-status';

export type BatteryOptimizationStatusState = BatteryOptimizationStatus | 'loading';

export function useBatteryOptimizationStatus() {
  const [status, setStatus] = useState<BatteryOptimizationStatusState>('loading');
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const refreshStatus = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus('loading');

    const nextStatus = await getBatteryOptimizationStatusAsync();

    if (isMountedRef.current && requestIdRef.current === requestId) {
      setStatus(nextStatus);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshStatus();
    }, [refreshStatus]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        void refreshStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshStatus]);

  return {
    refreshStatus,
    status,
  };
}
