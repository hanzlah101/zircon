"use client";

import { Button } from "./ui/button";
import { useCopyToClipboard } from "usehooks-ts";
import { Fragment, useState } from "react";
import { IconCopy, IconCopyCheckFilled } from "@tabler/icons-react";

type ItemWithCopyButtonProps = {
  text: string;
  className?: string;
  asChild?: boolean;
};

export function ItemWithCopyButton({
  text,
  className,
  asChild,
}: ItemWithCopyButtonProps) {
  const [_, copy] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    setCopied(true);
    copy(text);
    setTimeout(() => setCopied(false), 1250);
  };

  const Icon = copied ? IconCopyCheckFilled : IconCopy;
  const IconWrapper = asChild ? "div" : Fragment;

  return (
    <div className="group flex items-center gap-x-2">
      <span className={className}>{text}</span>
      <Button
        asChild={asChild}
        size={"icon"}
        onClick={onCopy}
        aria-label="Copy"
        variant={"ghost"}
        className="size-7 text-muted-foreground opacity-0 transition hover:text-foreground group-hover:opacity-100"
      >
        <IconWrapper>
          <Icon className="size-4" />
        </IconWrapper>
      </Button>
    </div>
  );
}
