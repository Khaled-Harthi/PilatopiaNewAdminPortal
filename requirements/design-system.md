# Pilatopia Design System

A comprehensive guide for building consistent, minimal, and intuitive interfaces across the Pilatopia Admin Console.

---

## Design Philosophy

### Core Principles

1. **Minimalism First** - Remove visual noise. Every element should earn its place.
2. **Content Over Chrome** - Let data and actions speak; avoid decorative elements.
3. **Subtle & Sophisticated** - Muted colors, soft transitions, understated interactions.
4. **Progressive Disclosure** - Show what's needed, hide complexity until relevant.

---

## Color System

### Semantic Colors

| Token | Usage |
|-------|-------|
| `bg-background` | Main page background |
| `bg-card` | Elevated containers (cards, panels) |
| `bg-muted` | Subtle tinted areas (toggle groups, disabled states) |
| `bg-accent` | Hover states, selected items, inline highlights |
| `bg-accent/50` | Softer inline highlights without borders |

### Text Colors

| Token | Usage |
|-------|-------|
| `text-foreground` | Primary text, headings |
| `text-muted-foreground` | Secondary text, labels, timestamps, subtle actions |
| `text-destructive` | Dangerous action hover states |

### Status Colors

| Color | Usage |
|-------|-------|
| `bg-foreground` | Active/checked-in state (black dot) |
| `bg-muted-foreground/40` | Pending/confirmed state (gray dot) |
| `bg-orange-400` | Waitlist/warning state |
| `text-red-500` | Full capacity, errors |

---

## Typography

### Font Weights
- **`font-semibold`** - Headings, emphasis (never use `font-bold`)
- **`font-medium`** - Sub-headings, important labels
- **Regular** - Body text, descriptions

### Font Sizes
| Class | Usage |
|-------|-------|
| `text-2xl` | Page titles |
| `text-base` | Section headings |
| `text-sm` | Body text, form labels, buttons |
| `text-xs` | Metadata, timestamps, legends, subtle actions |
| `text-[11px]` | Compact labels (e.g., progress indicators) |

### Text Patterns
```tsx
// Page title
<h1 className="text-2xl font-semibold">Page Title</h1>

// Section label
<span className="text-xs text-muted-foreground uppercase font-medium">
  Section Name
</span>

// Subtle action link
<button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
  Action
</button>

// Destructive action link
<button className="text-xs text-muted-foreground hover:text-destructive transition-colors">
  Delete
</button>
```

---

## Spacing

### Gap Scale (Flex/Grid)
| Class | Size | Usage |
|-------|------|-------|
| `gap-1` | 4px | Toggle items, tight groups |
| `gap-1.5` | 6px | Icon + text in buttons |
| `gap-2` | 8px | Button groups, form fields |
| `gap-3` | 12px | Related items, toolbar sections |
| `gap-4` | 16px | Card spacing, section gaps |
| `gap-6` | 24px | Major section separation |

### Padding
| Class | Usage |
|-------|-------|
| `p-1` | Compact containers (toggle groups) |
| `p-2` | Small interactive elements |
| `p-3` | Popover sections |
| `p-4` | Card content, compact layouts |
| `p-6` | Standard containers |
| `px-4 py-3` | Popover header/footer |
| `px-6 py-4` | Page header padding |

### Margin
- **Avoid margins** - Use `gap` with flex/grid instead
- Only use margin for specific offset needs (`mt-1`, `mb-2`)

---

## Components

### Buttons

#### Variants by Intent
| Variant | Usage | Style |
|---------|-------|-------|
| `default` | Primary actions | Solid dark background |
| `ghost` | Navigation, secondary actions | Transparent, hover bg only |
| `outline` | Alternative actions | Border + transparent (use sparingly) |
| `destructive` | Dangerous actions | Solid red |

#### Button Patterns
```tsx
// Primary action (toolbar)
<Button size="sm" className="gap-2 h-9">
  <Plus className="h-4 w-4" />
  Add
</Button>

// Icon button (navigation)
<Button variant="ghost" size="icon" className="h-9 w-9">
  <ChevronLeft className="h-4 w-4" />
</Button>

// Small icon button (popover header)
<Button variant="ghost" size="icon" className="h-6 w-6">
  <X className="h-4 w-4" />
</Button>

// Subtle text action (footer)
<button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
  <Edit className="h-3 w-3" />
  Edit
</button>
```

