import { getLocales } from 'expo-localization';
import { z } from 'zod';

const th = {
  common: {
    appName: 'Move Alert',
    active: 'เปิดใช้งาน',
    paused: 'พักไว้',
    minutesShort: 'นาที',
    percent: '%',
  },
  tabs: {
    today: 'วันนี้',
    stretches: 'ยืดเหยียด',
    settings: 'ตั้งค่า',
  },
  today: {
    eyebrow: 'Move Alert',
    title: 'แผนขยับร่างกายวันนี้',
    nextReminder: 'แจ้งเตือนครั้งถัดไป',
    progressSummary: '{{completed}}/{{goal}} ครั้งที่ทำสำเร็จ',
    pause: 'พักแจ้งเตือน',
    start: 'เริ่มแจ้งเตือน',
    skip: 'ข้าม',
    doneMetric: 'ทำแล้ว',
    streakMetric: 'ต่อเนื่อง',
    streakValue: '{{days}} วัน',
    skippedMetric: 'ข้าม',
    timelineTitle: 'ไทม์ไลน์',
  },
  stretches: {
    eyebrow: 'ท่ายืดเหยียด',
    title: 'ท่าพักสั้น ๆ สำหรับคนทำงานหน้าจอ',
    description:
      'เลือกท่าที่ตรงกับจุดที่รู้สึกตึง ระบบเดโมจะอัปเดตความคืบหน้าของวันนี้เมื่อกดทำเสร็จ',
    completed: 'ทำแล้ว',
    markDone: 'ทำเสร็จ',
  },
  settings: {
    eyebrow: 'ตั้งค่า',
    title: 'ปรับจังหวะพักให้เข้ากับตัวเอง',
    signedInAccount: 'บัญชีที่เข้าสู่ระบบ',
    unknownUser: 'ผู้ใช้บัญชี Move Alert',
    synced: 'ซิงก์กับบัญชีแล้ว',
    syncing: 'กำลังซิงก์กับบัญชี...',
    syncError: 'ซิงก์ข้อมูลไม่สำเร็จ',
    signOut: 'ออกจากระบบ',
    reminderInterval: 'รอบการแจ้งเตือน',
    reminderIntervalDescription: 'เลือกความถี่ที่แอปควรเตือนให้ขยับร่างกาย',
    minutes: 'นาที',
    movementReminders: 'แจ้งเตือนให้ขยับ',
    quietHours: 'ช่วงเวลางดแจ้งเตือน',
    prototypeNoteTitle: 'หมายเหตุของเดโม',
    prototypeNoteBody:
      'ข้อมูลการพักและการตั้งค่าถูกบันทึกกับบัญชี Move Alert แล้ว แต่การแจ้งเตือนจริงยังควรเพิ่มผ่าน development build',
    resetDemo: 'รีเซ็ตข้อมูล',
  },
  timeline: {
    neckResetCompleted: 'ทำท่ายืดคอแล้ว',
    shoulderReminderSkipped: 'ข้ามการแจ้งเตือนไหล่',
    nextMovementBreak: 'พักขยับร่างกายครั้งถัดไป',
  },
  stretchItems: {
    neckReset: {
      title: 'คลายคอ',
      target: 'คอและแนวกระดูกสันหลังส่วนบน',
      duration: '45 วินาที',
      description:
        'เอียงศีรษะซ้ายขวาช้า ๆ แล้วก้มมองลงเพื่อคลายความตึงจากการมองหน้าจอนาน',
    },
    shoulderRolls: {
      title: 'หมุนไหล่',
      target: 'ไหล่และหน้าอก',
      duration: '60 วินาที',
      description:
        'หมุนไหล่ทั้งสองข้างไปด้านหลัง หยุดสั้น ๆ แล้วหมุนไปด้านหน้า พร้อมหายใจสม่ำเสมอ',
    },
    wristRelease: {
      title: 'คลายข้อมือ',
      target: 'ข้อมือและท่อนแขน',
      duration: '40 วินาที',
      description:
        'เหยียดแขนหนึ่งข้าง ดึงปลายนิ้วเข้าหาตัวเบา ๆ แล้วสลับข้างเพื่อลดความตึงจากการพิมพ์',
    },
    deskBackStretch: {
      title: 'ยืดหลังข้างโต๊ะ',
      target: 'หลังและท่าทาง',
      duration: '90 วินาที',
      description:
        'ยืนขึ้น วางมือที่หลังส่วนล่าง แล้วค่อย ๆ เปิดหน้าอกโดยไม่ฝืนร่างกาย',
    },
  },
  auth: {
    screen: {
      providerLabel: 'บัญชี Move Alert',
      signInSubmit: 'เข้าสู่ระบบ',
      signUpSubmit: 'สมัครสมาชิก',
      signInTitle: 'เข้าสู่ Move Alert',
      signUpTitle: 'สร้างบัญชี Move Alert',
      subtitle: 'บันทึกการพักและตั้งค่าแจ้งเตือนของคุณไว้กับบัญชีเดียว',
      passwordPlaceholder: 'รหัสผ่าน',
      switchToSignUp: 'ยังไม่มีบัญชี? สมัครสมาชิก',
      switchToSignIn: 'มีบัญชีแล้ว? เข้าสู่ระบบ',
      resendVerificationEmail: 'ส่งลิงก์ยืนยันอีเมลใหม่',
      invalidEmail: 'กรุณากรอกอีเมลให้ถูกต้อง',
      passwordTooShort: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
      signUpSuccess:
        'สมัครสมาชิกสำเร็จ หากระบบเปิดยืนยันอีเมล กรุณาเช็กกล่องจดหมาย',
      invalidEmailBeforeResend: 'กรุณากรอกอีเมลให้ถูกต้องก่อนส่งลิงก์ใหม่',
      resendSuccess: 'ส่งลิงก์ยืนยันอีเมลใหม่แล้ว กรุณาเช็กกล่องจดหมาย',
    },
    errors: {
      verificationExpired:
        'ลิงก์ยืนยันอีเมลหมดอายุหรือถูกใช้ไปแล้ว กรุณาสมัคร/เข้าสู่ระบบใหม่เพื่อรับลิงก์ล่าสุด',
      invalidCredentials: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      emailNotConfirmed: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
    },
  },
};

