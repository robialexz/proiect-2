import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useDebounce } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * Coloană pentru tabelul virtual
 */
export interface VirtualTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  width?: number | string;
  className?: string;
  sortable?: boolean;
  sortKey?: string;
}

/**
 * Opțiuni pentru paginare
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

/**
 * Props pentru componenta VirtualTable
 */
interface VirtualTableProps<T> {
  items: T[];
  columns: VirtualTableColumn<T>[];
  height: number | string;
  rowHeight: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  scrollToIndex?: number;
  keyExtractor?: (item: T, index: number) => string;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
  onRowClick?: (item: T, index: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  stickyHeader?: boolean;
  rowClassName?: string | ((item: T, index: number) => string);
  headerClassName?: string;
  footerComponent?: React.ReactNode;
  pagination?: PaginationOptions;
}

/**
 * Componenta pentru tabel virtualizat
 * Renderează doar rândurile vizibile în viewport
 */
export function VirtualTable<T>({
  items,
  columns,
  height,
  rowHeight,
  overscan = 5,
  className = "",
  onEndReached,
  endReachedThreshold = 0.8,
  scrollToIndex,
  keyExtractor,
  emptyComponent,
  loadingComponent,
  isLoading = false,
  onRowClick,
  onSort,
  sortColumn,
  sortDirection = "asc",
  stickyHeader = true,
  rowClassName = "",
  headerClassName = "",
  footerComponent,
}: VirtualTableProps<T>): React.ReactElement {
  // Referință către containerul tabelului
  const containerRef = useRef<HTMLDivElement>(null);

  // Starea pentru poziția de scroll
  const [scrollTop, setScrollTop] = useState(0);

  // Calculăm rândurile vizibile
  const totalHeight = items.length * rowHeight;
  const visibleRows = Math.ceil(
    typeof height === "number" ? height / rowHeight : 0
  );
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor(
      (scrollTop + (typeof height === "number" ? height : 0)) / rowHeight
    ) + overscan
  );

  // Gestionăm evenimentul de scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);

      // Verificăm dacă am ajuns la sfârșitul tabelului
      if (onEndReached) {
        const scrollPosition =
          containerRef.current.scrollTop + containerRef.current.clientHeight;
        const scrollThreshold =
          containerRef.current.scrollHeight * endReachedThreshold;

        if (scrollPosition >= scrollThreshold) {
          onEndReached();
        }
      }
    }
  }, [onEndReached, endReachedThreshold]);

  // Folosim debounce pentru evenimentul de scroll
  const debouncedHandleScroll = useDebounce(handleScroll, 10);

  // Facem scroll la un index specific
  useEffect(() => {
    if (scrollToIndex !== undefined && containerRef.current) {
      containerRef.current.scrollTop = scrollToIndex * rowHeight;
    }
  }, [scrollToIndex, rowHeight]);

  // Gestionăm sortarea
  const handleSort = useCallback(
    (key: string) => {
      if (!onSort) return;

      const newDirection =
        sortColumn === key && sortDirection === "asc" ? "desc" : "asc";
      onSort(key, newDirection);
    },
    [onSort, sortColumn, sortDirection]
  );

  // Calculăm clasa pentru rând
  const getRowClassName = useCallback(
    (item: T, index: number) => {
      if (typeof rowClassName === "function") {
        return rowClassName(item, index);
      }
      return rowClassName;
    },
    [rowClassName]
  );

  // Calculăm numărul total de pagini pentru paginare
  const totalPages = useMemo(() => {
    return pagination
      ? Math.ceil(pagination.totalItems / pagination.pageSize)
      : 1;
  }, [pagination]);

  // Generăm paginile pentru navigare
  const pageItems = useMemo(() => {
    if (!pagination) return [];

    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      pagination.page - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === pagination.page}
            onClick={() => pagination.onPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  }, [pagination, totalPages]);

  // Renderăm tabelul
  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={containerRef}
        className="overflow-auto relative rounded-md border"
        style={{ height }}
        onScroll={debouncedHandleScroll}
      >
        <Table>
          <TableHeader
            className={cn(
              stickyHeader && "sticky top-0 z-10 bg-background",
              headerClassName
            )}
          >
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(
                    column.className,
                    column.sortable && "cursor-pointer select-none"
                  )}
                  onClick={
                    column.sortable
                      ? () => handleSort(column.sortKey || column.key)
                      : undefined
                  }
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable &&
                      sortColumn === (column.sortKey || column.key) && (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {isLoading && loadingComponent ? (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loadingComponent}
                </TableCell>
              </TableRow>
            </TableBody>
          ) : items.length === 0 && emptyComponent ? (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyComponent}
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody style={{ height: totalHeight, position: "relative" }}>
              <div style={{ height: startIndex * rowHeight }} />

              {items.slice(startIndex, endIndex + 1).map((item, index) => {
                const actualIndex = startIndex + index;
                const key = keyExtractor
                  ? keyExtractor(item, actualIndex)
                  : actualIndex;

                return (
                  <TableRow
                    key={key}
                    style={{
                      height: rowHeight,
                      transform: `translateY(${actualIndex * rowHeight}px)`,
                      position: "absolute",
                      width: "100%",
                    }}
                    className={cn(
                      getRowClassName(item, actualIndex),
                      onRowClick && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={
                      onRowClick
                        ? () => onRowClick(item, actualIndex)
                        : undefined
                    }
                    data-index={actualIndex}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={`${key}-${column.key}`}
                        style={{ width: column.width }}
                        className={column.className}
                      >
                        {column.cell(item, actualIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}

              <div
                style={{ height: (items.length - endIndex - 1) * rowHeight }}
              />
            </TableBody>
          )}
        </Table>
      </div>

      {/* Paginare */}
      {pagination && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  pagination.onPageChange(Math.max(1, pagination.page - 1))
                }
                isDisabled={pagination.page === 1}
              />
            </PaginationItem>

            {pageItems}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  pagination.onPageChange(
                    Math.min(totalPages, pagination.page + 1)
                  )
                }
                isDisabled={pagination.page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {footerComponent && (
        <div className="relative mt-4">{footerComponent}</div>
      )}
    </div>
  );
}

export default VirtualTable;
