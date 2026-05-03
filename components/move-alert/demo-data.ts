export type StretchItem = {
  id: string;
  titleKey:
    | 'stretchItems.neckReset.title'
    | 'stretchItems.shoulderRolls.title'
    | 'stretchItems.wristRelease.title'
    | 'stretchItems.deskBackStretch.title';
  targetKey:
    | 'stretchItems.neckReset.target'
    | 'stretchItems.shoulderRolls.target'
    | 'stretchItems.wristRelease.target'
    | 'stretchItems.deskBackStretch.target';
  durationKey:
    | 'stretchItems.neckReset.duration'
    | 'stretchItems.shoulderRolls.duration'
    | 'stretchItems.wristRelease.duration'
    | 'stretchItems.deskBackStretch.duration';
  descriptionKey:
    | 'stretchItems.neckReset.description'
    | 'stretchItems.shoulderRolls.description'
    | 'stretchItems.wristRelease.description'
    | 'stretchItems.deskBackStretch.description';
  icon: string;
  tone: 'info' | 'success' | 'warning' | 'error';
};

export type TimelineItem = {
  time: string;
  labelKey:
    | 'timeline.neckResetCompleted'
    | 'timeline.shoulderReminderSkipped'
    | 'timeline.nextMovementBreak';
  status: 'done' | 'skipped' | 'next';
};

export const dailyGoal = 8;

export const reminderIntervals = [30, 45, 60];

export const stretches: StretchItem[] = [
  {
    id: 'neck-reset',
    titleKey: 'stretchItems.neckReset.title',
    targetKey: 'stretchItems.neckReset.target',
    durationKey: 'stretchItems.neckReset.duration',
    descriptionKey: 'stretchItems.neckReset.description',
    icon: 'body-outline',
    tone: 'info',
  },
  {
    id: 'shoulder-rolls',
    titleKey: 'stretchItems.shoulderRolls.title',
    targetKey: 'stretchItems.shoulderRolls.target',
    durationKey: 'stretchItems.shoulderRolls.duration',
    descriptionKey: 'stretchItems.shoulderRolls.description',
    icon: 'sync-outline',
    tone: 'success',
  },
  {
    id: 'wrist-release',
    titleKey: 'stretchItems.wristRelease.title',
    targetKey: 'stretchItems.wristRelease.target',
    durationKey: 'stretchItems.wristRelease.duration',
    descriptionKey: 'stretchItems.wristRelease.description',
    icon: 'hand-left-outline',
    tone: 'warning',
  },
  {
    id: 'desk-back-stretch',
    titleKey: 'stretchItems.deskBackStretch.title',
    targetKey: 'stretchItems.deskBackStretch.target',
    durationKey: 'stretchItems.deskBackStretch.duration',
    descriptionKey: 'stretchItems.deskBackStretch.description',
    icon: 'accessibility-outline',
    tone: 'error',
  },
];

export const timeline: TimelineItem[] = [
  { time: '09:30', labelKey: 'timeline.neckResetCompleted', status: 'done' },
  {
    time: '10:15',
    labelKey: 'timeline.shoulderReminderSkipped',
    status: 'skipped',
  },
  { time: '11:00', labelKey: 'timeline.nextMovementBreak', status: 'next' },
];
