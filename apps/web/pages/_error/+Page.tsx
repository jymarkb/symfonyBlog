import { usePageContext } from "vike-react/usePageContext";

import { AppShell } from "@/layouts/AppShell";
import { ErrorPage } from "@/components/common/ErrorPage";

export default function Page() {
  const { is404 } = usePageContext();

  return (
    <AppShell>
      <ErrorPage code={is404 ? 404 : 500} />
    </AppShell>
  );
}
