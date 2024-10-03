import { useEffect, useRef, useState } from "react";
import { useEditor } from "novel";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { IconCheck, IconTrash } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
interface LinkSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkSelector = ({ open, onOpenChange }: LinkSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { editor } = useEditor();

  const [value, setValue] = useState(editor?.getAttributes("link").href || "");

  useEffect(() => {
    inputRef.current?.focus();
  });
  if (!editor) return null;

  const handleLink = () => {
    const url = getUrlFromString(value);
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
      onOpenChange(false);
      setValue("");
    }
  };

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="gap-2 rounded-none border-none"
        >
          <p className="text-base">↗</p>
          <p
            className={cn("underline decoration-stone-400 underline-offset-4", {
              "text-blue-500": editor.isActive("link"),
            })}
          >
            Link
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0" sideOffset={10}>
        <div className="flex p-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Paste a link"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 bg-background p-1 text-sm outline-none"
            defaultValue={editor.getAttributes("link").href || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLink();
            }}
          />
          {editor.getAttributes("link").href ? (
            <Button
              size="icon"
              variant="outline"
              type="button"
              className="flex h-8 items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLink();
              }}
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                if (inputRef.current) inputRef.current.value = "";
                onOpenChange(false);
              }}
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" className="h-8" onClick={handleLink}>
              <IconCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
