import React, { useState, useEffect, useCallback } from 'react';
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

export interface ComboboxOption {
  value: string;
  label: string;
}

interface AsyncComboboxProps {
  onSearch: (query: string) => Promise<ComboboxOption[]>;
  onChange: (value: string | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  initialDisplayValue?: string | null;
  className?: string;
}

export function AsyncCombobox({
  onSearch,
  onChange,
  placeholder = 'Buscar...',
  emptyMessage = 'No se encontraron resultados.',
  initialDisplayValue = null,
  className,
}: AsyncComboboxProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [displayLabel, setDisplayLabel] = useState<string | null>(initialDisplayValue);

  // Sincronizar el displayLabel cuando cambia initialDisplayValue
  useEffect(() => {
    setDisplayLabel(initialDisplayValue);
  }, [initialDisplayValue]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setLoading(true);
      try {
        const results = await onSearch(query);
        setOptions(results);
      } catch (error) {
        console.error('Error searching:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [onSearch]
  );

  // Cargar opciones iniciales cuando se abre el popover
  useEffect(() => {
    if (open && options.length === 0) {
      handleSearch('');
    }
  }, [open, handleSearch, options.length]);

  const handleSelect = (currentValue: string) => {
    // Buscar la opción seleccionada
    const selectedOption = options.find((opt) => opt.value === currentValue);
    
    if (!selectedOption) return;

    // Si se selecciona la misma opción, deseleccionar
    if (selectedValue === currentValue) {
      setSelectedValue(null);
      setDisplayLabel(null);
      onChange(null);
    } else {
      setSelectedValue(currentValue);
      setDisplayLabel(selectedOption.label);
      onChange(currentValue);
    }
    
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800 hover:text-white',
            className
          )}
        >
          <span className={cn(!displayLabel && 'text-gray-400')}>
            {displayLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-gray-900 border-gray-700" align="start">
        <Command className="bg-gray-900">
          <CommandInput
            placeholder={placeholder}
            onValueChange={handleSearch}
            className="text-white"
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-400">Buscando...</span>
              </div>
            ) : (
              <>
                <CommandEmpty className="text-gray-400 py-6 text-center text-sm">
                  {emptyMessage}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedValue === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}