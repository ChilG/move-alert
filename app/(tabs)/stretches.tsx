import { useEffect, useState } from 'react';

import { t } from '@/components/move-alert/i18n';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { StretchCard } from '@/components/move-alert/stretches/stretch-card';
import { VStack } from '@/components/ui/vstack';

export default function StretchesScreen() {
  const { activityTemplates, completeStretch, state, stretchCooldown } =
    useMoveAlert();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!stretchCooldown) return;

    setNow(Date.now());

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [stretchCooldown]);

  const cooldownRemainingSeconds = stretchCooldown
    ? Math.max(Math.ceil((stretchCooldown.endsAt - now) / 1000), 0)
    : 0;
  const activeCooldownStretchId =
    cooldownRemainingSeconds > 0
      ? (stretchCooldown?.activeStretchId ?? null)
      : null;

  return (
    <ScreenScrollView>
      <ScreenHeader
        description={t('stretches.description')}
        eyebrow={t('stretches.eyebrow')}
        eyebrowClassName="text-success-600"
        title={t('stretches.title')}
      />

      <VStack className="mt-6" space="lg">
        {activityTemplates.map((stretch) => (
          <StretchCard
            activeCooldownStretchId={activeCooldownStretchId}
            completedCount={state.completedStretchCounts[stretch.id] ?? 0}
            cooldownRemainingSeconds={cooldownRemainingSeconds}
            isDone={state.completedStretchIds.includes(stretch.id)}
            key={stretch.id}
            onComplete={completeStretch}
            stretch={stretch}
          />
        ))}
      </VStack>
    </ScreenScrollView>
  );
}
