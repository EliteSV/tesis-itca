import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  type: 'single' | 'multiple';
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type = 'single', value, onValueChange, defaultValue, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(() => {
      if (defaultValue) {
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      }
      return [];
    });

    const currentValue = value
      ? Array.isArray(value)
        ? value
        : [value]
      : internalValue;

    const handleValueChange = React.useCallback(
      (newValue: string[]) => {
        if (onValueChange) {
          if (type === 'single') {
            onValueChange(newValue[0] || '');
          } else {
            onValueChange(newValue);
          }
        } else {
          setInternalValue(newValue);
        }
      },
      [onValueChange, type],
    );

    const toggleItem = React.useCallback(
      (itemValue: string) => {
        if (type === 'single') {
          handleValueChange(
            currentValue.includes(itemValue) ? [] : [itemValue],
          );
        } else {
          handleValueChange(
            currentValue.includes(itemValue)
              ? currentValue.filter((v) => v !== itemValue)
              : [...currentValue, itemValue],
          );
        }
      },
      [currentValue, handleValueChange, type],
    );

    const contextValue = React.useMemo(
      () => ({
        value: currentValue,
        onValueChange: handleValueChange,
        type,
        toggleItem,
      }),
      [currentValue, handleValueChange, type, toggleItem],
    );

    return (
      <AccordionContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn('space-y-1', className)}
          {...props}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    );
  },
);
Accordion.displayName = 'Accordion';

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    const isOpen = context?.value.includes(value) || false;
    const toggleItem = context?.toggleItem;

    return (
      <div
        ref={ref}
        className={cn('border-b border-slate-200 dark:border-slate-800', className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const props = child.props as Record<string, unknown>;
            return React.cloneElement(child, {
              ...props,
              value,
              isOpen,
              toggleItem,
            } as typeof props & { value: string; isOpen: boolean; toggleItem: (value: string) => void });
          }
          return child;
        })}
      </div>
    );
  },
);
AccordionItem.displayName = 'AccordionItem';

interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
  isOpen?: boolean;
  toggleItem?: (value: string) => void;
}

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ className, children, value, isOpen, toggleItem, ...props }, ref) => {
  const handleClick = () => {
    if (value && toggleItem) {
      toggleItem(value);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  );
});
AccordionTrigger.displayName = 'AccordionTrigger';

interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  isOpen?: boolean;
}

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ className, children, isOpen, ...props }, ref) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden text-sm transition-all pb-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

