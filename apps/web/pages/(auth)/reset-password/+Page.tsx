import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { ResetPasswordSidePanel } from "@/features/auth/components/ResetPasswordSidePanel";
import { AuthShell } from "@/layouts/AuthShell";

export default function Page() {
  return (
    <AuthShell side={<ResetPasswordSidePanel />}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
