import React, { createContext, useContext } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

type TimelineItemStatus =
  | "default"
  | "current"
  | "done"
  | "intermediate"
  | "error";

interface TimelineItemContextType {
  status: TimelineItemStatus;
}

const TimelineItemContext = createContext<TimelineItemContextType | undefined>(
  undefined,
);

const useTimelineItemContext = () => {
  const context = useContext(TimelineItemContext);
  if (context === undefined) {
    throw new Error(
      "useTimelineItemContext must be used within a TimelineItem",
    );
  }
  return context;
};

const timelineVariants = cva("grid", {
  variants: {
    positions: {
      left: "[&>li]:grid-cols-[0_min-content_1fr]",
      right: "[&>li]:grid-cols-[1fr_min-content]",
      center: "[&>li]:grid-cols-[1fr_min-content_1fr]",
    },
  },
  defaultVariants: {
    positions: "left",
  },
});

interface TimelineProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof timelineVariants> {}

const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ children, className, positions, ...props }, ref) => {
    return (
      <ul
        className={cn(timelineVariants({ positions }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </ul>
    );
  },
);
Timeline.displayName = "Timeline";

const timelineItemVariants = cva("grid items-center gap-x-2", {
  variants: {
    status: {
      default: "text-muted-foreground",
      current: "text-primary",
      done: "text-primary",
      error: "text-destructive",
      intermediate: "text-yellow-600",
    },
  },
  defaultVariants: {
    status: "default",
  },
});

interface TimelineItemProps
  extends React.HTMLAttributes<HTMLLIElement>,
    VariantProps<typeof timelineItemVariants> {
  status?: TimelineItemStatus;
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, status = "default", children, ...props }, ref) => (
    <TimelineItemContext.Provider value={{ status }}>
      <li
        className={cn(timelineItemVariants({ status }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </li>
    </TimelineItemContext.Provider>
  ),
);
TimelineItem.displayName = "TimelineItem";

const timelineDotVariants = cva(
  "col-start-2 col-end-3 row-start-1 row-end-1 flex size-4 items-center justify-center rounded-full border border-current",
  {
    variants: {
      status: {
        default: "[&>*]:hidden",
        current:
          "[&>*:not(.icon-circle)]:hidden [&>.icon-circle]:bg-current [&>.icon-circle]:fill-current",
        done: "bg-primary [&>*:not(.icon-check)]:hidden [&>.icon-check]:text-background",
        error:
          "border-destructive bg-destructive [&>*:not(.icon-cross)]:hidden [&>.icon-cross]:text-background",
        intermediate:
          "[&>*:not(.icon-circle)]:hidden [&>.icon-circle]:bg-yellow-600 [&>.icon-circle]:fill-yellow-600",
      },
    },
    defaultVariants: {
      status: "default",
    },
  },
);

interface TimelineDotProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof timelineDotVariants>, "status"> {
  customIcon?: React.ReactNode;
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, customIcon, ...props }, ref) => {
    const { status } = useTimelineItemContext();
    return (
      <div
        role="status"
        className={cn(timelineDotVariants({ status }), className)}
        ref={ref}
        {...props}
      >
        <div className="icon-circle size-2.5 rounded-full" />
        <IconCheck className="icon-check size-3" />
        <IconX className="icon-cross size-2.5" />
        {customIcon}
      </div>
    );
  },
);
TimelineDot.displayName = "TimelineDot";

const timelineContentVariants = cva(
  "row-start-2 row-end-2 pb-8 text-muted-foreground text-sm",
  {
    variants: {
      side: {
        right: "col-start-3 col-end-4 mr-auto text-left",
        left: "col-start-1 col-end-2 ml-auto text-right",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface TimelineContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineContentVariants> {}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, side, ...props }, ref) => (
    <div
      className={cn(timelineContentVariants({ side }), className)}
      ref={ref}
      {...props}
    />
  ),
);
TimelineContent.displayName = "TimelineContent";

const timelineHeadingVariants = cva(
  "row-start-1 row-end-1 line-clamp-1 max-w-full truncate",
  {
    variants: {
      side: {
        right: "col-start-3 col-end-4 mr-auto text-left",
        left: "col-start-1 col-end-2 ml-auto text-right",
      },
      variant: {
        primary: "text-base font-medium text-primary",
        secondary: "text-sm font-light text-muted-foreground",
      },
    },
    defaultVariants: {
      side: "right",
      variant: "primary",
    },
  },
);

interface TimelineHeadingProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof timelineHeadingVariants> {}

const TimelineHeading = React.forwardRef<
  HTMLParagraphElement,
  TimelineHeadingProps
>(({ className, side, variant, ...props }, ref) => (
  <p
    role="heading"
    aria-level={variant === "primary" ? 2 : 3}
    className={cn(timelineHeadingVariants({ side, variant }), className)}
    ref={ref}
    {...props}
  />
));
TimelineHeading.displayName = "TimelineHeading";

interface TimelineLineProps extends React.HTMLAttributes<HTMLHRElement> {}

const TimelineLine = React.forwardRef<HTMLHRElement, TimelineLineProps>(
  ({ className, ...props }, ref) => {
    const { status } = useTimelineItemContext();
    return (
      <hr
        role="separator"
        aria-orientation="vertical"
        className={cn(
          "col-start-2 col-end-3 row-start-2 row-end-2 mx-auto flex h-full min-h-12 w-0 justify-center rounded-full border-[1.5px]",
          status === "done"
            ? "border-primary"
            : "border-dashed border-muted-foreground/50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
TimelineLine.displayName = "TimelineLine";

export {
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineContent,
  TimelineHeading,
  TimelineLine,
};