### Selects & Dropdowns

#### Standard Select
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[140px] h-9">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Filter Trigger (Custom)
```tsx
<button className="relative flex items-center justify-between gap-2 rounded-md bg-muted hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/50 px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 min-w-[160px]">
  <span className="flex items-center gap-1.5 truncate">
    <span className="text-muted-foreground">Label:</span>
    <span className="truncate">{value}</span>
  </span>
  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
</button>
```

### Popovers

#### Structure
```tsx
<Popover>
  <PopoverTrigger asChild>{trigger}</PopoverTrigger>
  <PopoverContent className="w-[320px] p-0" align="start" side="right">
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <span className="text-sm font-medium">Title</span>
      <Button variant="ghost" size="icon" className="h-6 w-6">
        <X className="h-4 w-4" />
      </Button>
    </div>

    {/* Content */}
    <div className="px-4 py-3">
      {/* ... */}
    </div>

    {/* Footer */}
    <div className="px-4 py-3 border-t flex items-center justify-between">
      <button className="text-xs text-muted-foreground hover:text-foreground">
        Primary Action
      </button>
      <button className="text-xs text-muted-foreground hover:text-destructive">
        Destructive Action
      </button>
    </div>
  </PopoverContent>
</Popover>
```

#### Popover Options (Dropdown Menu Style)
```tsx
<PopoverContent className="w-[200px] p-1 shadow-none" align="start">
  <div
    role="option"
    className="relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 px-2 pr-8 text-sm outline-hidden select-none transition-colors hover:bg-accent"
  >
    <span>Option Label</span>
    <span className="absolute right-3 flex size-3.5 items-center justify-center">
      {isSelected && <Check className="size-4" />}
    </span>
  </div>
</PopoverContent>
```

### Cards & Containers

#### Stat Card
```tsx
<div className="flex flex-col">
  <span className="text-xs text-muted-foreground uppercase font-medium">
    Label
  </span>
  <div className="flex items-baseline gap-1">
    <span className="text-lg font-semibold">42</span>
    <span className="text-sm text-muted-foreground">units</span>
  </div>
</div>
```

#### Info Section
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground uppercase font-medium">
      Section Title
    </span>
    {/* Optional legend or actions */}
  </div>
  <div className="space-y-1">
    {/* Content rows */}
  </div>
</div>
```

### Progress Indicators

#### Circular Progress
```tsx
<CircularProgress
  value={percentage}      // 0-100
  size="sm"               // sm | md | lg
  showLabel={true}
  label="4/6"
  color="hsl(0, 0%, 30%)" // Optional custom color
/>
```

| Size | Circle | Stroke | Label |
|------|--------|--------|-------|
| `sm` | 24px | 3px | 11px |
| `md` | 32px | 4px | 10px |
| `lg` | 48px | 5px | 12px |

### Status Dots

```tsx
// Checked-in / Active
<span className="h-2 w-2 rounded-full bg-foreground" />

// Booked / Confirmed
<span className="h-2 w-2 rounded-full bg-muted-foreground/40" />

// Waitlist / Warning
<span className="h-2 w-2 rounded-full bg-orange-400" />
```

### Legend Pattern
```tsx
<div className="flex items-center gap-3 text-xs text-muted-foreground">
  <span className="flex items-center gap-1">
    <span className="h-2 w-2 rounded-full bg-foreground" />
    Active
  </span>
  <span className="flex items-center gap-1">
    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
    Pending
  </span>
</div>
```

---

## Layout Patterns

### Page Structure
```tsx
<div className="min-h-screen bg-background flex flex-col">
  {/* Header - no bottom border */}
  <header className="bg-card">
    <div className="container mx-auto px-6 py-4">
      {/* Title + description */}
    </div>
  </header>

  {/* Stats Bar - seamless transition */}
  <div className="bg-card">
    <div className="container mx-auto px-6 py-3">
      {/* Stats */}
    </div>
  </div>

  {/* Toolbar - seamless transition */}
  <div className="container mx-auto px-6 py-3">
    {/* Filters, actions */}
  </div>

  {/* Main content */}
  <main className="flex-1 container mx-auto px-6 py-4">
    {/* Content */}
  </main>
