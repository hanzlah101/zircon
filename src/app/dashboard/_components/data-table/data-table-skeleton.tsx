import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The number of columns in the table.
   * @type number
   */
  columnCount: number;

  /**
   * The number of rows in the table.
   * @default 10
   * @type number | undefined
   */
  rowCount?: number;

  /**
   * The number of filterable columns in the table.
   * @default 0
   * @type number | undefined
   */
  filterableColumnCount?: number;

  /**
   * Flag to show the table view options.
   * @default undefined
   * @type boolean | undefined
   */
  showViewOptions?: boolean;

  /**
   * The width of each cell in the table.
   * The length of the array should be equal to the columnCount.
   * Any valid CSS width value is accepted.
   * @default ["auto"]
   * @type string[] | undefined
   */
  cellWidths?: string[];

  /**
   * Flag to prevent the table cells from shrinking.
   * @default false
   * @type boolean | undefined
   */
  shrinkZero?: boolean;

  /**
   * Flag to show large cells for tables with images.
   * @default false
   * @type boolean | undefined
   */
  hasImage?: boolean;
}

export function DataTableSkeleton(props: DataTableSkeletonProps) {
  const {
    columnCount,
    rowCount = 10,
    filterableColumnCount = 0,
    showViewOptions = true,
    cellWidths = ["auto"],
    shrinkZero = false,
    hasImage = false,
    className,
    ...skeletonProps
  } = props;

  return (
    <div
      className={cn("w-full space-y-2.5 overflow-auto", className)}
      {...skeletonProps}
    >
      <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
        <div className="flex flex-1 items-center space-x-2">
          <Skeleton className="h-8 w-52 lg:w-72" />
          {filterableColumnCount > 0
            ? Array.from({ length: filterableColumnCount }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-[4.5rem] border-dashed" />
              ))
            : null}
        </div>
        {showViewOptions ? (
          <Skeleton className="ml-auto hidden h-9 w-[4.5rem] lg:flex" />
        ) : null}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {Array.from({ length: 1 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableHead>
                  <Skeleton className="size-5 shrink-0 rounded" />
                </TableHead>

                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableHead
                    key={j}
                    style={{
                      width: cellWidths[j],
                      minWidth: shrinkZero ? cellWidths[j] : "auto",
                    }}
                  >
                    <Skeleton
                      className={cn(
                        "h-6 rounded-sm",
                        hasImage && j === 0 ? "w-24" : "w-full",
                      )}
                    />
                  </TableHead>
                ))}

                <TableHead>
                  <Skeleton className="size-8 shrink-0" />
                </TableHead>
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell>
                  <Skeleton className="size-5 shrink-0 rounded" />
                </TableCell>

                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell
                    key={j}
                    style={{
                      width: cellWidths[j],
                      minWidth: shrinkZero ? cellWidths[j] : "auto",
                    }}
                  >
                    <Skeleton
                      className={cn("h-6 w-full rounded-sm", {
                        "size-24 shrink-0 rounded-lg": hasImage && j === 0,
                      })}
                    />
                  </TableCell>
                ))}

                <TableCell>
                  <Skeleton className="size-8 shrink-0" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex w-full items-center justify-between gap-4 overflow-auto p-1 sm:gap-8">
        <Skeleton className="h-7 w-40 shrink-0" />
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-[4.5rem]" />
          </div>
          <div className="flex items-center justify-center text-sm font-medium">
            <Skeleton className="h-7 w-20" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="hidden size-7 lg:block" />
            <Skeleton className="size-7" />
            <Skeleton className="size-7" />
            <Skeleton className="hidden size-7 lg:block" />
          </div>
        </div>
      </div>
    </div>
  );
}
