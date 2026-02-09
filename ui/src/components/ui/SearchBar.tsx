import React, { useState, useRef } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { Button } from './Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  defaultValue?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search...',
  className = '',
  autoFocus = false,
  defaultValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="input pl-10 pr-10 w-full"
          aria-label="Search"
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-8 flex items-center pr-2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
        
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="absolute inset-y-0 right-0 px-2"
          aria-label="Submit search"
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
