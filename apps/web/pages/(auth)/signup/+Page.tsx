import { SignUpForm } from '@/features/auth/components/SignUpForm'
import { SignUpSidePanel } from '@/features/auth/components/SignUpSidePanel'
import { RequireGuest } from '@/features/auth/guards'
import { AuthShell } from '@/layouts/AuthShell'

export default function Page() {
  return (
    <RequireGuest>
      <AuthShell side={<SignUpSidePanel />} sidePlacement="start">
        <SignUpForm />
      </AuthShell>
    </RequireGuest>
  )
}
