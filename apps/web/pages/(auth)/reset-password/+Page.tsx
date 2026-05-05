import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { ResetPasswordIntro } from "@/features/auth/components/ResetPasswordIntro";
import { ResetPasswordSidePanel } from "@/features/auth/components/ResetPasswordSidePanel";
import { AuthShell } from "@/layouts/AuthShell";

export default function Page() {
  return (
    <AuthShell side={<ResetPasswordSidePanel />}>
      <ResetPasswordIntro />
      <ResetPasswordForm />
    </AuthShell>
  );
}
