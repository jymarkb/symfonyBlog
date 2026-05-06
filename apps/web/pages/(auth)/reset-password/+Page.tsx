import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { ResetPasswordSidePanel } from "@/features/auth/components/ResetPasswordSidePanel";
import { RequireGuest } from "@/features/auth/guards";
import { AuthShell } from "@/layouts/AuthShell";

export default function Page() {
  return (
    <RequireGuest>
      <AuthShell side={<ResetPasswordSidePanel />}>
        <ResetPasswordForm />
      </AuthShell>
    </RequireGuest>
  );
}
