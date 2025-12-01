'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  placeholder = 'All',
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: string) => {
    const updated = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(updated);
  };

  const clearAll = () => {
    onChange([]);
    setOpen(false);
  };

  const displayText =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? selected[0]
      : `${selected.length} selected`;

  return (
    <Select open={open} onOpenChange={setOpen}>
      <SelectTrigger className="w-[180px] h-9">
        <span className="flex items-center gap-1.5 truncate">
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium truncate">{displayText}</span>
        </span>
      </SelectTrigger>
      <SelectContent>
        {/* Clear/All option */}
        <div
          role="option"
          aria-selected={selected.length === 0}
          onClick={clearAll}
          className={cn(
            "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent focus:bg-accent",
            selected.length === 0 && "bg-accent"
          )}
        >
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            {selected.length === 0 && <Check className="h-4 w-4" />}
          </span>
          {placeholder}
        </div>

        {/* Options */}
        {options.map(option => (
          <div
            key={option}
            role="option"
            aria-selected={selected.includes(option)}
            onClick={() => toggleOption(option)}
            className={cn(
              "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent focus:bg-accent",
              selected.includes(option) && "bg-accent"
            )}
          >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              {selected.includes(option) && <Check className="h-4 w-4" />}
            </span>
            <span className="truncate">{option}</span>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
