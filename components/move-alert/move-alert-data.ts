export type StretchItem = {
  id: string;
  completionLabelKey:
    | 'timeline.neckResetCompleted'
    | 'timeline.shoulderRollsCompleted'
    | 'timeline.wristReleaseCompleted'
    | 'timeline.deskBackStretchCompleted';
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

export const activityTemplateTitleKeys = [
  'stretchItems.neckReset.title',
  'stretchItems.shoulderRolls.title',
  'stretchItems.wristRelease.title',
  'stretchItems.deskBackStretch.title',
] as const;

export const activityTemplateTargetKeys = [
  'stretchItems.neckReset.target',
  'stretchItems.shoulderRolls.target',
  'stretchItems.wristRelease.target',
  'stretchItems.deskBackStretch.target',
] as const;

export const activityTemplateDurationKeys = [
  'stretchItems.neckReset.duration',
  'stretchItems.shoulderRolls.duration',
  'stretchItems.wristRelease.duration',
  'stretchItems.deskBackStretch.duration',
] as const;

export const activityTemplateDescriptionKeys = [
  'stretchItems.neckReset.description',
  'stretchItems.shoulderRolls.description',
  'stretchItems.wristRelease.description',
  'stretchItems.deskBackStretch.description',
] as const;

export const activityTemplateTones = [
  'info',
  'success',
  'warning',
  'error',
] as const;

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

export const reminderIntervals = [30, 45, 60];

export const defaultActivityTemplates: StretchItem[] = [
  {
    completionLabelKey: 'timeline.neckResetCompleted',
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
    completionLabelKey: 'timeline.shoulderRollsCompleted',
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
    completionLabelKey: 'timeline.wristReleaseCompleted',
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
    completionLabelKey: 'timeline.deskBackStretchCompleted',
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
