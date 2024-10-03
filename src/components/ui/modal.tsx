"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const desktop = "(min-width: 768px)";

type ModalProps = React.ComponentProps<typeof Drawer>;

const Modal = ({ children, ...props }: ModalProps) => {
  const isDesktop = useMediaQuery(desktop);
  const Modal = isDesktop ? Dialog : Drawer;

  return <Modal {...props}>{children}</Modal>;
};

type ModalTriggerProps = React.ComponentProps<typeof DrawerTrigger>;

const ModalTrigger = ({ children, ...props }: ModalTriggerProps) => {
  const isDesktop = useMediaQuery(desktop);
  const ModalTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

  return <ModalTrigger {...props}>{children}</ModalTrigger>;
};

type ModalCloseProps = React.ComponentProps<typeof DrawerClose>;

const ModalClose = ({ children, ...props }: ModalCloseProps) => {
  const isDesktop = useMediaQuery(desktop);
  const ModalClose = isDesktop ? DialogClose : DrawerClose;

  return (
    <ModalClose asChild {...props}>
      <Button variant={"outline"}>{children}</Button>
    </ModalClose>
  );
};

type ModalContentProps = React.ComponentProps<typeof DrawerContent>;

const ModalContent = ({ children, ...props }: ModalContentProps) => {
  const isDesktop = useMediaQuery(desktop);
  const ModalContent = isDesktop ? DialogContent : DrawerContent;

  return <ModalContent {...props}>{children}</ModalContent>;
};

type ModalDescriptionProps = React.ComponentProps<typeof DrawerDescription>;

const ModalDescription = ({ children, ...props }: ModalDescriptionProps) => {
  const isDesktop = useMediaQuery(desktop);
  const ModalDescription = isDesktop ? DialogDescription : DrawerDescription;

  return <ModalDescription {...props}>{children}</ModalDescription>;
};

type ModalHeaderProps = React.ComponentProps<typeof DrawerHeader>;

const ModalHeader = ({ children, ...props }: ModalHeaderProps) => {
  const isDesktop = useMediaQuery(desktop);
  const ModalHeader = isDesktop ? DialogHeader : DrawerHeader;

  return <ModalHeader {...props}>{children}</ModalHeader>;
};

type ModalTitleProps = React.ComponentProps<typeof DrawerTitle>;

const ModalTitle = ({ children, ...props }: ModalTitleProps) => {
  const isDesktop = useMediaQuery(desktop);
  const ModalTitle = isDesktop ? DialogTitle : DrawerTitle;

  return <ModalTitle {...props}>{children}</ModalTitle>;
};

type ModalBodyProps = React.HTMLAttributes<HTMLDivElement>;

const ModalBody = ({ className, children, ...props }: ModalBodyProps) => {
  return (
    <div className={cn("space-y-4 px-4 md:px-0", className)} {...props}>
      {children}
    </div>
  );
};

type ModalFooterProps = React.ComponentProps<typeof DrawerFooter>;

const ModalFooter = ({ children, ...props }: ModalFooterProps) => {
  const isDesktop = useMediaQuery(desktop);
  const ModalFooter = isDesktop ? DialogFooter : DrawerFooter;

  return <ModalFooter {...props}>{children}</ModalFooter>;
};

export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
};
