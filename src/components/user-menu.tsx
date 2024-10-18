"use client";

import type { User } from "lucia";
import { useState } from "react";

import {
  IconLayoutDashboard,
  IconLogout2,
  IconLock,
  IconUser,
  IconUserCog,
  IconClipboardList,
  IconTruckDelivery,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useServerAction } from "@/hooks/use-server-action";
import { logout } from "@/actions/auth/auth.actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { getErrorMessage } from "@/lib/errors";
import { useTrackOrderModal } from "@/stores/use-track-order-modal";

type UserMenuProps = {
  user: User;
};

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  const { onOpen: onTrackOrder } = useTrackOrderModal();

  const { mutate: logoutUser, isPending } = useServerAction(logout, {
    onSuccess: () => window?.location.reload(),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip delayDuration={150}>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger className="text-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none">
            <IconUser className="size-5 md:size-[23px]" />
            <span className="sr-only">User Menu</span>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        <TooltipContent side={"bottom"} sideOffset={10}>
          My Account
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent sideOffset={10} className="min-w-56 rounded-2xl">
        <div className="flex items-center gap-x-2 p-2">
          <Image
            objectFit="cover"
            src={"/user-placeholder.jpg"}
            alt={user.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <DropdownMenuLabel className="px-0 py-0">
              {user.name}
            </DropdownMenuLabel>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="space-y-1">
          {user.role === "admin" || user.role === "moderator" ? (
            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
              <Link href="/dashboard">
                <IconLayoutDashboard className="mr-2 size-[18px]" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem
            className="rounded-xl px-3 py-2.5"
            onSelect={() => {
              onTrackOrder();
              setOpen(false);
            }}
          >
            <IconTruckDelivery className="mr-2 size-[18px]" />
            Track Order
          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl px-3 py-2.5">
            <IconClipboardList className="mr-2 size-[18px]" />
            My Orders
          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl px-3 py-2.5">
            <IconUserCog className="mr-2 size-[18px]" />
            Update Profile
          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl px-3 py-2.5">
            <IconLock className="mr-2 size-[18px]" />
            Update Password
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={isPending}
            onSelect={() => logoutUser()}
            className="rounded-xl px-3 py-2.5 text-destructive"
          >
            <IconLogout2 className="mr-2 size-[18px]" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