type Locale = typeof th;

const en: Locale = {
  common: {
    appName: 'Move Alert',
    active: 'Active',
    paused: 'Paused',
    minutesShort: 'min',
    percent: '%',
  },
  tabs: {
    today: 'Today',
    stretches: 'Stretches',
    settings: 'Settings',
  },
  today: {
    eyebrow: 'Move Alert',
    title: "Today's movement plan",
    nextReminder: 'Next reminder',
    progressSummary: '{{completed}}/{{goal}} completed',
    pause: 'Pause reminders',
    start: 'Start reminders',
    skip: 'Skip',
    doneMetric: 'Done',
    streakMetric: 'Streak',
    streakValue: '{{days}} days',
    skippedMetric: 'Skipped',
    timelineTitle: 'Timeline',
  },
  stretches: {
    eyebrow: 'Stretches',
    title: 'Quick resets for screen-heavy work',
    description:
      "Choose the stretch that matches where you feel tight. This demo updates today's progress when you mark one done.",
    completed: 'Done',
    markDone: 'Mark done',
  },
  settings: {
    eyebrow: 'Settings',
    title: 'Tune break timing to fit your day',
    signedInAccount: 'Signed-in account',
    unknownUser: 'Move Alert account user',
    synced: 'Synced with your account',
    syncing: 'Syncing with your account...',
    syncError: 'Sync failed',
    signOut: 'Sign out',
    reminderInterval: 'Reminder interval',
    reminderIntervalDescription:
      'Choose how often the app should remind you to move.',
    minutes: 'minutes',
    movementReminders: 'Movement reminders',
    quietHours: 'Quiet hours',
    prototypeNoteTitle: 'Demo note',
    prototypeNoteBody:
      'Break data and settings now sync to your Move Alert account, but real notifications should still be added through a development build.',
    resetDemo: 'Reset data',
  },
  timeline: {
    neckResetCompleted: 'Neck reset completed',
    shoulderReminderSkipped: 'Shoulder reminder skipped',
    nextMovementBreak: 'Next movement break',
  },
  stretchItems: {
    neckReset: {
      title: 'Neck reset',
      target: 'Neck and upper spine',
      duration: '45 seconds',
      description:
        'Slowly tilt your head left and right, then look down to release tension from long screen sessions.',
    },
    shoulderRolls: {
      title: 'Shoulder rolls',
      target: 'Shoulders and chest',
      duration: '60 seconds',
      description:
        'Roll both shoulders backward, pause briefly, then roll forward while breathing steadily.',
    },
    wristRelease: {
      title: 'Wrist release',
      target: 'Wrists and forearms',
      duration: '40 seconds',
      description:
        'Extend one arm, gently pull your fingers back toward you, then switch sides to reduce typing tension.',
    },
    deskBackStretch: {
      title: 'Desk back stretch',
      target: 'Back and posture',
      duration: '90 seconds',
      description:
        'Stand up, place your hands on your lower back, and gently open your chest without forcing the movement.',
    },
  },
  auth: {
    screen: {
      providerLabel: 'Move Alert account',
      signInSubmit: 'Sign in',
      signUpSubmit: 'Create account',
      signInTitle: 'Sign in to Move Alert',
      signUpTitle: 'Create your Move Alert account',
      subtitle: 'Save your breaks and reminder settings to one account.',
      passwordPlaceholder: 'Password',
      switchToSignUp: 'No account yet? Create one',
      switchToSignIn: 'Already have an account? Sign in',
      resendVerificationEmail: 'Resend verification email',
      invalidEmail: 'Enter a valid email address.',
      passwordTooShort: 'Password must be at least 6 characters.',
      signUpSuccess:
        'Account created. If email verification is enabled, check your inbox.',
      invalidEmailBeforeResend:
        'Enter a valid email address before resending the link.',
      resendSuccess: 'Verification email sent. Check your inbox.',
    },
    errors: {
      verificationExpired:
        'The email verification link has expired or was already used. Sign up or sign in again to get the latest link.',
      invalidCredentials: 'Email or password is incorrect.',
      emailNotConfirmed: 'Confirm your email before signing in.',
    },
  },
};

