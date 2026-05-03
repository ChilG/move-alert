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
  durationSeconds: number;
  icon: string;
  tone: 'info' | 'success' | 'warning' | 'error';
};

export const timelineLabelKeys = [
  'timeline.neckResetCompleted',
  'timeline.shoulderRollsCompleted',
  'timeline.wristReleaseCompleted',
  'timeline.deskBackStretchCompleted',
  'timeline.shoulderReminderSkipped',
  'timeline.breakSkipped',
  'timeline.nextMovementBreak',
] as const;

export const timelineStatuses = ['done', 'skipped', 'next'] as const;

export type TimelineItem = {
  time: string;
  labelKey: (typeof timelineLabelKeys)[number];
  status: (typeof timelineStatuses)[number];
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
    durationSeconds: 45,
    icon: 'body-outline',
    tone: 'info',
  },
  {
    id: 'shoulder-rolls',
    titleKey: 'stretchItems.shoulderRolls.title',
    targetKey: 'stretchItems.shoulderRolls.target',
    durationKey: 'stretchItems.shoulderRolls.duration',
    descriptionKey: 'stretchItems.shoulderRolls.description',
    durationSeconds: 60,
    icon: 'sync-outline',
    tone: 'success',
  },
  {
    id: 'wrist-release',
    titleKey: 'stretchItems.wristRelease.title',
    targetKey: 'stretchItems.wristRelease.target',
    durationKey: 'stretchItems.wristRelease.duration',
    descriptionKey: 'stretchItems.wristRelease.description',
    durationSeconds: 40,
    icon: 'hand-left-outline',
    tone: 'warning',
  },
  {
    id: 'desk-back-stretch',
    titleKey: 'stretchItems.deskBackStretch.title',
    targetKey: 'stretchItems.deskBackStretch.target',
    durationKey: 'stretchItems.deskBackStretch.duration',
    descriptionKey: 'stretchItems.deskBackStretch.description',
    durationSeconds: 90,
    icon: 'accessibility-outline',
    tone: 'error',
  },
];

export const initialTimeline: TimelineItem[] = [];
