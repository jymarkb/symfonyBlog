import { SignUpIntro } from '@/features/auth/components/SignUpIntro'
import { SignUpSidePanel } from '@/features/auth/components/SignUpSidePanel'
import { AuthShell } from '@/layouts/AuthShell'

export default function Page() {
  return (
    <AuthShell side={<SignUpSidePanel />} sidePlacement="start">
      <SignUpIntro />
      {/* form renders here */}
    </AuthShell>
  )
}
