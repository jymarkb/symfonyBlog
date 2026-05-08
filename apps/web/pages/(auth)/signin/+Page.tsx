import { SignInForm } from '@/features/auth/components/SignInForm'
import { SignInSidePanel } from '@/features/auth/components/SignInSidePanel'
import { AuthShell } from '@/layouts/AuthShell'
import { AuthIntro } from '@/components/ui/AuthIntro'

export default function Page() {
  return (
    <AuthShell side={<SignInSidePanel />}>
      <AuthIntro
        eyebrow="Sign in · returning reader"
        heading="Welcome"
        em="back"
        lede="Sign in to comment, save reading positions, and keep track of threads you're following."
      />
      <SignInForm />
    </AuthShell>
  )
}
