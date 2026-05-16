import { getLocales } from 'expo-localization';
import { z } from 'zod';

export type LanguageMode = 'en' | 'system' | 'th';
let languageModeOverride: LanguageMode = 'system';

const th = {
  common: {
    appName: 'Move Alert',
    active: 'เปิดใช้งาน',
    paused: 'พัก',
    minutesShort: 'นาที',
    percent: '%',
  },
  notifications: {
    channelName: 'การเตือนให้ขยับร่างกาย',
    channelDescription: 'การแจ้งเตือนตามเวลาพร้อมแรงสั่นแบบชัดเจน',
    reminderTitle: 'ได้เวลาขยับร่างกาย',
    reminderBody: 'ลุกขึ้นยืดเส้น คลายตัว และรีเซ็ตท่าทางสักครู่',
  },
  weekdays: {
    sunday: 'อา',
    monday: 'จ',
    tuesday: 'อ',
    wednesday: 'พ',
    thursday: 'พฤ',
    friday: 'ศ',
    saturday: 'ส',
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
    reminderInterval: 'รอบการแจ้งเตือน',
    nextReminderAt: 'ครั้งถัดไป {{time}}',
    remindersPaused: 'การแจ้งเตือนหยุดอยู่',
    remindersPausedValue: 'พักอยู่',
    quietHoursActive: 'อยู่ในช่วงเวลางดแจ้งเตือน',
    suggestedStretch: 'กิจกรรมที่แนะนำ',
    suggestedStretchDone: 'ทำครบทุกกิจกรรมแล้ว',
    startSuggestedStretch: 'ทำกิจกรรมนี้',
    progressSummary: '{{completed}}/{{goal}} ครั้งที่ทำสำเร็จ',
    pause: 'พักแจ้งเตือน',
    start: 'เริ่มแจ้งเตือน',
    skip: 'ข้าม',
    doneMetric: 'ทำแล้ว',
    streakMetric: 'ต่อเนื่อง',
    streakValue: '{{days}} วัน',
    skippedMetric: 'ข้าม',
    timelineTitle: 'ไทม์ไลน์',
    timelineEmpty: 'ยังไม่มีรายการขยับร่างกายในวันนี้',
  },
  stretches: {
    eyebrow: 'ท่ายืดเหยียด',
    title: 'ท่าพักสั้น ๆ สำหรับคนทำงานหน้าจอ',
    description:
      'เลือกท่าที่ตรงกับจุดที่รู้สึกตึง เมื่อกดทำเสร็จ ระบบจะอัปเดตความคืบหน้าของวันนี้ในบัญชีของคุณ',
    cooldown: 'รอ {{seconds}} วิ',
    doingCountdown: 'กำลังทำ {{seconds}} วิ',
    completed: 'ทำแล้ว',
    completedCount: 'ทำแล้ว {{count}} ครั้ง',
    markDone: 'ทำเสร็จ',
    repeatDone: 'ทำอีกครั้ง',
  },
  settings: {
    eyebrow: 'ตั้งค่า',
    title: 'ปรับจังหวะพักให้เข้ากับตัวเอง',
    menuDescription:
      'เลือกหมวดที่ต้องการ แล้วเข้าไปปรับรายละเอียดในหน้าตั้งค่าย่อย',
    menuPreferencesGroup: 'การใช้งานแอป',
    menuAccountGroup: 'บัญชี',
    menuSupportGroup: 'นโยบายและเครื่องมือ',
    menuAccountTitle: 'บัญชี',
    menuRemindersTitle: 'การแจ้งเตือน',
    menuRemindersDescription:
      'ปรับรอบเตือน เปิดปิดการเตือน และตั้ง quiet hours',
    menuAppearanceTitle: 'ธีม',
    menuAppearanceDescription: 'เปลี่ยนโหมดสีของแอปให้ตรงกับการใช้งานของคุณ',
    menuLanguageTitle: 'ภาษา',
    menuLanguageDescription: 'เลือกภาษาที่ใช้ในแอป หรือให้ตามเครื่อง',
    menuLegalTitle: 'นโยบายและข้อมูลส่วนตัว',
    menuLegalDescription: 'เปิดดู privacy policy และหน้าขอลบบัญชี',
    menuDebugTitle: 'ทดสอบการแจ้งเตือน',
    menuDebugDescription: 'ใช้ตรวจเสียงและแรงสั่นของ notification บนอุปกรณ์นี้',
    accountPageTitle: 'บัญชี',
    accountPageDescription:
      'จัดการสถานะบัญชี การซิงก์ และตัวเลือกด้านความเป็นส่วนตัว',
    remindersPageTitle: 'การแจ้งเตือน',
    remindersPageDescription:
      'ควบคุมการเตือนให้ลุกขยับและเวลาที่แอปควรเว้นการแจ้งเตือน',
    appearancePageTitle: 'ธีม',
    appearancePageDescription:
      'เลือกโหมดสีที่เหมาะกับสภาพแสงและสไตล์การใช้งานของคุณ',
    languagePageTitle: 'ภาษา',
    languagePageDescription:
      'ตั้งค่าภาษาหลักของแอปหรือปล่อยให้ตามระบบของเครื่อง',
    legalPageTitle: 'นโยบายและข้อมูลส่วนตัว',
    legalPageDescription: 'รวมลิงก์นโยบายที่ใช้กับในแอปและ Google Play Console',
    debugPageTitle: 'ทดสอบการแจ้งเตือน',
    debugPageDescription:
      'ส่ง notification ทันทีเพื่อตรวจพฤติกรรมจริงของอุปกรณ์นี้',
    signedInAccount: 'บัญชีที่เข้าสู่ระบบ',
    unknownUser: 'ผู้ใช้บัญชี Move Alert',
    synced: 'ซิงก์กับบัญชีแล้ว',
    syncing: 'กำลังซิงก์กับบัญชี...',
    syncError: 'ซิงก์ข้อมูลไม่สำเร็จ',
    signOut: 'ออกจากระบบ',
    deleteAccount: 'ลบบัญชี',
    deleteAccountConfirm: 'ยืนยันการลบบัญชี',
    deleteAccountDescription:
      'การลบบัญชีจะลบข้อมูลการใช้งานและการตั้งค่าเตือนทั้งหมดของคุณออกจากระบบอย่างถาวร',
    cancelDeleteAccount: 'ยกเลิก',
    legalTitle: 'นโยบายและสิทธิข้อมูล',
    legalDescription:
      'เปิดดูนโยบายความเป็นส่วนตัวและหน้าขอให้ลบบัญชีสำหรับใช้ใน Play Console และภายในแอป',
    privacyPolicy: 'นโยบายความเป็นส่วนตัว',
    accountDeletionPolicy: 'หน้าขอลบบัญชี',
    notificationDebugTitle: 'ทดสอบการแจ้งเตือน',
    notificationDebugDescription:
      'ส่งการแจ้งเตือนทันทีผ่าน channel เดียวกับที่ใช้เตือนจริง เพื่อเช็กเสียงและแรงสั่นบนอุปกรณ์นี้',
    notificationDebugSend: 'ส่ง Noti ทดสอบ',
    notificationDebugSent:
      'ส่งการแจ้งเตือนทดสอบแล้ว กรุณาเช็กแถบการแจ้งเตือนของอุปกรณ์',
    notificationDebugPermissionDenied:
      'แอปยังไม่ได้รับสิทธิ์แจ้งเตือน กรุณาอนุญาตก่อนทดสอบ',
    notificationDebugUnsupported:
      'ปุ่มทดสอบนี้รองรับเฉพาะ Android build ที่มี native notifications',
    themeTitle: 'ธีมของแอป',
    themeDescription: 'เลือกรูปแบบสีของแอป หรือให้ตามค่าระบบของเครื่อง',
    themeSystem: 'ระบบ',
    themeLight: 'สว่าง',
    themeDark: 'มืด',
    languageTitle: 'ภาษาของแอป',
    languageDescription: 'เลือกภาษาของแอป หรือให้ตามค่าภาษาของเครื่อง',
    languageSystem: 'ระบบ',
    languageThai: 'ไทย',
    languageEnglish: 'English',
    reminderInterval: 'รอบการแจ้งเตือน',
    reminderIntervalDescription: 'เลือกความถี่ที่แอปควรเตือนให้ขยับร่างกาย',
    minutes: 'นาที',
    movementReminders: 'แจ้งเตือนให้ขยับ',
    quietHours: 'ช่วงเวลางดแจ้งเตือน',
    quietHoursDescription: 'แอปจะไม่แจ้งเตือนในช่วงเวลานี้ของวันที่เลือก',
    quietHoursStart: 'เริ่ม',
    quietHoursEnd: 'สิ้นสุด',
    quietHoursDays: 'วันที่งดแจ้งเตือน',
    quietHoursInvalidTime: 'กรอกเวลาเป็นรูปแบบ HH:MM',
  },
  timeline: {
    neckResetCompleted: 'ทำท่ายืดคอแล้ว',
    shoulderRollsCompleted: 'ทำท่าหมุนไหล่แล้ว',
    wristReleaseCompleted: 'ทำท่าคลายข้อมือแล้ว',
    deskBackStretchCompleted: 'ทำท่ายืดหลังข้างโต๊ะแล้ว',
    shoulderReminderSkipped: 'ข้ามการแจ้งเตือนไหล่',
    breakSkipped: 'ข้ามเวลาพักขยับร่างกาย',
    nextMovementBreak: 'พักขยับร่างกายครั้งถัดไป',
  },
  legal: {
    privacyPolicyTitle: 'นโยบายความเป็นส่วนตัว',
    privacyPolicyUpdated: 'อัปเดตล่าสุด 16 พฤษภาคม 2026',
    accountDeletionTitle: 'ขอลบบัญชี',
    accountDeletionUpdated: 'อัปเดตล่าสุด 16 พฤษภาคม 2026',
    accountDeletionIntro:
      'กรอกอีเมลของบัญชีที่ต้องการลบ ระบบจะบันทึกคำขอไว้ให้ทีมผู้ดูแลดำเนินการ',
    accountDeletionEmailLabel: 'อีเมลบัญชี',
    accountDeletionReasonLabel: 'เหตุผลเพิ่มเติม (ไม่บังคับ)',
    accountDeletionSubmit: 'ส่งคำขอลบบัญชี',
    accountDeletionSuccess:
      'ส่งคำขอลบบัญชีแล้ว เราจะใช้คำขอนี้เพื่อติดต่อและดำเนินการลบข้อมูลของคุณ',
    accountDeletionError: 'ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้งในภายหลัง',
    accountDeletionInAppTitle: 'ถ้าคุณยังเข้าแอปได้',
    accountDeletionInAppBody:
      'คุณสามารถไปที่ Settings > Delete account เพื่อทำการลบบัญชีได้ทันทีจากในแอป',
    privacyOverviewTitle: 'ข้อมูลที่เราเก็บ',
    privacyOverviewBody:
      'แอปเก็บข้อมูลอีเมลสำหรับการยืนยันตัวตน รวมถึงการตั้งค่าการเตือนและประวัติการขยับร่างกายที่เชื่อมกับบัญชีของคุณ',
    privacyUseTitle: 'การใช้งานข้อมูล',
    privacyUseBody:
      'เราใช้ข้อมูลเพื่อเข้าสู่ระบบ ซิงก์สถานะการเตือน แสดงความคืบหน้า และรองรับการแจ้งเตือนบนอุปกรณ์ของคุณ',
    privacySharingTitle: 'การเปิดเผยข้อมูล',
    privacySharingBody:
      'ข้อมูลถูกประมวลผลผ่าน Supabase ในฐานะผู้ให้บริการโครงสร้างพื้นฐานของแอป และไม่ได้ขายข้อมูลให้เครือข่ายโฆษณา',
    privacyRetentionTitle: 'การเก็บรักษาและการลบ',
    privacyRetentionBody:
      'ข้อมูลจะถูกเก็บไว้จนกว่าคุณจะลบบัญชี เมื่อมีการลบบัญชี ข้อมูลที่ผูกกับบัญชีจะถูกลบออกตามกระบวนการของระบบ',
    privacyContactTitle: 'คำขอด้านความเป็นส่วนตัว',
    privacyContactBody:
      'หากต้องการขอลบข้อมูลหรือสอบถามเรื่องความเป็นส่วนตัว กรุณาใช้หน้าขอลบบัญชีซึ่งเป็นช่องทางรับคำขออย่างเป็นทางการของแอป',
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
  notifications: {
    channelName: 'Move reminders',
    channelDescription: 'Timed movement reminders with strong vibration.',
    reminderTitle: 'Time to move',
    reminderBody: 'Stand up, stretch, and reset your posture for a moment.',
  },
  weekdays: {
    sunday: 'Sun',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
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
    reminderInterval: 'Reminder interval',
    nextReminderAt: 'Next at {{time}}',
    remindersPaused: 'Reminders are paused',
    remindersPausedValue: 'Paused',
    quietHoursActive: 'Quiet hours are active',
    suggestedStretch: 'Suggested activity',
    suggestedStretchDone: 'All activities completed',
    startSuggestedStretch: 'Do this activity',
    progressSummary: '{{completed}}/{{goal}} completed',
    pause: 'Pause',
    start: 'Start',
    skip: 'Skip',
    doneMetric: 'Done',
    streakMetric: 'Streak',
    streakValue: '{{days}} days',
    skippedMetric: 'Skipped',
    timelineTitle: 'Timeline',
    timelineEmpty: 'No movement activity yet today.',
  },
  stretches: {
    eyebrow: 'Stretches',
    title: 'Quick resets for screen-heavy work',
    description:
      "Choose the stretch that matches where you feel tight. Completing one updates today's progress in your account.",
    cooldown: 'Wait {{seconds}}s',
    doingCountdown: 'Doing {{seconds}}s',
    completed: 'Done',
    completedCount: 'Done {{count}} times',
    markDone: 'Mark done',
    repeatDone: 'Do again',
  },
  settings: {
    eyebrow: 'Settings',
    title: 'Tune break timing to fit your day',
    menuDescription:
      'Choose a category, then adjust the details inside each settings page.',
    menuPreferencesGroup: 'App preferences',
    menuAccountGroup: 'Account',
    menuSupportGroup: 'Policies and tools',
    menuAccountTitle: 'Account',
    menuRemindersTitle: 'Reminders',
    menuRemindersDescription:
      'Adjust reminder cadence, toggle reminders, and configure quiet hours.',
    menuAppearanceTitle: 'Appearance',
    menuAppearanceDescription:
      'Change the app theme to match how and where you use it.',
    menuLanguageTitle: 'Language',
    menuLanguageDescription:
      'Choose the app language or follow your device language.',
    menuLegalTitle: 'Privacy and policies',
    menuLegalDescription:
      'Open the privacy policy and the account deletion request page.',
    menuDebugTitle: 'Notification debug',
    menuDebugDescription:
      'Check the reminder notification sound and vibration on this device.',
    accountPageTitle: 'Account',
    accountPageDescription:
      'Manage your account status, sync state, and privacy actions.',
    remindersPageTitle: 'Reminders',
    remindersPageDescription:
      'Control movement reminders and when the app should stay quiet.',
    appearancePageTitle: 'Appearance',
    appearancePageDescription:
      'Choose the color mode that fits your lighting and workflow.',
    languagePageTitle: 'Language',
    languagePageDescription:
      'Set the primary app language or follow the device setting.',
    legalPageTitle: 'Privacy and policies',
    legalPageDescription:
      'One place for the policy links used in-app and in Google Play.',
    debugPageTitle: 'Notification debug',
    debugPageDescription:
      'Send an immediate notification to verify real device behavior.',
    signedInAccount: 'Signed-in account',
    unknownUser: 'Move Alert account user',
    synced: 'Synced with your account',
    syncing: 'Syncing with your account...',
    syncError: 'Sync failed',
    signOut: 'Sign out',
    deleteAccount: 'Delete account',
    deleteAccountConfirm: 'Confirm account deletion',
    deleteAccountDescription:
      'Deleting your account permanently removes your reminder settings and movement history from the system.',
    cancelDeleteAccount: 'Cancel',
    legalTitle: 'Policies and data rights',
    legalDescription:
      'Open the privacy policy and account deletion page used for Google Play and in-app access.',
    privacyPolicy: 'Privacy Policy',
    accountDeletionPolicy: 'Account deletion page',
    notificationDebugTitle: 'Notification debug',
    notificationDebugDescription:
      'Send an immediate notification through the same channel used by real reminders to verify sound and vibration on this device.',
    notificationDebugSend: 'Send test notification',
    notificationDebugSent:
      'Test notification sent. Check the device notification tray.',
    notificationDebugPermissionDenied:
      'Notification permission is not granted yet. Allow notifications before testing.',
    notificationDebugUnsupported:
      'This debug action is only supported in Android builds with native notifications.',
    themeTitle: 'App theme',
    themeDescription:
      'Choose the app appearance or follow your device setting.',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    languageTitle: 'App language',
    languageDescription:
      'Choose the app language or follow your device language.',
    languageSystem: 'System',
    languageThai: 'Thai',
    languageEnglish: 'English',
    reminderInterval: 'Reminder interval',
    reminderIntervalDescription:
      'Choose how often the app should remind you to move.',
    minutes: 'minutes',
    movementReminders: 'Movement reminders',
    quietHours: 'Quiet hours',
    quietHoursDescription:
      'The app will not send reminders during this time on selected days.',
    quietHoursStart: 'Start',
    quietHoursEnd: 'End',
    quietHoursDays: 'Quiet days',
    quietHoursInvalidTime: 'Use HH:MM time format',
  },
  timeline: {
    neckResetCompleted: 'Neck reset completed',
    shoulderRollsCompleted: 'Shoulder rolls completed',
    wristReleaseCompleted: 'Wrist release completed',
    deskBackStretchCompleted: 'Desk back stretch completed',
    shoulderReminderSkipped: 'Shoulder reminder skipped',
    breakSkipped: 'Movement break skipped',
    nextMovementBreak: 'Next movement break',
  },
  legal: {
    privacyPolicyTitle: 'Privacy Policy',
    privacyPolicyUpdated: 'Last updated May 16, 2026',
    accountDeletionTitle: 'Account deletion request',
    accountDeletionUpdated: 'Last updated May 16, 2026',
    accountDeletionIntro:
      'Enter the email address for the account you want deleted. The request will be recorded for the Move Alert team to process.',
    accountDeletionEmailLabel: 'Account email',
    accountDeletionReasonLabel: 'Additional note (optional)',
    accountDeletionSubmit: 'Submit deletion request',
    accountDeletionSuccess:
      'Your deletion request has been submitted. We will use this request to process removal of your account data.',
    accountDeletionError:
      'Unable to submit your request right now. Please try again later.',
    accountDeletionInAppTitle: 'If you can still access the app',
    accountDeletionInAppBody:
      'Go to Settings > Delete account to remove your account immediately from inside the app.',
    privacyOverviewTitle: 'What we collect',
    privacyOverviewBody:
      'The app stores your account email for authentication and keeps reminder settings plus movement history linked to your account.',
    privacyUseTitle: 'How we use it',
    privacyUseBody:
      'We use this data to sign you in, sync reminder state, show progress, and support on-device notifications.',
    privacySharingTitle: 'How data is shared',
    privacySharingBody:
      'Data is processed through Supabase as the app infrastructure provider and is not sold to advertising networks.',
    privacyRetentionTitle: 'Retention and deletion',
    privacyRetentionBody:
      'Data is retained until you delete your account. When account deletion is processed, account-linked data is removed through the app system.',
    privacyContactTitle: 'Privacy requests',
    privacyContactBody:
      'For deletion requests or privacy questions, use the account deletion page, which is the app’s official request pathway.',
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
export type SupportedLanguage = z.infer<typeof supportedLanguageSchema>;

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
  if (languageModeOverride !== 'system') {
    return languageModeOverride;
  }

  const [locale] = getLocales();
  const languageCode = locale?.languageCode?.toLowerCase();
  const languageTagLanguage = locale?.languageTag.toLowerCase().split('-')[0];

  return (
    parseSupportedLanguage(languageCode) ??
    parseSupportedLanguage(languageTagLanguage) ??
    fallbackLanguage
  );
}

export function setLanguageModeOverride(mode: LanguageMode) {
  languageModeOverride = mode;
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
