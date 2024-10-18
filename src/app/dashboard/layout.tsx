import { validateAdmin } from "@/lib/auth/validate-request";
import { DashboardSidebar } from "./_components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await validateAdmin();

  return (
    <div>
      <DashboardSidebar />
      <div className="flex h-full min-h-screen flex-col px-4 py-6 sm:ml-14 md:px-10">
        {children}
      </div>
    </div>
  );
}
