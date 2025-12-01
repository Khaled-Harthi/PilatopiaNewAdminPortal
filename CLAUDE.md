# Project Overview
An admin dashboard for managing a Pilates studio.


## Project Scope

We're building an admin console or dashboard to manage a Pilates studio.
Start by reading the project setup document from here [project-setup.md](/requirements/project-setup.md).

## Design Guidelines
- **ALWAYS** use shadcn/ui componenets.
- You read the [design inspiration document](/requirements/design-inspirations.md) to get inspiration for popular dashboard design built using shadcn/ui.

### Design System

Following shadcn/ui's aesthetic principles of minimalism, restraint, and accessibility.

#### Color Usage

**Backgrounds:**
- `bg-background` - Main page background
- `bg-card` - Card containers (for elevated content blocks)
- `bg-muted` - Subtle tinted backgrounds (toggle groups, disabled states)
- `bg-accent` - Hover states, selected states, inline highlights
- Use tinted backgrounds (`bg-accent/50`) for inline content without borders

**Foreground (Text):**
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text, labels, timestamps
- Always pair background colors with their foreground counterparts

**Borders & Shadows:**
- Use borders and shadows ONLY for overlay components (dialogs, sheets, popovers, cards)
- NO borders on inline content (calendar events, badges, pills)
- NO borders on ghost buttons
- NO shadows on inline elements

#### Button Patterns

Choose variants by intent:
- `default` - Primary actions (solid background, no border)
- `secondary` - Secondary actions (muted background, no border)
- `outline` - Alternative actions (border + transparent bg, use sparingly)
- `ghost` - Navigation, tertiary actions (no border, hover bg only) **← PREFER THIS**
- `destructive` - Dangerous actions (solid red, no border)
- `link` - Text-based actions (no bg, no border)

**Sizes:** `sm`, default, `lg`, `icon-sm`, `icon`, `icon-lg`

**Key Rule:** Prefer `ghost` variant for navigation and secondary UI elements

#### Typography Hierarchy

- `font-semibold` (not bold) for headings and emphasis
- `text-sm` for body text and secondary information
- `text-xs` for labels and metadata
- `text-muted-foreground` for de-emphasized content
- Keep font sizes semantic using Tailwind scale

#### Spacing System

**Gaps (use flexbox/grid):**
- `gap-1` (0.25rem) - Toggle group items, tight pill groups
- `gap-2` (0.5rem) - Button groups, form field groups
- `gap-4` (1rem) - Section spacing, card spacing
- `gap-6` (1.5rem) - Major section separation

**Padding:**
- `p-1` - Compact containers (toggle groups)
- `p-4` - Compact layouts (mobile, tight spacing)
- `p-6` - Standard containers (desktop, cards)
- `px-6 py-4` - Header/footer padding

**Margins:**
- Avoid margins - use `gap` with flex/grid instead
- Prefer layout primitives over manual spacing

#### Toggle Groups & Segmented Controls

**Pattern:** Muted background container with active state
```tsx
<ToggleGroup className="bg-muted p-1 gap-1 rounded-md">
  <ToggleGroupItem className="data-[state=on]:bg-background">
```
- Container: `bg-muted` with `p-1` padding
- Active state: `bg-background` (white pill effect)
- No borders, no shadows
- Small gap between items (`gap-1`)

#### Navigation States

**Ghost Button Pattern (Preferred):**
- Default: Transparent background
- Hover: `hover:bg-accent` or `hover:bg-accent/50`
- No borders, no shadows
- Use for: Chevrons, icon buttons, menu items

**Selected States:**
- Toggle groups: `data-[state=on]:bg-background`
- Navigation: `bg-accent` with `text-accent-foreground`
- Tabs: Active tab has `bg-background`, inactive has no background

#### Inline Content (No Borders Rule)

**Calendar Events:**
```tsx
className="bg-accent/50 hover:bg-accent rounded-md"
// NO border property
```

**Badges & Pills:**
- Use `bg-accent/50` or `bg-muted`
- NO borders
- Subtle tint backgrounds only

**Status Indicators:**
- Color via background tint, not border
- Example: `bg-green-500/10` for success states

#### Overlay Components (Borders Allowed)

These components SHOULD have borders and shadows:
- **Dialogs**: `border shadow-lg` (needs separation from overlay)
- **Sheets**: `border-l/r/t/b shadow-lg` (slide-out panels)
- **Popovers**: `border shadow-md` (floating menus)
- **Cards**: `border shadow-sm` (elevated content blocks)
- **Tooltips**: `border shadow-sm` (contextual overlays)

#### Responsive Dialog Pattern (Mobile Bottom Sheet)

**Rule:** All modal dialogs should display as bottom sheets on mobile devices for better UX.

**Use the `ResponsiveDialog` component** from `@/components/ui/responsive-dialog`:
- On desktop: Renders as a centered `Dialog`
- On mobile: Renders as a `Sheet` sliding from bottom

