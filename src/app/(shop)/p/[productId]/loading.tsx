import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-6">
      <div className="grid w-full grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        <div className="flex flex-col gap-y-4 overflow-hidden">
          <Skeleton className="aspect-square w-full overflow-hidden rounded-xl" />
          <div className="flex w-full items-center gap-3 overflow-hidden p-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn(
                  "size-28 shrink-0 overflow-hidden rounded-xl ring-[3px] ring-offset-2 ring-offset-background transition md:size-32",
                  index === 0 ? "ring-muted-foreground/50" : "ring-transparent",
                )}
              />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="mb-2 h-9 w-2/3" />
          <Skeleton className="h-4 w-full max-w-32 rounded" />
          <Skeleton className="mt-2 h-9 w-1/3" />
          <Skeleton className="mt-3 h-7 w-1/3" />
          <Skeleton className="mt-3 h-4 w-full max-w-32 rounded" />
          <Skeleton className="mt-3 h-4 w-full max-w-28 rounded" />
          <Skeleton className="mt-3 h-10 w-full max-w-32 rounded-none" />
          <Skeleton className="mt-4 h-12 w-full rounded-full md:h-14" />
          <Skeleton className="mt-4 h-12 w-full rounded-full md:h-14" />
        </div>
      </div>
    </div>
  );
}
