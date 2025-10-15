import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Definición de tipos para las opciones
export type ComboboxOption = {
  value: string; // UUID o valor real
  label: string; // Texto a mostrar
};

// Definición de tipos para las props
interface AsyncComboboxProps {
  placeholder: string;
  onSearch: (query: string) => Promise<ComboboxOption[]>;
  onValueChange: (value: string) => void;
  initialValue?: string; // El UUID del valor seleccionado
  initialDisplayValue?: string; // El label a mostrar inicialmente
  disabled?: boolean;
  value?: string | null; // Prop para controlar el valor desde fuera
}

export function AsyncCombobox({
  placeholder,
  onSearch,
  onValueChange,
  initialValue,
  initialDisplayValue,
  disabled = false,
  value: controlledValue,
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ComboboxOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Estado para el valor real (UUID)
  const [selectedValue, setSelectedValue] = React.useState(controlledValue || initialValue || "");
  // Estado para el label que se muestra en el botón
  const [displayLabel, setDisplayLabel] = React.useState(initialDisplayValue || "");

  // Sincronizar props externas con el estado interno
  React.useEffect(() => {
    const newValue = controlledValue || initialValue || "";
    setSelectedValue(newValue);
    if (initialDisplayValue) {
      setDisplayLabel(initialDisplayValue);
    }
  }, [controlledValue, initialValue, initialDisplayValue]);

  // Efecto para manejar la búsqueda asíncrona
  React.useEffect(() => {
    if (searchTerm.length > 2) {
      setLoading(true);
      onSearch(searchTerm)
        .then((newOptions) => {
          setOptions(newOptions);
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setOptions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (searchTerm.length === 0) {
      // Limpiar opciones si el término de búsqueda es muy corto
      setOptions([]);
    }
  }, [searchTerm, onSearch]);

  const handleSelect = (currentLabel: string) => {
    // Buscar la opción completa usando el label (que es el valor del CommandItem)
    const selectedOption = options.find(
      (option) => option.label.toLowerCase() === currentLabel.toLowerCase()
    );

    if (selectedOption) {
      // Si la opción seleccionada es la misma que ya está, deseleccionar
      if (selectedValue === selectedOption.value) {
        setSelectedValue("");
        setDisplayLabel("");
        onValueChange("");
      } else {
        // Seleccionar la nueva opción
        setSelectedValue(selectedOption.value);
        setDisplayLabel(selectedOption.label);
        onValueChange(selectedOption.value);
      }
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800",
            !displayLabel && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {displayLabel || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#121212] border-gray-700">
        <Command>
          <CommandInput
            placeholder={placeholder}
            onValueChange={setSearchTerm}
            className="bg-gray-900/50 border-gray-700 text-white"
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-[#00FF80]" />
              </div>
            ) : (
              <>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      // Usamos el label como valor para que la búsqueda de Command funcione
                      value={option.label} 
                      onSelect={() => handleSelect(option.label)} // Pasamos el label a handleSelect
                      className="text-white hover:bg-gray-800"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValue === option.value ? "opacity-100" : "opacity-0"
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