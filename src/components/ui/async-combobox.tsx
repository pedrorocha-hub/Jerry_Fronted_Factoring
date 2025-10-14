"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [options, setOptions] = React.useState<ComboboxOption[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedValueLabel, setSelectedValueLabel] = React.useState<string | null>(initialDisplayValue || null);

  React.useEffect(() => {
    if (initialDisplayValue) {
      setSelectedValueLabel(initialDisplayValue);
    } else if (!value) {
      setSelectedValueLabel(null);
    }
  }, [initialDisplayValue, value]);

  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setOptions([]);
    }
  }, [open]);

  React.useEffect(() => {
    if (searchQuery.length > 2) {
      const delayDebounceFn = setTimeout(() => {
        setIsLoading(true);
        onSearch(searchQuery).then((newOptions) => {
          setOptions(newOptions);
          setIsLoading(false);
        });
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setOptions([]);
    }
  }, [searchQuery, onSearch]);

  const handleSelect = (currentValue: string) => {
    const selectedOption = options.find(option => option.value === currentValue);
    onChange(currentValue === value ? null : currentValue);
    setSelectedValueLabel(selectedOption ? selectedOption.label : null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-gray-900/50 border-gray-700"
          disabled={disabled}
        >
          <span className="truncate">
            {value && selectedValueLabel ? selectedValueLabel : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#121212] border-gray-800">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && <div className="p-2 flex justify-center items-center"><Loader2 className="h-4 w-4 animate-spin" /></div>}
            {!isLoading && options.length === 0 && searchQuery.length > 2 && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={handleSelect}
                className="text-white hover:bg-gray-800"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}