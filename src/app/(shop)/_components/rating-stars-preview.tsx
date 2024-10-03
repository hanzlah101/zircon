import { IconStar, IconStarHalfFilled } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

interface RatingStarsPreviewProps {
  rating: number;
  className?: string;
  starClassName?: string;
}

export function RatingStarsPreview({
  rating,
  className,
  starClassName,
}: RatingStarsPreviewProps) {
  const renderStar = (index: number) => {
    const fillPercentage = Math.min(Math.max(rating - index, 0), 1);

    if (fillPercentage > 0.5) {
      return (
        <IconStar
          key={index}
          className={cn(
            "size-5 fill-yellow-500 text-yellow-500",
            starClassName,
          )}
        />
      );
    } else if (fillPercentage > 0 && fillPercentage <= 0.5) {
      return (
        <IconStarHalfFilled
          key={index}
          className={cn("text-yellow-500", starClassName)}
        />
      );
    } else {
      return (
        <IconStar
          key={index}
          fill="currentColor"
          data-state="empty"
          className={cn(
            "size-5 text-[#dadada] dark:text-[#39393b]",
            starClassName,
          )}
        />
      );
    }
  };

  return (
    <div className={cn("flex items-center gap-x-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => renderStar(i))}
    </div>
  );
}