**Usage:**
```tsx
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';

function MyDialog({ open, onOpenChange }: Props) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Title</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Description text here.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4 py-4">
          {/* Dialog content */}
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
```

**Key Points:**
- Uses `useIsMobile()` hook from `@/hooks/use-mobile`
- Mobile breakpoint: 768px
- Bottom sheet styling: `max-h-[90vh] overflow-y-auto rounded-t-xl`
- Same API as Dialog but automatically adapts to screen size

**When to use:**
- All action dialogs (confirm, create, edit, delete)
- Form dialogs
- Any modal that requires user interaction

**When NOT to use:**
- Full-page modals or overlays
- Alerts that need to be dismissible with backdrop click only

#### Visual Principles

1. **Minimalism**: Content over decoration - no unnecessary visual elements
2. **Tinted backgrounds**: Use `bg-*/50` for inline content instead of borders
3. **Ghost by default**: Prefer ghost buttons for secondary UI
4. **Borders for elevation**: Only use borders/shadows on overlay components
5. **Subtle hover states**: `transition-colors` with `hover:bg-accent`
6. **Consistent spacing**: Tailwind scale (1, 2, 4, 6) via gap/padding
7. **Accessibility first**: Proper contrast, semantic HTML, keyboard navigation

#### Sidebar Navigation Pattern

**Structure:**
```tsx
<Sidebar>
  <SidebarHeader className="border-b border-sidebar-border">
    <div className="px-3 py-2">
      <h2 className="text-base font-semibold px-2">App Name</h2>
    </div>
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 text-xs text-sidebar-foreground/50">
        Section Name
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="px-2">
              <Link href="/path">
                <Icon className="h-4 w-4" />
                <span className="text-sm">Label</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
  <SidebarFooter className="border-t border-sidebar-border">
    {/* Footer content */}
  </SidebarFooter>
</Sidebar>
```

**Key Principles:**
- Subtle borders on header/footer (`border-sidebar-border`)
- Section labels in muted color (`text-sidebar-foreground/50`)
- Small text sizes (`text-sm` for items, `text-xs` for labels)
- Small icons (`h-4 w-4`)
- Consistent horizontal padding (`px-2`)
- Use sidebar-specific color tokens (`sidebar-foreground`, `sidebar-border`, etc.)

#### Common Mistakes to Avoid

❌ Don't: Add borders to calendar events, badges, or inline pills
✅ Do: Use `bg-accent/50` or `bg-muted` for subtle background tints

❌ Don't: Use outline buttons everywhere
✅ Do: Use ghost buttons for navigation and secondary actions

❌ Don't: Add shadows to inline elements
✅ Do: Reserve shadows for dialogs, sheets, and cards only

❌ Don't: Use `font-bold` everywhere
✅ Do: Use `font-semibold` for emphasis, keep body text regular weight

❌ Don't: Add borders to toggle groups
✅ Do: Use `bg-muted` container with `bg-background` active state

❌ Don't: Make sidebar too busy with large icons and heavy typography
✅ Do: Keep sidebar minimal with small icons (`h-4 w-4`), small text (`text-sm`), and muted labels

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (TanStack Query)

## Task Workflow

### Creating Tasks
- Read requirements from `/requirements/*.md`
- Create brief, actionable task files in `/tasks/todo/`
- Task filename format: `YYMMDD-feature-name.md`
- Each task should reference the original requirement document

### Task File Template
```markdown
# [Feature Name]

**Status**: Todo | In Progress | Done
**Requirement Source**: requirements/[source-file].md
**Estimated Complexity**: Low | Medium | High

## Objective
Brief description of what needs to be built.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tested by Claude
- [ ] Approved by user

## Technical Notes
- Key implementation details
- Dependencies or prerequisites
- Potential challenges

## Testing Checklist
- [ ] UI/UX tested in browser
- [ ] Responsive design verified
- [ ] Error states handled
- [ ] Loading states implemented
```
### Moving Tasks
1. **Todo → In Progress**: When starting work on a task
2. **In Progress → Done**: After Claude tests AND user approves
3. Keep task file updated with progress notes

## Development Guidelines

### Code Style
- Use functional components with TypeScript
- Prefer server components (mark `'use client'` only when needed)
- Use Tailwind utility classes (avoid custom CSS)
- Follow shadcn/ui patterns for consistent design


## Rules
1. Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.
2. ALWAYS use playwright to test your implementation.
3. Before marking any task as done, Claude must:
    1. ✅ Verify code compiles without errors
    2. ✅ Check TypeScript types are correct
    3. ✅ Test in development environment, use playwright
    4. ✅ Verify responsive design (mobile, tablet, desktop), use playwright
    5. ✅ Test error scenarios and edge cases, use playwright
    6. ✅ Ensure loading states work properly, use playwright
    7. ✅ Confirm accessibility basics (keyboard nav, labels), use playwright
    8. Then, await user approval before moving to `/tasks/done/`.
