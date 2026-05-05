import { SignUpForm } from '@/features/auth/components/SignUpForm'
import { SignUpSidePanel } from '@/features/auth/components/SignUpSidePanel'
import { AuthShell } from '@/layouts/AuthShell'

export default function Page() {
  return (
    <AuthShell side={<SignUpSidePanel />} sidePlacement="start">
      <SignUpForm />
    </AuthShell>
  )
}
