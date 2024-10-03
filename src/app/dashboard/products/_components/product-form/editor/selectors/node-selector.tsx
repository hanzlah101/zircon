import { EditorBubbleItem, useEditor } from "novel";
import {
  IconCheck,
  IconSquareRoundedCheck,
  IconChevronDown,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconListNumbers,
  IconAlignJustified,
  IconQuote,
  type Icon,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Popover } from "@radix-ui/react-popover";

export type SelectorItem = {
  name: string;
  icon: Icon;
  command: (editor: ReturnType<typeof useEditor>["editor"]) => void;
  isActive: (editor: ReturnType<typeof useEditor>["editor"]) => boolean;
};

const items: SelectorItem[] = [
  {
    name: "Text",
    icon: IconAlignJustified,
    command: (editor) => editor?.chain().focus().clearNodes().run(),
    isActive: (editor) =>
      (editor?.isActive("paragraph") &&
        !editor?.isActive("bulletList") &&
        !editor?.isActive("orderedList")) ||
      false,
  },
  {
    name: "Heading 1",
    icon: IconH1,
    command: (editor) =>
      editor?.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor?.isActive("heading", { level: 1 }) || false,
  },
  {
    name: "Heading 2",
    icon: IconH2,
    command: (editor) =>
      editor?.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor?.isActive("heading", { level: 2 }) || false,
  },
  {
    name: "Heading 3",
    icon: IconH3,
    command: (editor) =>
      editor?.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor?.isActive("heading", { level: 3 }) || false,
  },
  {
    name: "To-do List",
    icon: IconSquareRoundedCheck,
    command: (editor) =>
      editor?.chain().focus().clearNodes().toggleTaskList().run(),
    isActive: (editor) => editor?.isActive("taskItem") || false,
  },
  {
    name: "Bullet List",
    icon: IconListNumbers,
    command: (editor) =>
      editor?.chain().focus().clearNodes().toggleBulletList().run(),
    isActive: (editor) => editor?.isActive("bulletList") || false,
  },
  {
    name: "Numbered List",
    icon: IconListNumbers,
    command: (editor) =>
      editor?.chain().focus().clearNodes().toggleOrderedList().run(),
    isActive: (editor) => editor?.isActive("orderedList") || false || false,
  },
  {
    name: "Quote",
    icon: IconQuote,
    command: (editor) =>
      editor?.chain().focus().clearNodes().toggleBlockquote().run(),
    isActive: (editor) => editor?.isActive("blockquote") || false,
  },
  {
    name: "Code",
    icon: IconCode,
    command: (editor) =>
      editor?.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (editor) => editor?.isActive("codeBlock") || false,
  },
];
interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();
  if (!editor) return null;
  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
    name: "Multiple",
  };

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        asChild
        className="gap-2 rounded-none border-none hover:bg-accent focus:ring-0"
      >
        <Button size="sm" variant="ghost" className="gap-2">
          <span className="whitespace-nowrap text-sm">{activeItem.name}</span>
          <IconChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={5} align="start" className="w-48 p-1">
        {items.map((item) => (
          <EditorBubbleItem
            key={item.name}
            onSelect={(editor) => {
              item.command(editor);
              onOpenChange(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-accent"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-sm border p-1">
                <item.icon className="h-3 w-3" />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <IconCheck className="h-4 w-4" />}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};
