import { z } from 'zod';

import { t } from '@/components/move-alert/i18n';

const emailSchema = z
  .string()
  .trim()
  .pipe(z.email(t('auth.screen.invalidEmail')));

const passwordSchema = z.string().min(6, t('auth.screen.passwordTooShort'));

export const authFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const authEmailSchema = z.object({
  email: emailSchema,
});

export type AuthFormInput = z.infer<typeof authFormSchema>;
export type AuthEmailInput = z.infer<typeof authEmailSchema>;

export function getValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? t('auth.screen.invalidEmail');
}
