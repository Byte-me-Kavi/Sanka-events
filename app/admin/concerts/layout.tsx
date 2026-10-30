import { requireAdmin } from "@/lib/supabase/server";
import { AdminHeader } from "../_components/AdminHeader";

export default async function ConcertsLayout({ children }: LayoutProps<"/admin/concerts">) {
  await requireAdmin();

  return (
    <>
      <AdminHeader />
      <main className="adm-main">{children}</main>
    </>
  );
}
