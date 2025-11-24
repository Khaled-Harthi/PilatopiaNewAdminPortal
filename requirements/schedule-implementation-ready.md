# Schedule Management - Implementation Ready Spec

**Date**: 2025-11-21
**Status**: Ready for Implementation
**Based On**: requirements/schedule.md + Gap Analysis

---

## Table of Contents
1. [API Endpoints Reference](#api-endpoints-reference)
2. [View Schedule](#view-schedule)
3. [Drag & Drop Editing](#drag--drop-editing)
4. [Quick Class Actions](#quick-class-actions)
5. [View Registrations](#view-registrations)
6. [Create Single Class](#create-single-class)
7. [Create Bulk Classes](#create-bulk-classes)
8. [Business Rules](#business-rules)
9. [Error Handling](#error-handling)
10. [Loading States](#loading-states)
11. [Empty States](#empty-states)
12. [Responsive Design](#responsive-design)

---

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/schedules/classes/by-date-range?startDate={yyyy-MM-dd}&endDate={yyyy-MM-dd}` | Fetch classes for date range |
| GET | `/admin/attendance/classes/{classId}` | Get class details with registrations |
| POST | `/admin/attendance/classes/{classId}` | Update class (edit/drag-drop) |
| DELETE | `/admin/attendance/classes/{classId}` | Cancel/delete class |
| POST | `/admin/schedules/classes/bulk` | Create single or multiple classes |
| POST | `/admin/schedules/upload` | Bulk create via CSV |
| GET | `/admin/instructors` | List all instructors |
| GET | `/admin/class-types/all` | List all class types |
| GET | `/admin/classes/rooms` | List all rooms |

---

## View Schedule

### Default Behavior
- Shows current week (Sunday-Saturday)
- Week start is hardcoded to Sunday
- All times displayed in UTC+3 (Saudi Arabia timezone)
- Classes sorted by time (earliest first)

### Calendar Implementation
**MUST USE**: [Shadcn/UI - Big Calendar](https://github.com/list-jonas/shadcn-ui-big-calendar)

### API Call
```typescript
GET /admin/schedules/classes/by-date-range?startDate=2024-01-14&endDate=2024-01-20
```

**Response**:
```json
{
  "success": true,
  "total_classes": 25,
  "classes": [{
    "id": 1,
    "class_type_id": 1,
    "instructor_id": 5,
    "capacity": 8,
    "schedule_time": "2024-01-15T07:00:00Z",
    "duration_minutes": 50,
    "instructor": "Jane Doe",
    "class_type": "Reformer",
    "booked_seats": 6,
    "class_room_name": "Studio A"
  }]
}
```

### UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Schedules                                    [+ Add Schedule]│
├─────────────────────────────────────────────────────────────┤
│  [← Previous]  Jan 14 - Jan 20, 2024  [Today]  [Next →]    │
├─────────────────────────────────────────────────────────────┤
│  SUN    MON    TUE    WED    THU    FRI    SAT              │
│  ───────────────────────────────────────────────────────────│
│  6am                                                          │
│  ┌─────────┐ ┌─────────┐                                    │
│  │ Reform  │ │ Reform  │                                    │
│  │ 6:00 AM │ │ 6:00 AM │                                    │
│  │─────────│ │─────────│                                    │
│  │ Farah   │ │ Sarah   │                                    │
│  │ 50 min  │ │ 50 min  │                                    │
│  │ Studio A│ │ Studio B│                                    │
│  │─────────│ │─────────│                                    │
│  │ 👥 6/8  │ │ 👥 4/8  │                                    │
│  └─────────┘ └─────────┘                                    │
│     [+]        [+]        [+]      [+]      [+]      [+]    │
└─────────────────────────────────────────────────────────────┘
```

### Class Card Design
**Structure**:
- Line 1: Class type name (truncated if long)
- Line 2: Time (e.g., "6:00 AM")
- Line 3: Instructor name
- Line 4: Duration (e.g., "50 min")
- Line 5: Room name
- Line 6: Booking status (e.g., "👥 6/8")

**Visual States**:
- **Full class**: Red indicator or 🔴 emoji (booked_seats >= capacity)
- **Today's classes**: Highlighted background
- **Past classes**: Grayed out (optional)
- **Hover**: Elevation/shadow effect
- **Dragging**: Semi-transparent with dotted border

**Accessibility**:
- Add ARIA labels for screen readers
- Keyboard navigation support (Tab, Enter, Arrow keys)
- Focus visible indicators

### Navigation Controls
- **[← Previous]**: Go back one week
- **[Next →]**: Go forward one week
- **[Today]**: Jump to current week
- **[+ Add Schedule]**: Open bulk creation sheet

### Quick Add Buttons
- **[+]** button below each day column
- Opens single class creation sheet
- Pre-fills date with clicked day

---

## Drag & Drop Editing

### Behavior
1. User drags class card from one slot to another
2. During drag:
   - Card becomes semi-transparent
   - Valid drop zones highlighted
   - Invalid drop zones show red outline with tooltip
3. On hover over drop zone:
   - Fetch classes for that date/time in background
   - Check for conflicts (same instructor or same room at overlapping time)
   - If conflict: Show red border + tooltip with conflict details
4. On drop:
   - If conflict: Prevent drop + show toast error
   - If valid: Optimistic UI update + API call
   - If API fails: Rollback to original position + show error toast

### Conflict Detection Rules
**A conflict exists when**:
- Same instructor is scheduled at overlapping time
- Same room is scheduled at overlapping time
- Either or both conditions apply

**Example**:
```
Cannot drop: Instructor "Farah" already teaching at 9:00 AM on Monday
Cannot drop: Room "Studio A" already booked at 9:00 AM on Monday
```

### API Call
```typescript
POST /admin/attendance/classes/{classId}
```

**Request Body**:
```json
{
  "time": "09:00",
  "date": "2025-11-25"
}
```

**Notes**:
- Time in HH:mm format (24-hour)
- Date in ISO format (YYYY-MM-DD)
- Convert local time to UTC before sending (subtract 3 hours)

### Error Handling
- Network error: Rollback + show retry toast
- Conflict error: Rollback + show specific conflict message
- Validation error: Rollback + show validation message

---

## Quick Class Actions

### Right-Click Context Menu
On right-click of class card, show context menu with:
1. **Edit Class** - Opens edit sheet
2. **Cancel Class** (in red text) - Opens confirmation dialog

### Left-Click Behavior
- Opens registration modal (see [View Registrations](#view-registrations))

---

## Edit Class

### Trigger
- Right-click → "Edit Class"
- Or double-click class card (optional)

### UI - Sheet Component
```
┌─────────────────────────────────────────────────────────┐
│ Edit Class                                         [×] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Define Class Details                                    │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Class Type:    [Reformer ▼]                        │  │
│ │ Instructor:    [Farah ▼]                           │  │
│ │ Duration:      [50 minutes ▼]                      │  │
│ │ Capacity:      [12]                                │  │
│ │ Room:          [Studio A ▼]                        │  │
│ │ Date & Time:   [11AM, Jan 15, 2024 ▼]             │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│                                      [Submit] [Cancel]  │
└─────────────────────────────────────────────────────────┘
```

### Form Pre-filling
- All fields must be pre-filled with current class data
- Fetch data from calendar state (already loaded)

### Date & Time Picker
Use: [shadcn/ui calendar 3](https://www.shadcnblocks.com/component/calendar/calendar-standard-3)

### Validation Rules
- **Capacity**:
  - Min: Cannot be less than current booked_seats
  - Max: 100
  - Must be > 0
- **Duration**: Standard options (30, 45, 50, 60, 75, 90 minutes)
- **Time**: Round to nearest 15-minute interval (optional)
- **Conflict check**: Before submit, check for instructor/room conflicts

### API Call
```typescript
POST /admin/attendance/classes/{classId}
```

**Request Body** (only changed fields):
```json
{
  "time": "09:00",
  "date": "2025-11-25",
  "class_type_id": 1,
  "instructor_id": 5,
  "duration": 50,
  "capacity": 12,
  "class_room_id": 2
}
```

### Error Messages
```typescript
const errorMessages = {
  en: {
    capacityTooLow: "Capacity cannot be less than current bookings",
    capacityTooHigh: "Capacity cannot exceed 100",
    capacityZero: "Capacity must be at least 1",
    instructorConflict: "Instructor is already teaching at this time",
    roomConflict: "Room is already booked at this time",
    networkError: "Failed to update class. Please try again.",
  },
  ar: {
    capacityTooLow: "لا يمكن أن تكون السعة أقل من الحجوزات الحالية",
    capacityTooHigh: "لا يمكن أن تتجاوز السعة 100",
    capacityZero: "يجب أن تكون السعة على الأقل 1",
    instructorConflict: "المدرب يقوم بالتدريس بالفعل في هذا الوقت",
    roomConflict: "الغرفة محجوزة بالفعل في هذا الوقت",
    networkError: "فشل تحديث الحصة. يرجى المحاولة مرة أخرى.",
  }
}
```

---

## Cancel Class

### Trigger
Right-click → "Cancel Class"

### Confirmation Dialog
```
┌─────────────────────────────────────────┐
│  Cancel Class                           │
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to cancel this  │
│  class? This action cannot be undone.  │
│                                         │
│  • 6 members will lose their booking   │
│  • No refunds will be processed        │
│                                         │
│               [Cancel] [Confirm]        │
└─────────────────────────────────────────┘
```

**Arabic Version**:
```
إلغاء الحصة

هل أنت متأكد من إلغاء هذه الحصة؟ لا يمكن التراجع عن هذا الإجراء.

• سيفقد 6 أعضاء حجوزاتهم
• لن تتم معالجة أي مبالغ مستردة

[إلغاء] [تأكيد]
```

### API Call
```typescript
DELETE /admin/attendance/classes/{classId}
```

### Post-Delete Behavior
- Remove class card from calendar immediately (optimistic UI)
- Show success toast
- If API fails: Restore card + show error toast

---

## View Registrations

### Trigger
Left-click on class card

### Modal Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Mon Jan 15, 2024 • Morning Reformer                         [×] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Instructor: Farah                                               │
│  Duration: 50 minutes                                            │
│  Type: Reformer                                                  │
│  Time: 7:00 AM - 7:50 AM                                        │
│  Room: Studio A                                                  │
│                                                                   │
│  Registrations: 5/8                                              │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Registrations                                                   │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │  Sarah Johnson                                              │  │
│  │  Booked: Jan 10, 2024 at 3:45 PM                          │  │
│  │  ✓ Attended                                                 │  │
│  │  [View Member Profile] →                                    │  │
│  │                                                             │  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │  Emma Williams                                              │  │
│  │  Booked: Jan 8, 2024 at 11:30 AM                          │  │
│  │  [View Member Profile] →                                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  3 available spots remaining                                     │
│                                                                   │
│  Waitlist (2)                                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Alex Martinez                                              │  │
│  │  Joined: Jan 14, 2024 at 8:00 PM                          │  │
│  │  [View Member Profile] →                                    │  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │  Sophie Lee                                                 │  │
│  │  Joined: Jan 15, 2024 at 10:30 AM                         │  │
│  │  [View Member Profile] →                                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### API Call
```typescript
GET /admin/attendance/classes/{classId}
```

**Expected Response** (extend existing):
```json
{
  "success": true,
  "class": {
    "id": 1,
    "class_type": "Reformer",
    "instructor": "Farah",
    "duration_minutes": 50,
    "schedule_time": "2024-01-15T07:00:00Z",
    "capacity": 8,
    "room": "Studio A"
  },
  "registrations": [
    {
      "member_id": 123,
      "member_name": "Sarah Johnson",
      "booked_at": "2024-01-10T15:45:00Z",
      "attended": true
    }
  ],
  "waitlist": [
    {
      "member_id": 456,
      "member_name": "Alex Martinez",
      "joined_at": "2024-01-14T20:00:00Z"
    }
  ],
  "available_spots": 3
}
```

### Member Profile Link
- Renders as button with right arrow icon
- Opens in **new tab**: `/members/{member_id}`
- Keeps registration modal open
- Supports Cmd/Ctrl+Click for new tab

**Implementation**:
```tsx
<Button
  variant="link"
  onClick={() => window.open(`/members/${member_id}`, '_blank')}
  className="p-0 h-auto"
>
  View Member Profile →
</Button>
```

### Waitlist Display
- Shows below registrations section
- Header: "Waitlist (N)" where N is count
- Same card layout as registrations but without "Attended" status
- If waitlist empty: Don't show section

---

## Create Single Class

### Trigger
- Click **[+]** button below any day column on calendar

### Sheet Component
Opens from **right side** (LTR) or **left side** (RTL)

```
┌─────────────────────────────────────────────────────────┐
│ Create Class                                         [×] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Define Class Details                                    │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Class Type:    [Select... ▼]                       │  │
│ │ Instructor:    [Select... ▼]                       │  │
│ │ Duration:      [50 minutes ▼]                      │  │
│ │ Capacity:      [8]                                 │  │
│ │ Room:          [Select... ▼]                       │  │
│ │ Date & Time:   [11AM, Jan 15, 2024 ▼]             │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│                                            [Create]      │
└─────────────────────────────────────────────────────────┘
```

### Pre-filling
- **Date**: Pre-filled with clicked day
- **Time**: Pre-filled with clicked time slot (or default 9:00 AM)
- Other fields: Empty

### Dropdown Data Loading
When sheet opens, make these API calls in parallel:
```typescript
GET /admin/instructors
GET /admin/class-types/all
GET /admin/classes/rooms
```

Show loading skeletons in dropdowns while fetching.

### Validation
- All fields required
- Capacity: 1-100
- Check conflicts before submission (instructor/room at same time)

### API Call
```typescript
POST /admin/schedules/classes/bulk
```

**Request Body**:
```json
{
  "classesConfig": {
    "classTypeId": 1,
    "instructorId": 5,
    "classRoomId": 2,
    "capacity": 8,
    "durationMinutes": 50
  },
  "dates": ["2024-01-15"],
  "startTime": "11:00"
}
```

**Notes**:
- `startTime` in HH:mm format (24-hour)
- Convert local time to UTC (subtract 3 hours)
- `dates` array has only one date for single class creation

### Post-Creation
- Close sheet
- Refetch calendar data for current week
- Show success toast with class details
- Scroll to created class (if not visible)

---

## Create Bulk Classes

### Trigger
Click **[+ Add Schedule]** button (top right)

### Sheet Interface
```
┌─────────────────────────────────────────────────────────┐
│ Create Class Schedule                               [×] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Step 1: Define Class Details                            │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Class Type:    [Reformer ▼]                        │  │
│ │ Instructor:    [Farah ▼]                           │  │
│ │ Duration:      [50 minutes ▼]                      │  │
│ │ Capacity:      [12]                                │  │
│ │ Room:          [Studio A ▼]                        │  │
│ └────────────────────────────────────────────────────┘  │
│                                                         │
│ Step 2: Select Time Slots                               │
│ ┌────────────────────────────────────────────────────┐  │
│ │  Click to select multiple times:                   │  │
│ │                                                    │  │
│ │  Quick patterns: [Weekday Mornings] [Mon/Wed/Fri]  │  │
│ │                  [Weekend Afternoons] [Clear All]  │  │
│ │                                                    │  │
│ │       MON   TUE   WED   THU   FRI   SAT   SUN      │  │
│ │  6am  [ ]   [ ]   [ ]   [ ]   [ ]   [ ]   [ ]      │  │
│ │  7am  [ ]   [ ]   [ ]   [ ]   [ ]   [✓]   [ ]      │  │
│ │  8am  [ ]   [ ]   [ ]   [ ]   [ ]   [✓]   [ ]      │  │
│ │  9am  [ ]   [ ]   [ ]   [ ]   [ ]   [✓]   [ ]      │  │
│ │  ...                                               │  │
│ │                                                    │  │
│ │  ℹ️ Click row/column headers to select all         │  │
│ │  Selected: 3 time slots                            │  │
│ │  ⚠️ Conflicts: Mon 9am (Farah busy)                │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Step 3: Repeat Pattern                                  │
│ ┌────────────────────────────────────────────────────┐  │
│ │ ○ One-time only (1 week)                           │  │
│ │ ● Repeat weekly                                     │  │
│ │   Starting: [Jan 15, 2024 ▼]                       │  │
│ │   For: [12 ▼] weeks                                │  │
│ │                                                     │  │
│ │ 📊 This will create 36 classes (3 slots × 12 wks)  │  │
│ │                                                     │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│                                         [Create Classes] │
└─────────────────────────────────────────────────────────┘
```

### Time Slot Grid Interactions

**Click Behaviors**:
- **Click cell**: Toggle individual time slot
- **Click row header** (e.g., "7am"): Select/deselect all days at that time
- **Click column header** (e.g., "MON"): Select/deselect all times on that day
- **Keyboard**: Arrow keys navigate, Space toggles

**Visual States**:
- Unchecked: Light background
- Checked: Primary color background with checkmark
- Conflicting: Red border + tooltip on hover
- Disabled: Grayed out (if instructor/room not available for entire period)

### Quick Pattern Buttons

**Weekday Mornings**: Selects Mon-Fri, 6am-11am
**Mon/Wed/Fri**: Selects all times on Mon, Wed, Fri
**Weekend Afternoons**: Selects Sat-Sun, 12pm-6pm
**Clear All**: Deselects all checkboxes

### Conflict Validation

**When to check**:
- Real-time as user selects time slots
- Before enabling "Create Classes" button

**What to check**:
- For each selected time slot + date in range
- Check if instructor has existing class at that time
- Check if room has existing class at that time

**How to display**:
- Below grid: "⚠️ Conflicts detected:"
- List each conflict: "Mon 9am (Farah busy), Tue 3pm (Studio A booked)"
- Disable "Create Classes" button if any conflicts
- Conflicting checkboxes get red border

**Implementation Note**:
To avoid excessive API calls, fetch all classes for selected instructor/room for the entire date range when user fills Step 1, then validate client-side.

### Repeat Pattern Options

1. **One-time only**: Creates classes for next 7 days only
2. **Repeat weekly**:
   - Start date picker
   - Number of weeks dropdown (1-52)
   - Shows total class count preview
3. ~~**Custom dates**: Removed from scope~~

### CSV Generation (Internal)

When user clicks "Create Classes":
1. Generate CSV in browser from form data
2. Format:
   ```csv
   class_type_id,instructor_id,room_id,date,time,capacity,duration
   1,5,2,2024-01-15,04:00,12,50
   1,5,2,2024-01-21,06:00,12,50
   ```
3. **Use IDs, not names** in CSV
4. **Time in UTC** (already converted from UTC+3)
5. Date in ISO format (YYYY-MM-DD)
6. Create blob and upload as multipart/form-data

### API Call
```typescript
POST /admin/schedules/upload
Content-Type: multipart/form-data
```

**Request**:
```
------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="schedule.csv"
Content-Type: text/csv

class_type_id,instructor_id,room_id,date,time,capacity,duration
1,5,2,2024-01-15,04:00,12,50
...
```

### Progress Indicator
- Show modal with progress bar during upload
- "Creating 36 classes..."
- Spinner + percentage if backend supports progress
- Don't allow closing until complete or failed

### Post-Creation
- Show success toast: "Successfully created 36 classes"
- Close sheet
- Refetch calendar data
- Jump to first created class

### Partial Failure Handling
If backend returns partial success (e.g., 30/36 created):
- Show warning toast: "Created 30 of 36 classes. 6 failed due to conflicts."
- Offer "Download error report" button (CSV of failed rows)
- Still close sheet and refresh calendar

---

## Business Rules

### Permissions
- **SuperAdmin only** can access schedule management
- Check permissions before rendering any create/edit/delete actions

### Time Handling
- **Display**: All times shown in UTC+3 (Saudi Arabia local time)
- **Storage**: All times stored in UTC in backend
- **Conversion**: Subtract 3 hours when sending to API, add 3 hours when displaying
- **No Daylight Saving**: Saudi Arabia doesn't observe DST, so offset is always +3

### Week Configuration
- Week starts on **Sunday**
- Week ends on **Saturday**
- Default view: Current week
- "Today" button always returns to week containing current date

### Class Ordering
- Classes displayed in **time order** (earliest to latest)
- Within same time slot, order by room name alphabetically

### Today Highlighting
- Classes scheduled for current date get highlighted background
- Use subtle accent color, not too prominent
- Ensure text remains readable

### Auto-Refresh
- After creating classes: Refetch calendar data
- After editing class: Update in-place (optimistic UI) + refetch
- After deleting class: Remove from view (optimistic UI) + refetch
- Maintain scroll position after refresh
- Maintain current week view (don't jump to different week)

---

## Error Handling

### General Principles
- All error messages must be in **both English and Arabic**
- Use shadcn/ui Toast component for transient errors
- Use AlertDialog for critical errors requiring acknowledgment
- Use inline validation messages for form errors

### Error Message Patterns

```typescript
interface ErrorMessages {
  en: string;
  ar: string;
}

const errors = {
  networkError: {
    en: "Network error. Please check your connection and try again.",
    ar: "خطأ في الشبكة. يرجى التحقق من الاتصال والمحاولة مرة أخرى."
  },
  unauthorizedError: {
    en: "You don't have permission to perform this action.",
    ar: "ليس لديك إذن لتنفيذ هذا الإجراء."
  },
  instructorConflict: {
    en: "This instructor is already teaching at this time.",
    ar: "هذا المدرب يقوم بالتدريس بالفعل في هذا الوقت."
  },
  roomConflict: {
    en: "This room is already booked at this time.",
    ar: "هذه الغرفة محجوزة بالفعل في هذا الوقت."
  },
  capacityTooLow: {
    en: "Capacity cannot be less than current bookings.",
    ar: "لا يمكن أن تكون السعة أقل من الحجوزات الحالية."
  },
  capacityInvalid: {
    en: "Capacity must be between 1 and 100.",
    ar: "يجب أن تكون السعة بين 1 و 100."
  },
  requiredField: {
    en: "This field is required.",
    ar: "هذا الحقل مطلوب."
  },
  classNotFound: {
    en: "Class not found. It may have been deleted.",
    ar: "الحصة غير موجودة. ربما تم حذفها."
  },
  bulkCreatePartialFailure: {
    en: (created: number, total: number) =>
      `Created ${created} of ${total} classes. Some failed due to conflicts.`,
    ar: (created: number, total: number) =>
      `تم إنشاء ${created} من ${total} حصة. فشل البعض بسبب التعارضات.`
  }
}
```

### API Error Handling

**Network Errors** (no response):
```typescript
try {
  await api.updateClass(id, data);
} catch (error) {
  if (!error.response) {
    toast({
      variant: "destructive",
      title: errors.networkError[locale],
    });
  }
}
```

**HTTP Errors**:
- **401**: Show unauthorizedError + redirect to login
- **403**: Show unauthorizedError
- **404**: Show classNotFound
- **409**: Show specific conflict error (parse from response)
- **422**: Show validation errors (parse from response)
- **500**: Show generic server error message

### Optimistic UI Rollback

For drag & drop and inline edits:
```typescript
// 1. Store original state
const originalClass = { ...classData };

// 2. Update UI optimistically
updateClassInState(newData);

// 3. Make API call
try {
  await api.updateClass(id, newData);
} catch (error) {
  // 4. Rollback on error
  updateClassInState(originalClass);
  toast({ variant: "destructive", title: getErrorMessage(error) });
}
```

### Form Validation

Use Zod schemas for client-side validation:
```typescript
const classFormSchema = z.object({
  classTypeId: z.number().min(1, "Class type is required"),
  instructorId: z.number().min(1, "Instructor is required"),
  roomId: z.number().min(1, "Room is required"),
  capacity: z.number().min(1).max(100),
  duration: z.number().min(15).max(180),
  date: z.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/)
});
```

Show validation errors inline below form fields using shadcn/ui Form component.

---

## Loading States

### Calendar Grid
**Initial Load**:
- Show skeleton loaders for class cards
- 7 columns (days) × ~10 rows (time slots)
- Each skeleton: Rectangle with shimmer effect
- Duration: Until API response arrives

**Week Navigation**:
- Show spinner overlay on calendar
- Dim existing content slightly
- Disable navigation buttons during load

### Drag & Drop
- No loading indicator needed (optimistic UI)
- On error: Show toast and rollback

### Forms (Create/Edit Sheets)
**Dropdown Loading**:
```tsx
<Select disabled={isLoading}>
  <SelectTrigger>
    {isLoading ? (
      <div className="flex items-center gap-2">
        <Spinner className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    ) : (
      <SelectValue placeholder="Select..." />
    )}
  </SelectTrigger>
</Select>
```

**Submit Button**:
```tsx
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner className="mr-2 h-4 w-4" />
      Creating...
    </>
  ) : (
    "Create Class"
  )}
</Button>
```

### Bulk Creation Progress
Modal with progress indicator:
```
┌─────────────────────────────────────┐
│  Creating Classes                   │
├─────────────────────────────────────┤
│                                     │
│     [████████░░░░░░░░░░] 45%       │
│                                     │
│  Creating class 16 of 36...        │
│                                     │
└─────────────────────────────────────┘
```

Cannot be dismissed until complete or failed.

### Registration Modal
- Show skeleton for registration list while loading
- Show spinner for waitlist section

---

## Empty States

### Calendar - No Classes This Week
```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│              📅                                         │
│                                                          │
│        No classes scheduled this week                   │
│                                                          │
│  [+ Create Single Class]  [+ Create Schedule]          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Arabic**:
```
لا توجد حصص مجدولة هذا الأسبوع
```

### Registration Modal - No Registrations
```
┌─────────────────────────────────────────────────────────┐
│  Registrations: 0/8                                      │
│                                                          │
│              👥                                         │
│                                                          │
│        No registrations yet                             │
│                                                          │
│  8 available spots remaining                            │
└─────────────────────────────────────────────────────────┘
```

### Empty Dropdowns
If any dropdown has no data (rare):
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="No instructors available" />
  </SelectTrigger>
  <SelectContent>
    <div className="p-4 text-center text-muted-foreground">
      No options available
    </div>
  </SelectContent>
</Select>
```

### Waitlist - Empty
Don't show "Waitlist (0)" section. Only show if count > 0.

---

## Responsive Design

### Breakpoints (Tailwind defaults)
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm to lg)
- **Desktop**: ≥ 1024px (lg+)

### Mobile (< 640px)
**Calendar View**:
- Switch from week view to **day view** (single day at a time)
- Show day navigation: [← Previous Day] [Today] [Next Day →]
- Stack time slots vertically
- Full-width class cards

**Class Cards**:
- Slightly larger tap targets (min 44×44px)
- Show abbreviated info (remove room name if space constrained)

**Navigation**:
- Burger menu for [+ Add Schedule] button
- Quick add [+] buttons remain visible

**Drag & Drop**:
- **Disable** drag & drop on mobile
- Use "Edit" button to change time/date instead

**Context Menu**:
- Long press (500ms) to show context menu
- Or show "..." button on each card

**Sheets/Modals**:
- Full-screen overlays (instead of side sheets)
- Bottom sheets for better thumb reach

### Tablet (640px - 1024px)
**Calendar View**:
- Show 3-4 days at a time (scrollable horizontally)
- Or keep week view with smaller cards

**Drag & Drop**:
- Keep enabled if device supports pointer events
- Otherwise disable

**Forms**:
- 2-column layouts where appropriate (e.g., Duration | Capacity)

### Desktop (≥ 1024px)
- Full week view as designed
- All features enabled
- Hover states for better UX

### Touch Interactions
Detect touch device:
```typescript
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
```

If touch device:
- Disable drag & drop
- Use long-press for context menu
- Larger tap targets

### RTL Support
For Arabic:
- Sheet opens from **left** instead of right
- Mirror all directional elements (arrows, →, etc.)
- Use logical properties: `margin-inline-start` instead of `margin-left`

```tsx
<Sheet side={locale === 'ar' ? 'left' : 'right'}>
```

---

## Implementation Checklist

### Phase 1: Calendar View ✓
- [ ] Set up Big Calendar component
- [ ] Fetch classes API integration
- [ ] Render class cards with all info
- [ ] Week navigation (Previous, Next, Today)
- [ ] Quick add [+] buttons
- [ ] Loading skeletons
- [ ] Empty state

### Phase 2: View Registrations ✓
- [ ] Modal UI
- [ ] Fetch class details API
- [ ] Display registrations list
- [ ] Display waitlist section
- [ ] Member profile links (new tab)
- [ ] Loading state
- [ ] Empty state

### Phase 3: Create Single Class ✓
- [ ] Sheet UI
- [ ] Form with all fields
- [ ] Date & time picker
- [ ] Fetch dropdowns (instructor, class type, room)
- [ ] Client-side validation
- [ ] Conflict checking
- [ ] API integration
- [ ] Error handling
- [ ] Success feedback

### Phase 4: Edit & Delete Class ✓
- [ ] Right-click context menu
- [ ] Edit sheet with pre-filled data
- [ ] Update API integration
- [ ] Capacity validation (min = booked_seats)
- [ ] Delete confirmation dialog
- [ ] Delete API integration
- [ ] Optimistic UI updates

### Phase 5: Drag & Drop ✓
- [ ] Enable drag on class cards
- [ ] Show valid drop zones
- [ ] Real-time conflict detection
- [ ] Visual feedback (red border, tooltip)
- [ ] Prevent invalid drops
- [ ] Update API call
- [ ] Optimistic UI + rollback
- [ ] Error handling

### Phase 6: Bulk Creation ✓
- [ ] Sheet UI with 3 steps
- [ ] Time slot grid component
- [ ] Grid interactions (click cell, row, column)
- [ ] Quick pattern buttons
- [ ] Conflict validation
- [ ] Repeat pattern options
- [ ] CSV generation logic
- [ ] Upload API integration
- [ ] Progress modal
- [ ] Partial failure handling

### Phase 7: Polish ✓
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] RTL support
- [ ] Touch device detection
- [ ] All error messages (EN + AR)
- [ ] All loading states
- [ ] All empty states
- [ ] Accessibility (ARIA, keyboard nav)
- [ ] Performance optimization

### Phase 8: Testing ✓
- [ ] Unit tests for utils (time conversion, CSV generation)
- [ ] Integration tests for API calls
- [ ] E2E tests with Playwright
  - [ ] Create single class
  - [ ] Create bulk classes
  - [ ] Edit class
  - [ ] Delete class
  - [ ] Drag & drop class
  - [ ] View registrations
  - [ ] Mobile responsive tests
  - [ ] Error scenarios

---

## Technical Notes

### Time Conversion Helper
```typescript
// UTC+3 to UTC (for API requests)
function toUTC(localTime: string, localDate: string): { time: string, date: string } {
  const datetime = new Date(`${localDate}T${localTime}:00+03:00`);
  return {
    time: datetime.toISOString().substring(11, 16), // HH:mm
    date: datetime.toISOString().substring(0, 10)   // YYYY-MM-DD
  };
}

// UTC to UTC+3 (for display)
function toLocal(utcTime: string): string {
  const datetime = new Date(`${utcTime}Z`);
  datetime.setHours(datetime.getHours() + 3);
  return datetime.toTimeString().substring(0, 5); // HH:mm
}
```

### CSV Generation Helper
```typescript
function generateClassesCSV(
  config: ClassConfig,
  timeSlots: TimeSlot[],
  repeatPattern: RepeatPattern
): Blob {
  const rows = [
    'class_type_id,instructor_id,room_id,date,time,capacity,duration'
  ];

  const dates = calculateDates(repeatPattern);

  for (const date of dates) {
    for (const slot of timeSlots) {
      const { time, date: utcDate } = toUTC(slot.time, date);
      rows.push(
        `${config.classTypeId},${config.instructorId},${config.roomId},${utcDate},${time},${config.capacity},${config.duration}`
      );
    }
  }

  return new Blob([rows.join('\n')], { type: 'text/csv' });
}
```

### Conflict Checker
```typescript
async function checkConflicts(
  instructorId: number,
  roomId: number,
  startTime: Date,
  duration: number,
  excludeClassId?: number
): Promise<Conflict[]> {
  // Fetch all classes for instructor and room on that date
  const classes = await fetchClassesForDate(startTime);

  const conflicts: Conflict[] = [];
  const endTime = new Date(startTime.getTime() + duration * 60000);

  for (const cls of classes) {
    if (cls.id === excludeClassId) continue;

    const clsStart = new Date(cls.schedule_time);
    const clsEnd = new Date(clsStart.getTime() + cls.duration_minutes * 60000);

    // Check overlap
    if (startTime < clsEnd && endTime > clsStart) {
      if (cls.instructor_id === instructorId) {
        conflicts.push({ type: 'instructor', class: cls });
      }
      if (cls.class_room_id === roomId) {
        conflicts.push({ type: 'room', class: cls });
      }
    }
  }

  return conflicts;
}
```

---

**End of Specification**

**Last Updated**: 2025-11-21
**Ready for Implementation**: ✅
