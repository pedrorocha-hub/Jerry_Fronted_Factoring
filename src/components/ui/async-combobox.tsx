"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Calendar, Hash } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Loader2 } from "lucide-react"

export interface ComboboxOption {
  value: string;
  label: string;
}

interface AsyncComboboxProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onSearch: (query: string) => Promise<ComboboxOption[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  initialDisplayValue?: string | null;
  className?: string;
  popoverWidth?: string;
}

export function AsyncCombobox({
  value,
  onChange,
  onSearch,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  initialDisplayValue,
  className,
  popoverWidth,
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ComboboxOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedLabel, setSelectedLabel] = React.useState<string | null>(initialDisplayValue || null)

  React.useEffect(() => {
    if (initialDisplayValue) {
      setSelectedLabel(initialDisplayValue);
    }
  }, [initialDisplayValue]);

  React.useEffect(() => {
    if (open) {
      console.log(`AsyncCombobox: Buscando con query "${searchQuery}"`);
      setLoading(true)
      onSearch(searchQuery).then((newOptions) => {
        console.log(`AsyncCombobox: Recibidas ${newOptions.length} opciones:`, newOptions);
        setOptions(newOptions)
        setLoading(false)
      }).catch((error) => {
        console.error('AsyncCombobox: Error en búsqueda:', error);
        setLoading(false);
      })
    }
  }, [open, searchQuery, onSearch])

  const handleSelect = (currentValue: string) => {
    const selectedOption = options.find(option => option.value === currentValue);
    onChange(currentValue === value ? null : currentValue)
    setSelectedLabel(selectedOption ? selectedOption.label : null);
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between bg-gray-900/50 border-gray-700", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {value
              ? selectedLabel || options.find((option) => option.value === value)?.label || value
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", popoverWidth || "w-[--radix-popover-trigger-width]")}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    // Parsear el label para mostrar mejor formato
                    const parts = option.label.split(' • ');
                    const hasMultipleParts = parts.length > 1;
                    
                    // Obtener el color del badge según el estado
                    const getStatusColor = (status: string) => {
                      switch (status.toLowerCase()) {
                        case 'completado':
                          return 'bg-green-500/20 text-green-400 border-green-500/30';
                        case 'en revisión':
                          return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
                        case 'borrador':
                        default:
                          return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                      }
                    };
                    
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={handleSelect}
                        className="cursor-pointer py-3 px-2"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 flex-shrink-0",
                            value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {hasMultipleParts ? (
                          <div className="flex-1 flex flex-col gap-1.5">
                            <span className="font-medium text-sm text-white">{parts[0]}</span>
                            <div className="flex flex-wrap items-center gap-2">
                              {parts.slice(1).map((part, idx) => {
                                // Detectar si es RUC (contiene solo números)
                                const isRuc = /^\d+$/.test(part.trim());
                                // Detectar si es fecha (formato DD/MM/YYYY)
                                const isDate = /^\d{2}\/\d{2}\/\d{4}$/.test(part.trim());
                                // Detectar si es estado
                                const isStatus = idx === 1;
                                
                                if (isRuc) {
                                  return (
                                    <span key={idx} className="flex items-center gap-1 text-xs font-mono text-blue-400">
                                      <Hash className="h-3 w-3" />
                                      {part}
                                    </span>
                                  );
                                }
                                
                                if (isDate) {
                                  return (
                                    <span key={idx} className="flex items-center gap-1 text-xs text-gray-400">
                                      <Calendar className="h-3 w-3" />
                                      {part}
                                    </span>
                                  );
                                }
                                
                                if (isStatus) {
                                  return (
                                    <span 
                                      key={idx} 
                                      className={cn(
                                        "px-2 py-0.5 text-xs rounded-full border",
                                        getStatusColor(part)
                                      )}
                                    >
                                      {part}
                                    </span>
                                  );
                                }
                                
                                return (
                                  <span key={idx} className="text-xs text-gray-500">
                                    {part}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="flex-1 text-sm">{option.label}</span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}