import { listGroupsForAdminLogin } from "@/lib/actions/admin-auth";
import { getAdminGroup } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import AdminLoginForm from "./login-form";

export default async function AdminLoginPage() {
  const group = await getAdminGroup();
  if (group) redirect("/admin");

  const groups = await listGroupsForAdminLogin();

  return (
    <main className="min-h-dvh flex flex-col justify-center px-6 py-12 max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold tracking-tight text-ink">Admin-Anmeldung</h1>
        <p className="text-subtle mt-2 text-[14.5px]">
          Wähle deine Gruppe und gib den Zugangscode ein.
        </p>
      </div>
      <AdminLoginForm groups={groups} />
    </main>
  );
}
