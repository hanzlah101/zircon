import { DashboardSidebar } from "./_components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardSidebar />
      <div className="px-4 py-6 sm:ml-14 md:px-10">{children}</div>
    </>
  );
}
