"use client";

import { Logo, LogoIcon } from "@/components/logo";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconCubePlus,
  IconTruckDelivery,
  IconUsers,
  IconUserShield,
  IconPercentage,
  IconSettings,
  type Icon,
} from "@tabler/icons-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useDashboardSidebar } from "@/stores/use-dashboard-sidebar";

type SidebarItem = {
  label: string;
  href: string;
  icon: Icon;
  isActive: boolean;
};

function useSidebarItems(): SidebarItem[] {
  const pathname = usePathname();

  return [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: IconLayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: IconTruckDelivery,
      isActive: pathname.startsWith("/dashboard/orders"),
    },
    {
      label: "Products",
      href: "/dashboard/products",
      icon: IconShoppingBag,
      isActive:
        pathname.startsWith("/dashboard/products") &&
        pathname !== "/dashboard/products/create",
    },
    {
      label: "New Product",
      href: "/dashboard/products/create",
      icon: IconCubePlus,
      isActive: pathname === "/dashboard/products/create",
    },
    {
      label: "Discounts",
      href: "/dashboard/discounts",
      icon: IconPercentage,
      isActive: pathname.startsWith("/dashboard/discounts"),
    },
    {
      label: "Customers",
      href: "/dashboard/customers",
      icon: IconUsers,
      isActive: pathname.startsWith("/dashboard/customers"),
    },
    {
      label: "Moderators",
      href: "/dashboard/moderators",
      icon: IconUserShield,
      isActive: pathname.startsWith("/dashboard/moderators"),
    },
  ];
}

export function DashboardSidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}

const DesktopSidebar = () => {
  const items = useSidebarItems();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-3 px-2 py-6">
        <LogoIcon href="/dashboard" className="mb-6" />
        {items.map((item) => (
          <DesktopSidebarItem key={item.href} {...item} />
        ))}
      </nav>

      {/* TODO: add settings */}
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
        <DesktopSidebarItem
          href="#"
          isActive={false}
          label="Settings"
          icon={IconSettings}
        />
      </nav>
    </aside>
  );
};

function DesktopSidebarItem(item: SidebarItem) {
  const { href, isActive, label, icon: Icon } = item;

  return (
    <Tooltip delayDuration={150} key={href}>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "flex size-9 items-center justify-center rounded-md transition-colors focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none",
            isActive
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Icon className="size-[21px]" />
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

const MobileSidebar = () => {
  const items = useSidebarItems();

  const { isOpen, onClose, onOpenChange } = useDashboardSidebar();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:hidden">
        <nav className="grid gap-5 text-lg font-medium">
          <Logo className="mb-4" />
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-4 transition-colors",
                item.isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
