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
}: AsyncSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<AsyncSelectOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load initial options
  React.useEffect(() => {
    const loadInitialOptions = async () => {
      setLoading(true);
      try {
        const results = await loadOptions('');
        setOptions(results);
      } catch (error) {
        console.error('Failed to load options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialOptions();
  }, [loadOptions]);

  // Search when debounced query changes
  React.useEffect(() => {
    const search = async () => {
      if (debouncedSearch.length < 2 && debouncedSearch.length > 0) return;

      setLoading(true);
      try {
        const results = await loadOptions(debouncedSearch);
        setOptions(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedSearch, loadOptions]);

  const selectedOption = options.find((option) => option.id === value);

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
          {selectedOption ? formatLabel(selectedOption) : placeholder}
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
