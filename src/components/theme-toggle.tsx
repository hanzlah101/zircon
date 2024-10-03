"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="relative inline-flex text-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
      >
        <IconSun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 md:size-[23px]" />
        <IconMoon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 md:size-[23px]" />
      </TooltipTrigger>
      <TooltipContent side={"bottom"} sideOffset={10}>
        {resolvedTheme === "dark" ? "Light" : "Dark"}
      </TooltipContent>
    </Tooltip>
  );
}
