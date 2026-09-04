import { getAdminGroup } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import AdminNav from "./AdminNav";

export default async function AdminShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  const group = await getAdminGroup();
  if (!group) redirect("/admin/login");

  return (
    <div className="min-h-dvh flex flex-col sm:flex-row">
      <AdminNav groupName={group.name} active={active} />
      <main className="flex-1 min-w-0 px-5 sm:px-8 py-6 pb-16 max-w-4xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
