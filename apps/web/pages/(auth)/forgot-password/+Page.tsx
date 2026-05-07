import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { ForgotPasswordSidePanel } from '@/features/auth/components/ForgotPasswordSidePanel'
import { AuthShell } from '@/layouts/AuthShell'

export default function Page() {
  return (
    <AuthShell side={<ForgotPasswordSidePanel />}>
      <ForgotPasswordForm />
    </AuthShell>
  )
}
