import { z } from 'zod';

import { t } from '@/components/move-alert/i18n';

function createEmailSchema() {
  return z
    .string()
    .trim()
    .pipe(z.email(t('auth.screen.invalidEmail')));
}

function createPasswordSchema() {
  return z.string().min(6, t('auth.screen.passwordTooShort'));
}

export function getAuthFormSchema() {
  return z.object({
    email: createEmailSchema(),
    password: createPasswordSchema(),
  });
}

export function getAuthEmailSchema() {
  return z.object({
    email: createEmailSchema(),
  });
}

export type AuthFormInput = z.infer<ReturnType<typeof getAuthFormSchema>>;
export type AuthEmailInput = z.infer<ReturnType<typeof getAuthEmailSchema>>;

export function getValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? t('auth.screen.invalidEmail');
}
