# Schedule Requirements - Gap Analysis

**Date**: 2025-11-21
**Reviewed Document**: requirements/schedule.md
**Status**: Pending Resolution

---

## Executive Summary

This document identifies missing specifications, ambiguities, and edge cases in the schedule management requirements that need clarification before implementation.

---

## 1. Missing or Unclear Requirements

### 1.1 Date Range View Endpoint Numbering
**Location**: Line 7
**Issue**: The endpoint list starts at "3. Response" but there's no "1." or "2."
**Missing**: Request details/parameters documentation for the GET endpoint
**Impact**: Medium - Implementation can proceed but documentation is incomplete
Just a mistake, ignore it.
---

### 1.2 Conflict Detection Logic
**Location**: Line 84
**Issue**: Mentions "red highlight" for conflicts during drag & drop but doesn't define what constitutes a conflict

**Questions Needing Answers**:
- Does it check for instructor double-booking?
- Does it check for room double-booking?
- Does it check for overlapping time slots?
- All of the above?
- Should it prevent the drop or just warn?

**Impact**: High - Core functionality behavior undefined
That's a great question. Few things constitutes a conflict:
1. Same instructor same time
2. Same room same time
either or both.
Load the data for that date in the background and check for conflicts.
---

### 1.3 Right-Click Context Menu Options
**Location**: Lines 93-96
**Current Spec**: Only shows "Edit Class" and "Cancel Class"

**Missing Options to Consider**:
- View registrations (currently only accessible via left-click)
- Duplicate class
- Manual attendance marking
- Quick capacity adjustment
- Print class roster

**Impact**: Medium - User experience and workflow efficiency

User can view registrations when she clicks on a class card. Others are fine.
---

### 1.4 Attendance Marking Flow
**Location**: Lines 152, 159, 178
**Issue**: Shows ✓ Attended checkmarks in the registrations modal but doesn't specify how admins mark attendance

**Questions Needing Answers**:
- How do admins mark attendance?
- Can they toggle it directly in the modal?
- Is there a separate attendance marking endpoint?
- Can they bulk mark all as attended?
- Can attendance be unmarked after marking?
- Time-based auto-marking (e.g., after class ends)?

**Impact**: High - Core feature completely unspecified
Don't worry about it. Attendnace is marked in another page.
---

### 1.5 Error Handling Strategy
**Location**: Throughout document
**Issue**: No error handling specifications for any flows

**Missing Specifications**:
- What happens if API calls fail?
- Validation error messages for form submissions
- Network error states and retry logic
- Optimistic UI rollback strategy if update fails
- Conflict resolution when drag & drop fails
- Bulk creation partial failure handling (e.g., 30/36 classes created)

**Impact**: High - Production readiness requirement
Please handle it. Show proper errors in both Arabic & English. Use shadcn/ui error handling uis
---

### 1.6 Empty States
**Location**: Throughout document
**Issue**: No specifications for empty/zero-data states

**Missing UI Specs**:
- What shows when no classes exist for a week?
- What shows in registration modal when no one has booked?
- Empty instructor/room/class type dropdowns?
- No available time slots in bulk creation?

**Impact**: Medium - User experience
Do proper hanlding of this please.
---

### 1.7 Time Slot Grid Validation (Bulk Creation)
**Location**: Lines 268-289
**Issue**: Shows checkbox grid for time selection but doesn't specify validation logic

**Questions Needing Answers**:
- What happens if you select overlapping times for same instructor?
Show an error.
- What happens if you select overlapping times for same room?
Show an error.
- Does it validate before submission or after?
Before please.
- How are conflicts displayed in the grid?
Maybe as footnotes?
- Can user override conflicts?
No.

**Impact**: High - Could create invalid schedules

---

### 1.8 Custom Dates Option (Bulk Creation)
**Location**: Line 298
**Issue**: Mentions "Custom dates (select specific dates)" but provides no UI specification

**Missing Specifications**:
- Calendar date picker interface?
- Multi-select dates?
- Date range selector?
- How does it interact with the time slot grid?
- Example: Select March 15, 22, 29 + Mon 9am checkbox = 3 classes or 1 class?

**Impact**: High - Feature completely unspecified
That's an excellent question. Just ignore the custom date range. discard it.
---

