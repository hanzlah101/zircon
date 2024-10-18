"use client";

import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTrackOrderModal } from "@/stores/use-track-order-modal";

export function Announcement() {
  const { onOpen } = useTrackOrderModal();

  return (
    <header className="z-40 w-full bg-muted">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-4 py-3">
        <p className="text-xs font-medium md:text-sm">
          Free shipping on orders over {formatPrice(2000)}
        </p>
        <Button
          onClick={onOpen}
          className="text-sm underline"
          variant={"link"}
          size={"fit"}
        >
          Track Order
        </Button>
      </div>
    </header>
  );
}
