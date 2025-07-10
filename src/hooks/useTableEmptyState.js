import { useMemo } from 'react';

/**
 * Custom hook to determine the appropriate empty state for tables
 * @param {Array} data - The table data array
 * @param {boolean} hasFilters - Whether any filters are currently active
 * @param {boolean} hasSearch - Whether search is currently active
 * @param {string} searchTerm - The current search term
 * @param {Object} customMessages - Custom messages for different states
 * @returns {Object} Empty state configuration
 */
const useTableEmptyState = (
  data = [], 
  hasFilters = false, 
  hasSearch = false, 
  searchTerm = '',
  customMessages = {}
) => {
  const emptyState = useMemo(() => {
    const isEmpty = !data || data.length === 0;
    
    if (!isEmpty) {
      return { isEmpty: false };
    }

    // Determine the type of empty state
    let type = 'default';
    let message = 'No data available';
    let description = 'There are no records to display at the moment.';

    if (hasSearch && searchTerm) {
      type = 'search';
      message = customMessages.searchMessage || `No results found for "${searchTerm}"`;
      description = customMessages.searchDescription || 'Try adjusting your search terms or clearing the search to see all data.';
    } else if (hasFilters) {
      type = 'filter';
      message = customMessages.filterMessage || 'No data matches your filters';
      description = customMessages.filterDescription || 'Try adjusting your filters or clearing them to see more data.';
    } else {
      message = customMessages.defaultMessage || message;
      description = customMessages.defaultDescription || description;
    }

    return {
      isEmpty: true,
      type,
      message,
      description,
    };
  }, [data, hasFilters, hasSearch, searchTerm, customMessages]);

  return emptyState;
};

export default useTableEmptyState;
