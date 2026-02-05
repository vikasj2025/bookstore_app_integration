import React from 'react';
import { clsx } from 'clsx';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  empty?: React.ReactNode;
  sortConfig?: SortConfig;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  rowKey?: keyof T | ((record: T) => string | number);
  onRowClick?: (record: T, index: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
  bordered?: boolean;
}

const sizeConfig = {
  sm: {
    cell: 'px-3 py-2 text-sm',
    header: 'px-3 py-2 text-xs font-medium uppercase tracking-wider',
  },
  md: {
    cell: 'px-4 py-3 text-sm',
    header: 'px-4 py-3 text-xs font-medium uppercase tracking-wider',
  },
  lg: {
    cell: 'px-6 py-4 text-base',
    header: 'px-6 py-3 text-sm font-medium uppercase tracking-wider',
  },
};

function getRowKey<T>(record: T, index: number, rowKey?: keyof T | ((record: T) => string | number)): string | number {
  if (typeof rowKey === 'function') {
    return rowKey(record);
  }
  if (rowKey && record[rowKey] != null) {
    return String(record[rowKey]);
  }
  return index;
}

function getCellValue<T>(record: T, column: Column<T>): any {
  if (column.dataIndex) {
    return record[column.dataIndex];
  }
  return record;
}

export function Table<T = any>({
  columns,
  data,
  loading = false,
  empty,
  sortConfig,
  onSort,
  rowKey,
  onRowClick,
  className,
  size = 'md',
  striped = false,
  bordered = false,
}: TableProps<T>) {
  const sizeStyles = sizeConfig[size];

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    const direction = 
      sortConfig?.key === columnKey && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc';
    
    onSort(columnKey, direction);
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  const LoadingSkeleton = () => (
    <tr>
      <td colSpan={columns.length} className={sizeStyles.cell}>
        <div className="animate-pulse space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      </td>
    </tr>
  );

  const EmptyState = () => (
    <tr>
      <td colSpan={columns.length} className={clsx(sizeStyles.cell, 'text-center text-gray-500')}>
        {empty || 'No data available'}
      </td>
    </tr>
  );

  return (
    <div className={clsx('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => {
                const alignClass = {
                  left: 'text-left',
                  center: 'text-center',
                  right: 'text-right',
                }[column.align || 'left'];

                return (
                  <th
                    key={column.key}
                    className={clsx(
                      sizeStyles.header,
                      alignClass,
                      'text-gray-500 bg-gray-50',
                      bordered && 'border-r border-gray-200 last:border-r-0',
                      column.sortable && 'cursor-pointer hover:bg-gray-100 select-none',
                      column.className
                    )}
                    style={{ width: column.width }}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                    role={column.sortable ? 'button' : undefined}
                    tabIndex={column.sortable ? 0 : undefined}
                    onKeyDown={column.sortable ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSort(column.key);
                      }
                    } : undefined}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <span className="flex-shrink-0">
                          {getSortIcon(column.key) || (
                            <div className="h-4 w-4 opacity-30">
                              <ChevronUpIcon className="h-4 w-4" />
                            </div>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={clsx(
            'bg-white divide-y divide-gray-200',
            striped && 'divide-y-0'
          )}>
            {loading ? (
              <LoadingSkeleton />
            ) : data.length === 0 ? (
              <EmptyState />
            ) : (
              data.map((record, index) => {
                const key = getRowKey(record, index, rowKey);
                
                return (
                  <tr
                    key={key}
                    className={clsx(
                      'transition-colors duration-150',
                      onRowClick && 'cursor-pointer hover:bg-gray-50',
                      striped && index % 2 === 1 && 'bg-gray-50',
                      bordered && 'border-b border-gray-200'
                    )}
                    onClick={onRowClick ? () => onRowClick(record, index) : undefined}
                  >
                    {columns.map((column) => {
                      const value = getCellValue(record, column);
                      const cellContent = column.render
                        ? column.render(value, record, index)
                        : value;

                      const alignClass = {
                        left: 'text-left',
                        center: 'text-center',
                        right: 'text-right',
                      }[column.align || 'left'];

                      return (
                        <td
                          key={column.key}
                          className={clsx(
                            sizeStyles.cell,
                            alignClass,
                            'text-gray-900',
                            bordered && 'border-r border-gray-200 last:border-r-0',
                            column.className
                          )}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type { Column, SortConfig, TableProps };
