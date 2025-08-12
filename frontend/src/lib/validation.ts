import { z } from 'zod'

// ログイン用スキーマ
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください')
})

// 新規登録用スキーマ
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください'),
  name: z
    .string()
    .min(1, '名前を入力してください')
})

// パスワードリセット申請用スキーマ
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください')
})

// パスワード再設定用スキーマ
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください'),
  passwordConfirmation: z
    .string()
    .min(6, 'パスワード確認は6文字以上で入力してください')
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'パスワードが一致しません',
  path: ['passwordConfirmation']
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>