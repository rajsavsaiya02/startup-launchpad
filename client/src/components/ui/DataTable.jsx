import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

export function DataTable({
  columns,
  data,
  loading = false,
  searchable = true,
  pagination = true,
  itemsPerPageOptions = [5, 10, 20, 50],
  defaultItemsPerPage = 10,
  emptyState = null,
  title = '',
  description = '',
  filters = [] // Array of { key, label, options: [{ label, value }] }
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filter Data
  const filteredData = useMemo(() => {
    let result = data;

    // 1. Column Filters
    if (Object.keys(activeFilters).length > 0) {
      result = result.filter(item => {
        return Object.entries(activeFilters).every(([key, value]) => {
          if (!value || value === 'all') return true;
          return String(item[key]) === String(value);
        });
      });
    }

    // 2. Global Search
    if (searchable && searchTerm) {
      result = result.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return result;
  }, [data, searchTerm, activeFilters, searchable]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedData;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-3 w-3 text-text-tertiary opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-primary" />
      : <ArrowDown className="h-3 w-3 text-primary" />;
  };

  return (
    <div className="w-full bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
      {/* Header & Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex-1">
          {title && <h3 className="text-lg font-semibold text-text-primary dark:text-white">{title}</h3>}
          {description && <p className="text-sm text-text-secondary dark:text-gray-400">{description}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Filters */}
            {filters.map((filter) => (
                <div key={filter.key} className="w-full sm:w-40">
                    <select
                        className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                        value={activeFilters[filter.key] || 'all'}
                        onChange={(e) => {
                            setActiveFilters(prev => ({ ...prev, [filter.key]: e.target.value }));
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">All {filter.label}</option>
                        {filter.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            ))}

            {searchable && (
            <div className="w-full sm:w-64">
                <Input
                icon={Search}
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                }}
                className="h-10 text-sm"
                />
            </div>
            )}
        </div>
      </div>

      {/* Table Container */}
      <div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-6 py-4 font-semibold text-text-primary dark:text-white ${col.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' : ''} ${col.className || ''}`}
                    onClick={() => col.sortable && handleSort(col.accessor)}
                  >
                    <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                      {col.header}
                      {col.sortable && getSortIcon(col.accessor)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {loading ? (
                // Skeleton Loading
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {columns.map((_, colIdx) => (
                      <td key={colIdx} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full opacity-50"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                // Data Rows
                paginatedData.map((item, rowIdx) => (
                  <tr key={rowIdx} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-6 py-4 ${col.className || ''} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                        {col.render ? col.render(item) : item[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-text-secondary">
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="font-medium">No results found</p>
                        <p className="text-xs text-text-tertiary">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && !loading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-900/20">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span>Rows per page:</span>
              <select
                className="h-8 rounded bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark text-xs px-2 focus:ring-1 focus:ring-primary outline-none"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {itemsPerPageOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span className="ml-2">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-medium text-text-primary dark:text-white">Page {currentPage}</span>
                <span className="text-sm text-text-tertiary">of {totalPages || 1}</span>
              </div>

              <Button
                size="icon-sm"
                variant="ghost"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages)}
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
