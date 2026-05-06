import { SignInForm } from '@/features/auth/components/SignInForm'
import { SignInIntro } from '@/features/auth/components/SignInIntro'
import { SignInSidePanel } from '@/features/auth/components/SignInSidePanel'
import { RequireGuest } from '@/features/auth/guards'
import { AuthShell } from '@/layouts/AuthShell'

export default function Page() {
  return (
    <RequireGuest>
      <AuthShell side={<SignInSidePanel />}>
        <SignInIntro />
        <SignInForm />
      </AuthShell>
    </RequireGuest>
  )
}
