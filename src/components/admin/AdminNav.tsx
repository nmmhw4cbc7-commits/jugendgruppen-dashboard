import Link from "next/link";
import { adminLogout } from "@/lib/actions/admin-auth";

const LINKS = [
  { href: "/admin", label: "Dashboard", key: "dashboard" },
  { href: "/admin/termine", label: "Termine", key: "termine" },
  { href: "/admin/anwesenheit", label: "Anwesenheit", key: "anwesenheit" },
  { href: "/admin/anliegen", label: "Anliegen", key: "anliegen" },
  { href: "/admin/vorschlaege", label: "Vorschläge", key: "vorschlaege" },
  { href: "/admin/mitglieder", label: "Mitglieder", key: "mitglieder" },
];

export default function AdminNav({ groupName, active }: { groupName: string; active: string }) {
  return (
    <aside className="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-line bg-card">
      <div className="px-5 sm:px-6 py-5">
        <p className="text-[11.5px] font-medium text-subtle uppercase tracking-wide">Admin</p>
        <p className="font-semibold text-ink text-[16px] mt-0.5">{groupName}</p>
      </div>
      <nav className="px-3 sm:px-3 pb-4 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
        {LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={`whitespace-nowrap px-3 py-2 rounded-md text-[14px] font-medium transition ${
              active === link.key
                ? "bg-ink text-white"
                : "text-subtle hover:text-ink hover:bg-black/[0.03]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 pb-5 hidden sm:block">
        <form action={adminLogout}>
          <button type="submit" className="btn-ghost w-full justify-start text-[13.5px] px-3">
            Abmelden
          </button>
        </form>
      </div>
    </aside>
  );
}
