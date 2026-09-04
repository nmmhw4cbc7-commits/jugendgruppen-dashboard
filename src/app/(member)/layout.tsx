import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import BottomNav, { DesktopNav } from "@/components/BottomNav";
import Link from "next/link";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember();
  if (!member) redirect("/onboarding");

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/neues" className="font-semibold text-[15px] tracking-tight text-ink">
            {member.groupName}
          </Link>
          <DesktopNav />
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-6 py-6 pb-24 sm:pb-10">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
