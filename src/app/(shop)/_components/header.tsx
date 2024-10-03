"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Logo, LogoIcon } from "@/components/logo";
import { useBagModal } from "@/stores/use-bag-modal";
import {
  IconSearch,
  IconShoppingBag,
  IconUser,
  type Icon,
} from "@tabler/icons-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { useCartStore } from "@/stores/use-cart-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthModal } from "@/stores/use-auth-modal";

export function Header() {
  const { cart } = useCartStore();
  const { onOpen } = useBagModal();

  const { onOpen: onLogin } = useAuthModal();

  const cartItemsCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.qty, 0),
    [cart],
  );

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-20 w-full items-center bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-x-4">
          <ThemeToggle />
          <HeaderButton icon={IconSearch} label="Search" />
        </div>
        <Logo wrapperClassName="hidden sm:block" />
        <LogoIcon wrapperClassName="sm:hidden" />
        <div className="flex items-center gap-x-4">
          <HeaderButton
            onClick={() => onLogin("login")}
            icon={IconUser}
            label="Sign in"
          />
          <HeaderButton
            onClick={onOpen}
            icon={IconShoppingBag}
            label="Bag"
            className="relative"
          >
            <span
              className={cn(
                "absolute -bottom-3 -right-2 z-10 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground transition-all md:-bottom-2.5",
                { "scale-0": !cartItemsCount },
              )}
            >
              {cartItemsCount >= 10 ? "9+" : cartItemsCount}
            </span>
          </HeaderButton>
        </div>
      </div>
    </header>
  );
}

type HeaderButtonProps = React.ComponentProps<typeof TooltipTrigger> & {
  icon: Icon;
  label: string;
};

function HeaderButton({
  label,
  className,
  children,
  icon: Icon,
  ...props
}: HeaderButtonProps) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger
        aria-label={label}
        className={cn(
          "text-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        <Icon className="size-5 md:size-[23px]" />
        {children}
      </TooltipTrigger>
      <TooltipContent side={"bottom"} sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
