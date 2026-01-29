'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';

export interface AsyncSelectOption {
  id: number;
  nama: string;
  [key: string]: any;
}

interface AsyncSelectProps {
  value?: number;
  onValueChange: (value: number) => void;
  loadOptions: (query: string) => Promise<AsyncSelectOption[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  formatLabel?: (option: AsyncSelectOption) => string;
  initialOption?: AsyncSelectOption;
  onSelectOption?: (option: AsyncSelectOption) => void;
}

export function AsyncSelect({
  value,
  onValueChange,
  loadOptions,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  emptyText = 'Tidak ada data.',
  className,
  disabled = false,
  formatLabel = (option) => option.nama,
  initialOption,
  onSelectOption,
}: AsyncSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<AsyncSelectOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const cache = React.useRef<Record<string, AsyncSelectOption[]>>({});

  // Stabilize initialOption dependency
  const initialOptionString = JSON.stringify(initialOption);

  // Set initial option if provided
  React.useEffect(() => {
    if (initialOption) {
      setOptions((prev) => {
        const exists = prev.find((o) => o.id === initialOption.id);
        if (exists) return prev;
        return [...prev, initialOption];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOptionString]);

  // Load options ONLY when open and empty, or when searching
  React.useEffect(() => {
    const fetchOptions = async () => {
      // Don't fetch if closed and we're not doing a search (searchQuery empty)
      // Exception: we need to fetch initial list once when first opened
      if (!open && searchQuery === '') return;

      // Use debouncedSearch as the key for caching consistency
      const queryKey = debouncedSearch;

      if (cache.current[queryKey]) {
        setOptions((prev) => {
          const results = cache.current[queryKey];
          // Merge with initialOption if it exists to preserve selection
          if (initialOption) {
            const resultIds = new Set(results.map((r) => r.id));
            if (!resultIds.has(initialOption.id)) {
              return [initialOption, ...results];
            }
          }
          return results;
        });
        return;
      }

      setLoading(true);
      try {
        const results = await loadOptions(queryKey);

        // Cache the results
        cache.current[queryKey] = results;

        setOptions((prev) => {
          // Merge with initialOption if it exists to preserve selection
          if (initialOption) {
            const resultIds = new Set(results.map((r) => r.id));
            if (!resultIds.has(initialOption.id)) {
              return [initialOption, ...results];
            }
          }
          return results;
        });
      } catch (error) {
        console.error('Failed to load options:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open || (debouncedSearch !== '' && debouncedSearch.length >= 2)) {
      fetchOptions();
    }
    // We omit loadOptions from dependencies because it's usually an inline function
    // in the parent, which would cause infinite loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedSearch, initialOptionString]);

  const selectedOption =
    options.find((option) => option.id === value) || initialOption;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? formatLabel(selectedOption) : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Mencari...
                </span>
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.id.toString()}
                    onSelect={() => {
                      onValueChange(option.id);
                      onSelectOption?.(option);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {formatLabel(option)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