### 1.9 Timezone Handling
**Location**: Line 335
**Issue**: Mentions UTC+3 conversion but lacks comprehensive timezone strategy

**Questions Needing Answers**:
- Is timezone hardcoded to UTC+3 or configurable?
Hardcoded
- How is timezone determined (user profile, studio location, browser)?
No.
- What about daylight saving time transitions?
No such thing.
- Are all times stored in UTC in the database?
Yes.
- How are times displayed to users in different timezones (if multi-location)?
We're now in Saudi only. so it's okay.
- What happens to scheduled classes during DST transitions?

**Impact**: Medium-High - Data integrity and user confusion risk

---

### 1.10 Responsive Behavior
**Location**: Throughout document
**Issue**: No mobile/tablet specifications

**Missing Specifications**:
- How does the calendar look on mobile (< 768px)?
- How does it look on tablet (768px - 1024px)?
- Does the week view compress, scroll horizontally, or switch to day view?
- Touch interactions for drag & drop (or disable on mobile)?
- Context menu on touch devices (long press)?
- Time slot grid interaction on mobile?

**Impact**: High - Mobile usability
Please handle it properly!
---

### 1.11 Loading States
**Location**: Throughout document
**Issue**: No loading state specifications

**Missing Specifications**:
- Skeleton loaders for calendar grid?
- Loading indicators during drag & drop save?
- Disabled state for buttons during submission?
- Loading state for registration modal?
- Dropdown loading states while fetching instructors/rooms?
- Progress indicator for bulk creation (e.g., "Creating 36 classes...")?

**Impact**: Medium - User experience and perceived performance
Use skeleton and spinenrs, whatever fits the situation.
---

### 1.12 Member Profile Link
**Location**: Lines 153, 160, 166, 172, 179
**Issue**: Shows "→ View Member Profile" but doesn't specify navigation behavior

**Questions Needing Answers**:
- What route does this navigate to?
To `/memebers/{id}`
- Does it open in modal, drawer, or new page?
Open a new tab
- Does it close the current registration modal?
No.
- Is this a link or button?
Button 
- Does it open in new tab with Cmd/Ctrl+Click?
Yes

**Impact**: Low - Implementation detail but affects UX

---

### 1.13 Capacity Edge Cases
**Location**: Lines 109, 212, 258
**Issue**: Capacity field shown but edge cases undefined

**Questions Needing Answers**:
- Can capacity be reduced below current number of bookings?
No.
- What happens to overflow bookings if capacity reduced?
Don't worry about it.
- Waitlist handling (or out of scope)?
Yes please show it!
- Can capacity be 0?
No.
- Maximum capacity limit?
100
- Warning when increasing capacity significantly?
No.

**Impact**: Medium - Business logic clarity

---

### 1.14 Edit Endpoint Semantics
**Location**: Lines 119-122
**Issue**: Comment says "Only send values that have changed" but endpoint is POST, not PATCH

**Questions Needing Answers**:
- Is this truly a partial update (PATCH semantic)?
- Or full replacement (POST/PUT semantic)?
- What happens to fields not included in request?
- Backend validation for partial vs full updates?
- If only time changes, do we send all other fields or just time?

**Impact**: Medium - API contract clarity
It's a POST but it's okay. 
---

### 1.15 Preview on Calendar Button
**Location**: Line 304
**Issue**: Shows "[Preview on Calendar]" button but no specification

**Questions Needing Answers**:
- Does it close the sheet and show a preview overlay on the calendar?
- Does it open a separate preview modal?
- Can user edit from preview or must return to form?
- Is preview read-only?

**Impact**: Medium - Feature completely unspecified
Discard this button. Ignore it.
---

### 1.16 CSV Generation Details
**Location**: Lines 317-322
**Issue**: Shows CSV example but missing details

**Questions Needing Answers**:
- Are the CSV values IDs or names (shows "Reformer" and "Farah" - are these names or resolved from IDs)?
- Time format in CSV (shows "04:00" - is this HH:mm)?
- Date format in CSV (shows "2024-01-15" - is this ISO date)?
- How are errors in CSV generation handled?
- File naming convention?

