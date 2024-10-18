import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MutationStatus } from "@tanstack/react-query";
import { IconCircleCheckFilled } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";
import { Spinner } from "./spinner";

export type StatusProps = {
  status: MutationStatus;
  successMessage: string;
};

type StatusButtonProps = ButtonProps & StatusProps;

const StatusButton = React.forwardRef<HTMLButtonElement, StatusButtonProps>(
  ({ children, className, successMessage, ...props }, ref) => {
    const [status, setStatus] = React.useState(props.status);

    React.useEffect(() => {
      setStatus(props.status);
    }, [props.status]);

    React.useEffect(() => {
      if (status === "success") {
        setTimeout(() => setStatus("idle"), 2000);
      }
    }, [status]);

    return (
      <Button
        ref={ref}
        disabled={status === "pending"}
        className={cn("w-full", className)}
        {...props}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.075 }}
            className={cn("flex items-center justify-center gap-1")}
          >
            {status === "pending" ? (
              <Spinner size={props.size === "lg" ? "lg" : undefined} />
            ) : status === "success" ? (
              <>
                <motion.span
                  className="h-fit w-fit"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.075, type: "spring" }}
                >
                  <IconCircleCheckFilled className="size-[18px]" />
                </motion.span>
                {successMessage}
              </>
            ) : (
              children
            )}
          </motion.span>
        </AnimatePresence>
      </Button>
    );
  },
);
StatusButton.displayName = "StatusButton";

export { StatusButton };
