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

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  onScrollEnd?: () => void;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No se encontraron resultados.',
  disabled = false,
  className,
  isLoading = false,
  onScrollEnd,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);
  const isSelectingRef = React.useRef(false);

  const selectedOption = options.find((option) => option.value === value);

  React.useEffect(() => {
    if (!onScrollEnd || !open) return;
    const listElement = listRef.current;
    if (!listElement) return;

    const scrollHandler = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement;
      if (scrollHeight - scrollTop <= clientHeight + 10) {
        onScrollEnd();
      }
    };

    listElement.addEventListener('scroll', scrollHandler);
    return () => listElement.removeEventListener('scroll', scrollHandler);
  }, [onScrollEnd, open]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {selectedOption ? (
            <span className="truncate">{selectedOption.label}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0 !z-[9999]" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          const dialog = target.closest('[role="dialog"]');
          const isClickInsidePopover = target.closest('[data-radix-popover-content]');
          if (dialog && !isClickInsidePopover) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          const dialog = target.closest('[role="dialog"]');
          const isClickInsidePopover = target.closest('[data-radix-popover-content]');
          if (dialog && !isClickInsidePopover) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        sideOffset={4}
        data-radix-popover-content
        style={{ zIndex: 9999, pointerEvents: 'auto' }}
        forceMount
      >
        <Command shouldFilter={true}>
          <CommandInput placeholder={searchPlaceholder} disabled={false} />
          <CommandList ref={listRef} className="max-h-[300px] overflow-y-auto" style={{ pointerEvents: 'auto' }}>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                emptyMessage
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const handleSelect = (selectedValue: string) => {
                  if (isSelectingRef.current) return;
                  
                  const selectedOption = options.find(
                    (opt) => opt.label.toLowerCase() === selectedValue.toLowerCase(),
                  );
                  if (selectedOption) {
                    isSelectingRef.current = true;
                    const newValue = selectedOption.value === value ? '' : selectedOption.value;
                    onValueChange(newValue);
                    setOpen(false);
                    setTimeout(() => {
                      isSelectingRef.current = false;
                    }, 100);
                  }
                };

                const handleClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (isSelectingRef.current) return;
                  
                  isSelectingRef.current = true;
                  const newValue = option.value === value ? '' : option.value;
                  onValueChange(newValue);
                  setOpen(false);
                  
                  setTimeout(() => {
                    isSelectingRef.current = false;
                  }, 100);
                };

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    keywords={[option.label, option.value]}
                    onSelect={handleSelect}
                    onClick={handleClick}
                    disabled={false}
                    className="cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
              {isLoading && (
                <CommandItem disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando más...
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