**Impact**: Low-Medium - Implementation detail

---

### 1.17 Quick Patterns Buttons
**Location**: Line 267
**Issue**: Shows pattern buttons like "[Weekday Mornings]" but no definition

**Questions Needing Answers**:
- What exactly does "Weekday Mornings" select? (Mon-Fri, 6am-11am?)
- What does "Mon/Wed/Fri" select? (All times on those days?)
- What does "Weekend Afternoons" select?
- Are these configurable or hardcoded?
- Can users save custom patterns?

**Impact**: Low - Nice-to-have feature clarity

---

### 1.18 Calendar Auto-Refresh
**Location**: Line 338
**Issue**: States "calendar auto-refreshes to show new classes" but no detail

**Questions Needing Answers**:
- Does it refetch from server or use optimistic UI?
- Does it maintain scroll position?
- Does it maintain current week view or jump to created class week?
- Smooth transition or hard refresh?
- What if refresh fails?

**Impact**: Low-Medium - User experience

---

### 1.19 Drag & Drop Update Payload
**Location**: Lines 86-89
**Issue**: Shows endpoint but unclear if time and date are the only changeable fields via drag & drop

**Questions Needing Answers**:
- Can you drag to a different day column to change date?
- Can you drag to a different time row to change time?
- Are both always sent or just what changed?
- What about dragging to a different week (if multi-week view)?

**Impact**: Medium - Feature behavior clarity

---

### 1.20 Class Card Visual Design
**Location**: Lines 37-75 (ASCII mockup)
**Issue**: Shows card structure but missing visual specifications

**Missing Specifications**:
- Color coding by class type?
- Color coding by instructor?
- Visual indicator for past classes?
- Visual indicator for cancelled classes?
- Hover states?
- Selected/active states?
- Accessibility: ARIA labels, keyboard navigation?

**Impact**: Medium - Design implementation details

---

## 2. Recommendations

### Priority 1 (Must Have Before Implementation)
1. ✅ **Define conflict detection rules** with specific examples
2. ✅ **Specify attendance marking flow** completely (endpoints, UI, permissions)
3. ✅ **Complete the custom dates UI spec** for bulk creation
4. ✅ **Clarify partial update semantics** for edit endpoint (PATCH vs POST)
5. ✅ **Define time slot grid validation** logic for bulk creation
6. ✅ **Specify error handling** for all API interactions

### Priority 2 (Should Have)
7. ✅ **Add loading state requirements** for all async operations
8. ✅ **Define empty states** for all views
9. ✅ **Specify responsive breakpoints** and mobile behavior
10. ✅ **Document timezone configuration** approach
11. ✅ **Add member profile navigation** details
12. ✅ **Clarify capacity edge cases** and validation rules

### Priority 3 (Nice to Have)
13. ✅ **Expand right-click context menu** options
14. ✅ **Define quick pattern buttons** behavior
15. ✅ **Specify preview calendar** functionality
16. ✅ **Add visual design specifications** for class cards
17. ✅ **Document CSV generation** details
18. ✅ **Clarify calendar auto-refresh** behavior

---

## 3. Suggested Next Steps

1. **Schedule Review Meeting**: Discuss this document with product owner/stakeholders
2. **Prioritize Gaps**: Determine which gaps are blockers vs. can be decided during implementation
3. **Update Requirements**: Amend schedule.md with decisions for Priority 1 items at minimum
4. **Create Follow-up Tasks**: For any gaps that need separate design/research
5. **Get Sign-off**: Ensure all stakeholders agree on core behaviors before implementation begins

---

## 4. Risk Assessment

| Risk Area | Severity | Mitigation |
|-----------|----------|------------|
| Undefined conflict detection | High | Could create invalid schedules, double-bookings |
| Missing attendance flow | High | Core feature unusable |
| No error handling spec | High | Poor user experience, data inconsistencies |
| Unclear timezone handling | Medium | User confusion, scheduling errors |
| Missing mobile specs | Medium | Poor mobile experience |
| Unspecified loading states | Low | Perceived performance issues |

---

**Document Owner**: Claude (AI Assistant)
**Reviewers Needed**: Product Owner, Backend Developer, UX Designer
**Last Updated**: 2025-11-21
