"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";

import type { DataTableFilterField } from "@/lib/types";
import type { Table } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

interface DataTableToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  filterFields?: DataTableFilterField<TData>[];
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const [query, setQuery] = useQueryState("q", {
    shallow: false,
  });

  const [inputValue, setInputValue] = React.useState(query || "");

  const debouncedSetQuery = useDebouncedCallback(setQuery, 500);

  React.useEffect(() => {
    debouncedSetQuery(inputValue || null);
  }, [inputValue, debouncedSetQuery]);

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between space-x-2 overflow-auto p-1",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={"Search..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="h-8 w-52 lg:w-72"
        />

        {filterFields.length > 0 &&
          filterFields.map(
            (column) =>
              table.getColumn(column.value ? String(column.value) : "") && (
                <DataTableFacetedFilter
                  key={String(column.value)}
                  column={table.getColumn(
                    column.value ? String(column.value) : "",
                  )}
                  title={column.label}
                  options={column.options ?? []}
                />
              ),
          )}
        {isFiltered || query ? (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() => {
              table.resetColumnFilters();
              if (query) {
                setInputValue("");
                setQuery(null);
              }
            }}
          >
            Reset
            <IconX className="ml-2 size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
