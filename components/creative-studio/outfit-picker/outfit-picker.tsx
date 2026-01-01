'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface OutfitPickerProps {
  value: {
    top: string;
    topColor: string;
    bottom: string;
    bottomColor: string;
  };
  onChange: (value: {
    top: string;
    topColor: string;
    bottom: string;
    bottomColor: string;
  }) => void;
}

// Top options
const TOPS = [
  { id: 'sports_bra', label: 'Sports Bra', image: '/images/outfits/sports_bra.png' },
  { id: 'tank_top', label: 'Tank Top', image: '/images/outfits/tank_top.png' },
  { id: 'long_sleeve', label: 'Long Sleeve', image: '/images/outfits/long_sleeve.png' },
  { id: 'crop_top', label: 'Crop Top', image: '/images/outfits/crop_top.png' },
];

// Bottom options
const BOTTOMS = [
  { id: 'leggings', label: 'Leggings', image: '/images/outfits/leggings.png' },
  { id: 'shorts', label: 'Shorts', image: '/images/outfits/shorts.png' },
  { id: 'capris', label: 'Capris', image: '/images/outfits/capris.png' },
  { id: 'joggers', label: 'Joggers', image: '/images/outfits/joggers.png' },
];

// Preset colors
const PRESET_COLORS = [
  { color: '#E5D4C0', name: 'Cream' },
  { color: '#2C2C2C', name: 'Charcoal' },
  { color: '#8B9D83', name: 'Sage' },
  { color: '#D4A574', name: 'Camel' },
  { color: '#9CA3AF', name: 'Gray' },
  { color: '#1E3A5F', name: 'Navy' },
  { color: '#8B4513', name: 'Rust' },
  { color: '#F5F5DC', name: 'Beige' },
];

export function OutfitPicker({ value, onChange }: OutfitPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Top Section */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-stone-600">Top</span>
        <div className="grid grid-cols-2 gap-2">
          {TOPS.map((top) => (
            <button
              key={top.id}
              onClick={() => onChange({ ...value, top: top.id })}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                value.top === top.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              )}
            >
              <div className="w-10 h-10 mb-1 relative">
                <Image
                  src={top.image}
                  alt={top.label}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-stone-600">{top.label}</span>
            </button>
          ))}
        </div>

        {/* Top Color */}
        <div className="space-y-1.5">
          <span className="text-xs text-stone-500">Color</span>
          <ColorPicker
            value={value.topColor}
            onChange={(color) => onChange({ ...value, topColor: color })}
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-stone-600">Bottom</span>
        <div className="grid grid-cols-2 gap-2">
          {BOTTOMS.map((bottom) => (
            <button
              key={bottom.id}
              onClick={() => onChange({ ...value, bottom: bottom.id })}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                value.bottom === bottom.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              )}
            >
              <div className="w-10 h-10 mb-1 relative">
                <Image
                  src={bottom.image}
                  alt={bottom.label}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-stone-600">{bottom.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom Color */}
        <div className="space-y-1.5">
          <span className="text-xs text-stone-500">Color</span>
          <ColorPicker
            value={value.bottomColor}
            onChange={(color) => onChange({ ...value, bottomColor: color })}
          />
        </div>
      </div>
    </div>
  );
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [customColorOpen, setCustomColorOpen] = useState(false);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {PRESET_COLORS.map((preset) => (
        <button
          key={preset.color}
          onClick={() => onChange(preset.color)}
          className={cn(
            'w-7 h-7 rounded-full border-2 transition-all',
            value === preset.color ? 'border-amber-500 scale-110' : 'border-stone-200 hover:scale-105'
          )}
          style={{ backgroundColor: preset.color }}
          title={preset.name}
        />
      ))}

      {/* Custom Color */}
      <Popover open={customColorOpen} onOpenChange={setCustomColorOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'w-7 h-7 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center hover:border-stone-400 transition-all',
              !PRESET_COLORS.find(p => p.color === value) && 'border-amber-500 border-solid'
            )}
            style={{
              backgroundColor: PRESET_COLORS.find(p => p.color === value) ? undefined : value,
            }}
          >
            {PRESET_COLORS.find(p => p.color === value) && (
              <Plus className="h-3 w-3 text-stone-400" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-2">
            <span className="text-xs font-medium text-stone-600">Custom Color</span>
            <input
              type="color"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              className="w-full h-8 rounded cursor-pointer"
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setCustomColorOpen(false)}
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