</div>
```

### Toolbar Layout
```tsx
<div className="flex flex-wrap items-center justify-between gap-3">
  {/* Left: Navigation + Filters */}
  <div className="flex flex-wrap items-center gap-3">
    {/* Week navigator */}
    {/* Divider */}
    <div className="h-6 w-px bg-border" />
    {/* Filters */}
  </div>

  {/* Right: Options + Actions */}
  <div className="flex items-center gap-3">
    {/* Selects */}
    {/* Primary button */}
  </div>
</div>
```

### Grid/Table Cells
```tsx
<td className="border-b border-r p-2 min-w-[100px]">
  <div className="space-y-1">
    {/* Cell content */}
  </div>
</td>
```

---

## Borders & Shadows

### When to Use Borders
| Use | Don't Use |
|-----|-----------|
| Between sections in overlays | On inline content |
| Table cells | Calendar events |
| Card containers | Badges/pills |
| Popover separators | Toggle groups |

### Border Patterns
```tsx
// Section separator in popover
<div className="border-t" />

// Vertical divider in toolbar
<div className="h-6 w-px bg-border" />

// Table cell
<td className="border-b border-r" />
```

### Shadows
- **Only on overlays**: `shadow-none` on popovers with subtle borders
- Cards: `shadow-sm` (optional)
- Dialogs/Sheets: `shadow-lg`

---

## Interactions

### Hover States
```tsx
// Background highlight
className="hover:bg-accent transition-colors"

// Subtle background
className="hover:bg-muted/80 transition-colors"

// Text color change
className="text-muted-foreground hover:text-foreground transition-colors"

// Destructive hover
className="text-muted-foreground hover:text-destructive transition-colors"
```

### Focus States
```tsx
className="outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
```

### Transitions
- Always use `transition-colors` for color changes
- Use `transition-all duration-300` for complex animations (progress rings)

---

## Icons

### Sizes by Context
| Size | Class | Usage |
|------|-------|-------|
| Tiny | `h-3 w-3` | Inline with small text (footer actions) |
| Small | `h-4 w-4` | Standard buttons, navigation |
| Medium | `h-5 w-5` | Emphasis, standalone icons |

### Icon + Text Patterns
```tsx
// Button with icon
<Button className="gap-2">
  <Plus className="h-4 w-4" />
  Add
</Button>

// Subtle action with icon
<button className="flex items-center gap-1 text-xs">
  <Edit className="h-3 w-3" />
  Edit
</button>
```

---

## Responsive Considerations

### Breakpoint Patterns
```tsx
// Flex wrap for smaller screens
className="flex flex-wrap items-center gap-3"

// Min-width for form elements
className="min-w-[160px]"

// Truncate long text
className="truncate"
```

### Container
```tsx
<div className="container mx-auto px-6">
  {/* Content stays centered with consistent padding */}
</div>
```

---

## Accessibility

### Required Patterns
- Always include `aria-selected` on option-like elements
- Use `role="option"` for custom select items
- Include screen reader text: `<span className="sr-only">Description</span>`
- Ensure keyboard navigation with proper focus states

### Color Contrast
- Primary text on background: Meet WCAG AA
- Muted text: Use `text-muted-foreground` (designed for contrast)
- Status colors: Pair with text labels, not color-alone

---

## Anti-Patterns (What NOT to Do)

| Don't | Do Instead |
|-------|------------|
| Add borders to inline pills/badges | Use `bg-accent/50` tint |
| Use `font-bold` | Use `font-semibold` |
| Add shadows to inline elements | Reserve for overlays only |
| Use outline buttons everywhere | Prefer ghost buttons |
| Add borders to toggle groups | Use `bg-muted` container |
| Use margins for spacing | Use gap in flex/grid |
| Create busy toolbars | Group related items, use dividers |
| Make destructive actions prominent | Use subtle text, highlight on hover |

---

## Quick Reference

### Common Class Combinations

```tsx
// Muted label
"text-xs text-muted-foreground uppercase font-medium"

// Subtle button
"text-xs text-muted-foreground hover:text-foreground transition-colors"

// Destructive link
"text-xs text-muted-foreground hover:text-destructive transition-colors"

// Filter trigger
"bg-muted hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/50 px-3 py-2 text-sm rounded-md h-9 transition-colors"

// Option item
"relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 px-2 pr-8 text-sm select-none transition-colors hover:bg-accent"

// Popover section
"px-4 py-3 border-t"

// Status row
"flex items-center justify-between py-1.5"
```
