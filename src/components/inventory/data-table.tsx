"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

import { Material } from "./columns"; // Import Material type

interface DataTableProps<TData extends Material, TValue> {
  // Ensure TData extends Material
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setMaterialToRequestSuplimentar: React.Dispatch<
    React.SetStateAction<TData | null>
  >; // Add the prop
}

export function DataTable<TData extends Material, TValue>({
  // Ensure TData extends Material
  columns,
  data,
  setMaterialToRequestSuplimentar, // Destructure the new prop
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      {/* Advanced Search and Filtering */}
      <div className="flex flex-col md:flex-row items-start md:items-center py-4 gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="w-full sm:max-w-sm bg-slate-700 border-slate-600"
          />

          {/* Additional filters based on available columns */}
          {table.getColumn("category") && (
            <Input
              placeholder="Filter by category..."
              value={
                (table.getColumn("category")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("category")?.setFilterValue(event.target.value)
              }
              className="w-full sm:max-w-sm bg-slate-700 border-slate-600"
            />
          )}

          {table.getColumn("supplier") && (
            <Input
              placeholder="Filter by supplier..."
              value={
                (table.getColumn("supplier")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("supplier")?.setFilterValue(event.target.value)
              }
              className="w-full sm:max-w-sm bg-slate-700 border-slate-600"
            />
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-xs"
            onClick={() => {
              table.getAllColumns().forEach((column) => {
                if (column.getCanFilter()) {
                  column.setFilterValue("");
                }
              });
            }}
          >
            Clear Filters
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-slate-700">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-slate-800 border-slate-700 text-white"
            >
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize focus:bg-slate-700"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Advanced Search Panel */}
      <div className="mb-4 p-4 bg-slate-800 border border-slate-700 rounded-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <h3 className="text-sm font-medium mb-2 sm:mb-0">Advanced Search</h3>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-slate-700"
            onClick={() => {
              // Toggle advanced search panel visibility
              // This would be implemented with state in a real implementation
            }}
          >
            Save Search
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Date range filter */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Date Added</label>
            <div className="flex gap-2">
              <Input
                type="date"
                className="bg-slate-700 border-slate-600 text-xs py-1 h-8"
                placeholder="From"
              />
              <Input
                type="date"
                className="bg-slate-700 border-slate-600 text-xs py-1 h-8"
                placeholder="To"
              />
            </div>
          </div>

          {/* Numeric range filter (for quantity, price, etc.) */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Quantity Range</label>
            <div className="flex gap-2">
              <Input
                type="number"
                className="bg-slate-700 border-slate-600 text-xs py-1 h-8"
                placeholder="Min"
              />
              <Input
                type="number"
                className="bg-slate-700 border-slate-600 text-xs py-1 h-8"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Status</label>
            <select className="w-full bg-slate-700 border border-slate-600 rounded-md text-xs py-1 h-8 px-2">
              <option value="">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="ordered">Ordered</option>
            </select>
          </div>

          {/* Project filter */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Project</label>
            <select className="w-full bg-slate-700 border border-slate-600 rounded-md text-xs py-1 h-8 px-2">
              <option value="">All Projects</option>
              <option value="1">Project Alpha</option>
              <option value="2">Project Beta</option>
              <option value="3">Project Gamma</option>
            </select>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="rounded-md border border-slate-700">
        <Table>
          <TableHeader className="bg-slate-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-600">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-white">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  // Add conditional background for highlighting
                  className={`border-slate-700 hover:bg-slate-750 data-[state=selected]:bg-slate-700 cursor-pointer ${(row.original.suplimentar ?? 0) > 0 ? "bg-yellow-900/30 hover:bg-yellow-800/40" : ""}`}
                  onClick={(event) => {
                    // Pass event to handler
                    // Prevent triggering if clicking on the actions cell itself
                    // This assumes the actions column has id: "actions"
                    const clickedElement = event?.target as HTMLElement;
                    if (
                      !clickedElement ||
                      !clickedElement.closest('[data-col-id="actions"]')
                    ) {
                      setMaterialToRequestSuplimentar(row.original as TData);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} data-col-id={cell.column.id}>
                      {" "}
                      {/* Add data attribute for checking */}
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-slate-400"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
