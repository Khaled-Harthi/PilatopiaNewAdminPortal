# Home Dashboard Redesign

**Status**: Todo (Blocked - waiting for backend)
**Requirement Source**: requirements/design-system.md
**Estimated Complexity**: High

## Objective

Redesign the admin home dashboard with a two-column layout showing today's classes (timeline) alongside all attendees and waitlists (people view), enabling efficient daily operations management.

## Backend Dependencies (Blocking)

Waiting for backend to implement:

1. **New Endpoint:** `GET /admin/attendance/daily/detailed?date={YYYY-MM-DD}`
   - Returns all classes with bookings + waitlists in one call
   - Pre-sorted by `schedule_time`
   - Includes `phone_number` and `position` in waitlist entries

2. **New Endpoint:** `POST /admin/classes/{classId}/waitlist/{memberId}/promote`
   - Manually promote a waitlisted member to booking

## Design

### Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Header: Today + Date Navigation + Quick Actions                             │
├──────────────────────────────────────────────────────────────────────────────┤
│  Stats Bar: Classes | Booked | Checked-in | Waitlisted                      │
├────────────────────────────────────┬─────────────────────────────────────────┤
│  TIMELINE (Left Column)            │  PEOPLE TODAY (Right Column)            │
│  - Completed classes (collapsed)   │  - Waitlisted section                   │
│  - NOW indicator                   │  - All Bookings (searchable)            │
│  - In-progress class               │                                         │
│  - Coming up classes               │                                         │
└────────────────────────────────────┴─────────────────────────────────────────┘
```

### Status Indicators

| Symbol | Status | Color |
|--------|--------|-------|
| `●` | Checked in | `bg-foreground` |
| `○` | Booked (pending) | `bg-muted-foreground/40` |
| `◐` | Waitlisted | `bg-orange-400` |

### People Section Layout (per person)

```
Line 1: ◐ [Name]                    [↗ profile link]
Line 2:   [Class Name] · [Time]
Line 3:   [status info] · [position in line]
Line 4:   [Action Buttons: Call, Promote]
```

## Acceptance Criteria

- [ ] Two-column layout: Timeline (left) | People (right)
- [ ] Stats bar showing: classes, booked, checked-in, waitlisted
- [ ] Timeline shows all classes grouped by status (completed/in-progress/upcoming)
- [ ] NOW indicator in timeline
- [ ] People column shows aggregated waitlists with actions
- [ ] People column shows all bookings with search
- [ ] Quick check-in functionality
- [ ] Promote from waitlist functionality
- [ ] Member names link to `/members/[id]` profile
- [ ] Phone numbers visible for calling
- [ ] Follows design system (minimal, no borders on inline elements)
- [ ] RTL support for Arabic
- [ ] Tested by Claude
- [ ] Approved by user

## Technical Notes

### Components to Create

```
components/home/
├── DailyDashboard.tsx          # Main container
├── DashboardHeader.tsx         # Date nav, title, quick actions
├── DashboardStatsBar.tsx       # Summary statistics
├── TimelineColumn.tsx          # Left column - class timeline
├── TimelineClassRow.tsx        # Individual class row
├── PeopleColumn.tsx            # Right column
├── WaitlistSection.tsx         # All waitlisted members
├── BookingsSection.tsx         # All bookings with search
└── PersonCard.tsx              # Reusable person display
```

### New Types Required

```typescript
interface DailyDetailedResponse {
  success: boolean;
  date: string;
  summary: {
    total_classes: number;
    total_capacity: number;
    total_booked: number;
    total_checked_in: number;
    total_waitlisted: number;
  };
  classes: DailyClassDetail[];
}

interface DailyClassDetail {
  class: { id, name, schedule_time, duration_minutes, instructor, capacity, class_room_name };
  stats: { total_booked, checked_in, pending, waitlisted };
  bookings: ClassBooking[];
  waitlist: WaitlistMember[];
}

interface WaitlistMember {
  member_id: number;
  member_name: string;
  phone_number: string;
  joined_at: string;
  position: number;
}
```

### Files to Modify

| File | Action |
|------|--------|
| `app/[locale]/page.tsx` | Replace with new DailyDashboard |
| `components/DailyAttendance.tsx` | Delete (replaced) |
| `lib/schedule/types.ts` | Add new types |
| `lib/schedule/api.ts` | Add new API functions |
| `lib/schedule/hooks.ts` | Add new React Query hooks |

## Implementation Order

1. Types & API Layer
2. Core Components (layout, header, stats)
3. Timeline Column
4. People Column
5. Integration (check-in, promote, links)
6. Polish (loading, empty states, RTL)

## Testing Checklist

- [ ] UI/UX tested in browser
- [ ] Responsive design verified
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] RTL layout works correctly
- [ ] Check-in functionality works
- [ ] Promote functionality works
- [ ] Profile links navigate correctly
