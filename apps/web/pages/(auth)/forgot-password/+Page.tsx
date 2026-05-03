import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { ForgotPasswordIntro } from '@/features/auth/components/ForgotPasswordIntro'
import { ForgotPasswordSidePanel } from '@/features/auth/components/ForgotPasswordSidePanel'
import { AuthShell } from '@/layouts/AuthShell'

export default function Page() {
  return (
    <AuthShell side={<ForgotPasswordSidePanel />}>
      <ForgotPasswordIntro />
      <ForgotPasswordForm />
    </AuthShell>
  )
}
