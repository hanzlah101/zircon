import * as React from "react";
import { IconCheck, IconSelector } from "@tabler/icons-react";
import type {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { useControllableState } from "@/hooks/use-controllable-state";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

const ComboboxInput = CommandInput;

const ComboboxEmpty = CommandEmpty;

const ComboboxGroup = CommandGroup;

const ComboboxList = CommandList;

interface ComboboxContextType {
  value: string;
  onValueChange: (value: string) => void;
  open?: boolean;
  setOpen: (value: boolean) => void;
}

const ComboboxContext = React.createContext<ComboboxContextType | undefined>(
  undefined,
);

const useCombobox = () => {
  const context = React.useContext(ComboboxContext);
  if (context === undefined) {
    throw new Error("useCombobox must be used within a ComboboxProvider");
  }
  return context;
};

interface ComboboxProps extends PopoverProps {
  value: string;
  onValueChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
}

const Combobox = ({ value, onValueChange, ...props }: ComboboxProps) => {
  const [open, setOpen] = useControllableState<boolean>({
    prop: props.open,
    onChange: props.onOpenChange,
  });

  return (
    <ComboboxContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <Popover open={open} onOpenChange={setOpen} {...props} />
    </ComboboxContext.Provider>
  );
};

interface ComboboxTriggerProps extends PopoverTriggerProps {
  placeholder: string;
}

const ComboboxTrigger = ({
  className,
  placeholder,
  ...props
}: ComboboxTriggerProps) => {
  const { value } = useCombobox();
  return (
    <PopoverTrigger
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-accent/50 px-3 py-2 text-sm transition focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=open]:border-transparent data-[state=open]:ring-2 data-[state=open]:ring-ring",
        className,
      )}
      {...props}
    >
      {value || <span className="text-muted-foreground/50">{placeholder}</span>}
      <IconSelector className="size-4 shrink-0 opacity-50" />
    </PopoverTrigger>
  );
};

interface ComboboxContentProps extends PopoverContentProps {
  commandProps?: Omit<React.ComponentProps<typeof Command>, "className">;
}

const ComboboxContent = ({
  children,
  className,
  commandProps,
  ...props
}: ComboboxContentProps) => {
  return (
    <PopoverContent
      className={cn("overflow-hidden p-0 shadow-lg", className)}
      {...props}
    >
      <Command
        className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-[18px]"
        {...commandProps}
      >
        {children}
      </Command>
    </PopoverContent>
  );
};

interface ComboboxItemProps extends React.ComponentProps<typeof CommandItem> {
  value: string;
}

const ComboboxItem = ({ className, children, ...props }: ComboboxItemProps) => {
  const { onValueChange, value, setOpen } = useCombobox();

  const onSelect = () => {
    setOpen(false);
    onValueChange(props.value);
  };

  return (
    <CommandItem
      className={cn("justify-between", className)}
      onSelect={onSelect}
      {...props}
    >
      {children}
      {props.value === value ? <IconCheck /> : null}
    </CommandItem>
  );
};

export {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
};