const supportedLanguageSchema = z.enum(['en', 'th']);
type SupportedLanguage = z.infer<typeof supportedLanguageSchema>;

const fallbackLanguage: SupportedLanguage = 'th';
const translations: Record<SupportedLanguage, Locale> = { en, th };

type DotPrefix<
  TPrefix extends string,
  TKey extends string,
> = `${TPrefix}.${TKey}`;

type LocaleKey<TValue, TPrefix extends string = ''> = TValue extends string
  ? TPrefix
  : {
      [TKey in keyof TValue & string]: LocaleKey<
        TValue[TKey],
        TPrefix extends '' ? TKey : DotPrefix<TPrefix, TKey>
      >;
    }[keyof TValue & string];

type TranslationKey = LocaleKey<Locale>;

function parseSupportedLanguage(languageCode: string | null | undefined) {
  const language = supportedLanguageSchema.safeParse(languageCode);
  return language.success ? language.data : undefined;
}

export function getCurrentLanguage(): SupportedLanguage {
  const [locale] = getLocales();
  const languageCode = locale?.languageCode?.toLowerCase();
  const languageTagLanguage = locale?.languageTag.toLowerCase().split('-')[0];

  return (
    parseSupportedLanguage(languageCode) ??
    parseSupportedLanguage(languageTagLanguage) ??
    fallbackLanguage
  );
}

function lookupTranslation(
  key: TranslationKey,
  language: SupportedLanguage = getCurrentLanguage(),
) {
  return key.split('.').reduce<unknown>((value, segment) => {
    if (!value || typeof value !== 'object') return undefined;

    return (value as Record<string, unknown>)[segment];
  }, translations[language]);
}

export function t(key: TranslationKey) {
  const value =
    lookupTranslation(key) ?? lookupTranslation(key, fallbackLanguage);

  if (typeof value !== 'string') {
    return key;
  }

  return value;
}

export function tf(
  key: TranslationKey,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (message, [name, value]) =>
      message.replaceAll(`{{${name}}}`, String(value)),
    t(key),
  );
}
