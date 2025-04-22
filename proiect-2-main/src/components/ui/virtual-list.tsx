import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Props pentru componenta VirtualList
 */
interface VirtualListProps<T> {
  items: T[];
  height: number | string;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  scrollToIndex?: number;
  keyExtractor?: (item: T, index: number) => string;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
}

/**
 * Componenta pentru virtualizarea listelor
 * Renderează doar elementele vizibile în viewport
 */
export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8,
  scrollToIndex,
  keyExtractor,
  emptyComponent,
  loadingComponent,
  isLoading = false,
  headerComponent,
  footerComponent
}: VirtualListProps<T>): React.ReactElement {
  // Referință către containerul listei
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Starea pentru poziția de scroll
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculăm elementele vizibile
  const totalHeight = items.length * itemHeight;
  const visibleItems = Math.ceil(typeof height === 'number' ? height / itemHeight : 0);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + (typeof height === 'number' ? height : 0)) / itemHeight) + overscan);
  
  // Gestionăm evenimentul de scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
      
      // Verificăm dacă am ajuns la sfârșitul listei
      if (onEndReached) {
        const scrollPosition = containerRef.current.scrollTop + containerRef.current.clientHeight;
        const scrollThreshold = containerRef.current.scrollHeight * endReachedThreshold;
        
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
      containerRef.current.scrollTop = scrollToIndex * itemHeight;
    }
  }, [scrollToIndex, itemHeight]);
  
  // Renderăm lista
  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto relative', className)}
      style={{ height }}
      onScroll={debouncedHandleScroll}
    >
      {headerComponent && (
        <div className="sticky top-0 z-10 bg-background">
          {headerComponent}
        </div>
      )}
      
      {isLoading && loadingComponent ? (
        loadingComponent
      ) : items.length === 0 && emptyComponent ? (
        emptyComponent
      ) : (
        <div style={{ height: totalHeight, position: 'relative' }}>
          {items.slice(startIndex, endIndex + 1).map((item, index) => {
            const actualIndex = startIndex + index;
            const key = keyExtractor ? keyExtractor(item, actualIndex) : actualIndex;
            
            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  top: actualIndex * itemHeight,
                  height: itemHeight,
                  width: '100%'
                }}
                data-index={actualIndex}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      )}
      
      {footerComponent && (
        <div className="relative">
          {footerComponent}
        </div>
      )}
    </div>
  );
}

/**
 * Props pentru componenta VirtualGrid
 */
interface VirtualGridProps<T> {
  items: T[];
  height: number | string;
  columnCount: number;
  rowHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  scrollToIndex?: number;
  keyExtractor?: (item: T, index: number) => string;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
  gap?: number;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
}

/**
 * Componenta pentru virtualizarea grilelor
 * Renderează doar elementele vizibile în viewport
 */
export function VirtualGrid<T>({
  items,
  height,
  columnCount,
  rowHeight,
  renderItem,
  overscan = 2,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8,
  scrollToIndex,
  keyExtractor,
  emptyComponent,
  loadingComponent,
  isLoading = false,
  gap = 0,
  headerComponent,
  footerComponent
}: VirtualGridProps<T>): React.ReactElement {
  // Referință către containerul grilei
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Starea pentru poziția de scroll
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculăm elementele vizibile
  const rowCount = Math.ceil(items.length / columnCount);
  const totalHeight = rowCount * (rowHeight + gap) - (rowCount > 0 ? gap : 0);
  const visibleRows = Math.ceil(typeof height === 'number' ? height / rowHeight : 0);
  const startRowIndex = Math.max(0, Math.floor(scrollTop / (rowHeight + gap)) - overscan);
  const endRowIndex = Math.min(rowCount - 1, Math.floor((scrollTop + (typeof height === 'number' ? height : 0)) / (rowHeight + gap)) + overscan);
  
  // Gestionăm evenimentul de scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
      
      // Verificăm dacă am ajuns la sfârșitul grilei
      if (onEndReached) {
        const scrollPosition = containerRef.current.scrollTop + containerRef.current.clientHeight;
        const scrollThreshold = containerRef.current.scrollHeight * endReachedThreshold;
        
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
      const rowIndex = Math.floor(scrollToIndex / columnCount);
      containerRef.current.scrollTop = rowIndex * (rowHeight + gap);
    }
  }, [scrollToIndex, rowHeight, columnCount, gap]);
  
  // Renderăm grila
  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto relative', className)}
      style={{ height }}
      onScroll={debouncedHandleScroll}
    >
      {headerComponent && (
        <div className="sticky top-0 z-10 bg-background">
          {headerComponent}
        </div>
      )}
      
      {isLoading && loadingComponent ? (
        loadingComponent
      ) : items.length === 0 && emptyComponent ? (
        emptyComponent
      ) : (
        <div style={{ height: totalHeight, position: 'relative' }}>
          {Array.from({ length: endRowIndex - startRowIndex + 1 }).map((_, rowIndexOffset) => {
            const rowIndex = startRowIndex + rowIndexOffset;
            const startItemIndex = rowIndex * columnCount;
            
            return (
              <div
                key={`row-${rowIndex}`}
                style={{
                  position: 'absolute',
                  top: rowIndex * (rowHeight + gap),
                  height: rowHeight,
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                  gap: `0 ${gap}px`
                }}
                data-row-index={rowIndex}
              >
                {Array.from({ length: columnCount }).map((_, columnIndex) => {
                  const itemIndex = startItemIndex + columnIndex;
                  
                  if (itemIndex >= items.length) {
                    return <div key={`empty-${itemIndex}`} />;
                  }
                  
                  const item = items[itemIndex];
                  const key = keyExtractor ? keyExtractor(item, itemIndex) : itemIndex;
                  
                  return (
                    <div key={key} data-item-index={itemIndex}>
                      {renderItem(item, itemIndex)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      
      {footerComponent && (
        <div className="relative">
          {footerComponent}
        </div>
      )}
    </div>
  );
}

export default {
  VirtualList,
  VirtualGrid
};
