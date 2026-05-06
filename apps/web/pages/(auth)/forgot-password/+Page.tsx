import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { ForgotPasswordSidePanel } from '@/features/auth/components/ForgotPasswordSidePanel'
import { RequireGuest } from '@/features/auth/guards'
import { AuthShell } from '@/layouts/AuthShell'

export default function Page() {
  return (
    <RequireGuest>
      <AuthShell side={<ForgotPasswordSidePanel />}>
        <ForgotPasswordForm />
      </AuthShell>
    </RequireGuest>
  )
}
