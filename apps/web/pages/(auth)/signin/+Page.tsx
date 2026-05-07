import { SignInForm } from '@/features/auth/components/SignInForm'
import { SignInIntro } from '@/features/auth/components/SignInIntro'
import { SignInSidePanel } from '@/features/auth/components/SignInSidePanel'
import { AuthShell } from '@/layouts/AuthShell'

export default function Page() {
  return (
    <AuthShell side={<SignInSidePanel />}>
      <SignInIntro />
      <SignInForm />
    </AuthShell>
  )
}
