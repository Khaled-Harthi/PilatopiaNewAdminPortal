# Schedule Management Feature

**Status**: Todo
**Requirement Source**: requirements/schedule-implementation-ready.md
**Estimated Complexity**: High
**Created**: 2025-11-21

## Objective
Build a comprehensive schedule management system for the Pilates studio admin dashboard, allowing SuperAdmins to view, create, edit, delete, and manage class schedules with drag-and-drop functionality, bulk creation, and registration viewing.

## Acceptance Criteria

### Phase 1: Calendar View
- [ ] Integrate [shadcn-ui-big-calendar](https://github.com/list-jonas/shadcn-ui-big-calendar)
- [ ] Display weekly calendar (Sunday-Saturday) with time slots
- [ ] Fetch and display classes via `GET /admin/schedules/classes/by-date-range`
- [ ] Show class cards with: Type, Time, Instructor, Duration, Room, Booking count
- [ ] Implement week navigation (Previous, Next, Today buttons)
- [ ] Add quick create [+] buttons below each day column
- [ ] Display loading skeletons during data fetch
- [ ] Show empty state when no classes scheduled
- [ ] Highlight today's classes with accent background
- [ ] Display full class indicator (🔴 when booked_seats >= capacity)

### Phase 2: View Registrations
- [ ] Open modal on class card click
- [ ] Fetch class details via `GET /admin/attendance/classes/{classId}`
- [ ] Display class information (instructor, duration, type, time, room)
- [ ] Show registrations list with member names, booking time, attendance status
- [ ] Display waitlist section (if any members waiting)
- [ ] Add "View Member Profile" button that opens `/members/{id}` in new tab
- [ ] Show available spots count
- [ ] Handle loading state with skeleton
- [ ] Show empty state when no registrations

### Phase 3: Create Single Class
- [ ] Open sheet from right (LTR) / left (RTL) when clicking [+] button
- [ ] Pre-fill date with clicked day and default time
- [ ] Load dropdowns: instructors, class types, rooms (parallel API calls)
- [ ] Implement date & time picker using shadcn/ui calendar-3 component
- [ ] Add form validation (Zod schema):
  - All fields required
  - Capacity: 1-100
  - Duration: 15-180 minutes
- [ ] Check for instructor/room conflicts before submission
- [ ] Convert local time (UTC+3) to UTC before API call
- [ ] Submit via `POST /admin/schedules/classes/bulk`
- [ ] Show loading state on submit button
- [ ] Display success toast on creation
- [ ] Refresh calendar data and close sheet
- [ ] Handle errors with bilingual messages (EN/AR)

### Phase 4: Edit & Delete Class
- [ ] Implement right-click context menu on class cards
- [ ] Add "Edit Class" option that opens edit sheet
- [ ] Pre-fill edit form with current class data
- [ ] Validate capacity cannot be less than current booked_seats
- [ ] Update class via `POST /admin/attendance/classes/{classId}`
- [ ] Add "Cancel Class" option (in red) to context menu
- [ ] Show confirmation dialog before deletion
- [ ] Display booking count in deletion warning
- [ ] Delete class via `DELETE /admin/attendance/classes/{classId}`
- [ ] Implement optimistic UI updates
- [ ] Rollback on API failure with error toast

### Phase 5: Drag & Drop
- [ ] Enable dragging on class cards
- [ ] Show visual feedback during drag (semi-transparent card)
- [ ] Highlight valid drop zones
- [ ] Fetch classes for target date in background during hover
- [ ] Check for conflicts (instructor/room at same time)
- [ ] Show red border + tooltip on conflicting drop zones
- [ ] Prevent drop if conflict detected
- [ ] Update via `POST /admin/attendance/classes/{classId}` with time & date
- [ ] Implement optimistic UI with rollback on failure
- [ ] Disable drag & drop on touch devices
- [ ] Convert local time to UTC before submission

### Phase 6: Bulk Creation
- [ ] Open sheet when clicking [+ Add Schedule] button
- [ ] Create Step 1: Class details form (type, instructor, duration, capacity, room)
- [ ] Create Step 2: Time slot grid component
  - 7 columns (days) × ~15 rows (time slots 6am-10pm)
  - Click cell to toggle selection
  - Click row header to select all days at that time
  - Click column header to select all times on that day
- [ ] Implement quick pattern buttons:
  - Weekday Mornings (Mon-Fri 6am-11am)
  - Mon/Wed/Fri (all times)
  - Weekend Afternoons (Sat-Sun 12pm-6pm)
  - Clear All
- [ ] Real-time conflict validation as slots are selected
- [ ] Display conflicts below grid with specific details
- [ ] Disable submit button if conflicts exist
- [ ] Create Step 3: Repeat pattern options
  - One-time only (1 week)
  - Repeat weekly (start date + number of weeks)
- [ ] Show total class count preview
- [ ] Generate CSV in browser from form data (using IDs not names)
- [ ] Upload CSV via `POST /admin/schedules/upload`
- [ ] Show progress modal during creation
- [ ] Handle partial failures (show created vs failed count)
- [ ] Refresh calendar on success

### Phase 7: Polish & Responsive
- [ ] Implement responsive breakpoints:
  - Mobile (< 640px): Switch to day view, disable drag-drop
  - Tablet (640-1024px): 3-4 day view
  - Desktop (≥ 1024px): Full week view
- [ ] Add RTL support (sheet opens from left, mirror arrows)
- [ ] Detect touch devices and adjust interactions
- [ ] Implement all loading states (skeletons, spinners, progress bars)
- [ ] Implement all empty states with proper messaging
- [ ] Add all error messages in English and Arabic
- [ ] Ensure ARIA labels for screen readers
- [ ] Implement keyboard navigation (Tab, Enter, Arrow keys, Space)
- [ ] Add hover states for desktop interactions
- [ ] Long-press context menu for touch devices
- [ ] Optimize performance (memoization, lazy loading)

### Phase 8: Testing
- [ ] Write unit tests for:
  - Time conversion utilities (UTC+3 ↔ UTC)
  - CSV generation logic
  - Conflict detection algorithm
  - Form validation schemas
- [ ] Write integration tests for API calls
- [ ] Create Playwright E2E tests:
  - Create single class flow
  - Create bulk classes flow
  - Edit class flow
  - Delete class with confirmation
  - Drag & drop class to new time
  - View registrations modal
  - Mobile responsive behavior
  - Error scenarios (network errors, conflicts)
  - Empty states
  - Loading states
- [ ] Test RTL layout in Arabic locale
- [ ] Test touch interactions on mobile viewport
- [ ] Verify all error messages appear in correct language

### Final Verification
- [ ] Code compiles without errors
- [ ] TypeScript types are correct
- [ ] All features work in development environment
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Error scenarios tested and handled properly
- [ ] Loading states work correctly
- [ ] Accessibility basics confirmed (keyboard nav, ARIA labels)
- [ ] User approval received

## Technical Notes

### Key Dependencies
- **Calendar Component**: [shadcn-ui-big-calendar](https://github.com/list-jonas/shadcn-ui-big-calendar)
- **Date Picker**: shadcn/ui calendar-3 from [shadcnblocks](https://www.shadcnblocks.com/component/calendar/calendar-standard-3)
- **UI Components**: shadcn/ui (Sheet, Dialog, Toast, Select, Button, etc.)
- **Validation**: Zod for form schemas
- **State Management**: React Query (TanStack Query) for API calls
- **i18n**: Bilingual error messages (EN/AR)

### Time Zone Handling
- **Display**: UTC+3 (Saudi Arabia local time)
- **Storage**: UTC in database
- **Conversion**: Always subtract 3 hours when sending to API, add 3 hours when displaying
- **No DST**: Saudi Arabia doesn't observe daylight saving time

### Conflict Detection Logic
A conflict exists when:
1. Same instructor is scheduled at overlapping time, OR
2. Same room is scheduled at overlapping time

Example:
```typescript
function hasConflict(newClass, existingClasses) {
  const newStart = new Date(newClass.schedule_time);
  const newEnd = new Date(newStart.getTime() + newClass.duration * 60000);

  return existingClasses.some(cls => {
    const clsStart = new Date(cls.schedule_time);
    const clsEnd = new Date(clsStart.getTime() + cls.duration_minutes * 60000);

    const overlaps = newStart < clsEnd && newEnd > clsStart;
    const sameInstructor = cls.instructor_id === newClass.instructor_id;
    const sameRoom = cls.class_room_id === newClass.class_room_id;

    return overlaps && (sameInstructor || sameRoom);
  });
}
```

### CSV Generation Format
```csv
class_type_id,instructor_id,room_id,date,time,capacity,duration
1,5,2,2024-01-15,04:00,12,50
```
- Use **IDs** not names
- **Time in UTC** (HH:mm format, 24-hour)
- **Date in ISO** (YYYY-MM-DD)

### API Endpoints Summary
```typescript
// View
GET /admin/schedules/classes/by-date-range?startDate={date}&endDate={date}
GET /admin/attendance/classes/{classId}

// Create
POST /admin/schedules/classes/bulk
POST /admin/schedules/upload (CSV multipart/form-data)

// Update
POST /admin/attendance/classes/{classId}

// Delete
DELETE /admin/attendance/classes/{classId}

// Dropdowns
GET /admin/instructors
GET /admin/class-types/all
GET /admin/classes/rooms
```

### Component Structure
```
app/
└── admin/
    └── schedules/
        ├── page.tsx                    # Main calendar view
        ├── components/
        │   ├── schedule-calendar.tsx   # Big calendar wrapper
        │   ├── class-card.tsx          # Class card component
        │   ├── registration-modal.tsx  # View registrations
        │   ├── create-class-sheet.tsx  # Single class creation
        │   ├── edit-class-sheet.tsx    # Edit class
        │   ├── bulk-create-sheet.tsx   # Bulk creation
        │   ├── time-slot-grid.tsx      # Grid for bulk creation
        │   ├── delete-class-dialog.tsx # Confirmation dialog
        │   └── class-context-menu.tsx  # Right-click menu
        ├── hooks/
        │   ├── use-classes.ts          # React Query hooks
        │   ├── use-drag-drop.ts        # Drag & drop logic
        │   └── use-conflict-checker.ts # Conflict detection
        └── lib/
            ├── time-utils.ts           # UTC conversion
            ├── csv-generator.ts        # CSV creation
            └── validation.ts           # Zod schemas
```

### Error Message Reference
See `/requirements/schedule-implementation-ready.md` Section 9 (Error Handling) for complete bilingual error messages.

## Potential Challenges

1. **Big Calendar Integration**: May need customization to match exact UI mockup
2. **Drag & Drop Conflicts**: Real-time conflict checking requires efficient background API calls
3. **Bulk Creation Validation**: Validating hundreds of time slots across weeks can be performance-intensive
4. **Time Zone Edge Cases**: Ensure proper UTC conversion for dates that cross midnight
5. **Mobile Touch Interactions**: Disabling drag-drop and implementing long-press context menu
6. **RTL Layout**: Ensuring all directional UI elements mirror correctly
7. **Optimistic UI Rollback**: Maintaining UI consistency when API calls fail

## Testing Checklist

### Manual Testing
- [ ] Create single class and verify it appears on calendar
- [ ] Edit class and confirm changes reflect immediately
- [ ] Delete class with confirmation and verify removal
- [ ] Drag class to new time and check for conflict warnings
- [ ] Create bulk schedule for 12 weeks and verify all created
- [ ] View registrations modal and click member profile link
- [ ] Test on mobile (day view, no drag-drop, touch interactions)
- [ ] Switch to Arabic and verify RTL layout and translations
- [ ] Trigger network error (offline) and verify error handling
- [ ] Create conflicting class and verify validation prevents it

### Playwright E2E Tests
```typescript
test('should create single class successfully', async ({ page }) => {
  // Navigate to schedule page
  // Click [+] button for Monday
  // Fill form with valid data
  // Submit and verify success toast
  // Verify class appears on calendar
});

test('should prevent conflicting class creation', async ({ page }) => {
  // Navigate to schedule page
  // Create class at 9am with instructor "Farah"
  // Try creating another class at 9am with same instructor
  // Verify error message appears
  // Verify submit button is disabled
});

test('should drag and drop class to new time', async ({ page }) => {
  // Create a class
  // Drag class card to different time slot
  // Verify optimistic UI update
  // Verify API call made
  // Verify class persists at new time
});
```

## Dependencies on Other Tasks
- [ ] Arabic i18n support (`251121-add-arabic-i18n-support.md`) should be completed first

## Resources
- **Spec**: `/requirements/schedule-implementation-ready.md`
- **Gap Analysis**: `/requirements/schedule-gaps-analysis.md`
- **Original Requirements**: `/requirements/schedule.md`
- **Big Calendar Docs**: https://github.com/list-jonas/shadcn-ui-big-calendar
- **shadcn/ui Components**: https://ui.shadcn.com
- **Calendar 3 Component**: https://www.shadcnblocks.com/component/calendar/calendar-standard-3

---

**Notes**:
- This is a large feature spanning ~8 implementation phases
- Consider breaking into smaller sub-tasks if needed
- Prioritize Phase 1-3 for MVP, then add advanced features
- Ensure thorough testing given complexity of time handling and conflicts
