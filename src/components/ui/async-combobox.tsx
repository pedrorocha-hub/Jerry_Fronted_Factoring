"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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
      setLoading(true)
      onSearch(searchQuery).then((newOptions) => {
        setOptions(newOptions)
        setLoading(false)
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
          className="w-full justify-between bg-gray-900/50 border-gray-700"
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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
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
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleSelect}
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
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}