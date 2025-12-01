# Members Page Redesign

**Status**: Todo
**Requirement Source**: requirements/design-system.md
**Estimated Complexity**: High

## Objective

Redesign the Members page to be a **Relationship Management Hub** with smart segments, rich member cards, quick actions, and a complete Add Member flow. Transform members from "rows in a database" to "relationships to nurture."

## Design Philosophy

- **Home = Daily Operations** (today's classes, check-ins)
- **Members = Relationship Management** (member lifecycle, proactive outreach)
- Cross-linked: clicking a member anywhere → Members profile

---

## Design

### Members List Page

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Members                                            [🔍 Search]  [+ Add New] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TOTAL        ACTIVE         EXPIRING SOON    NEED ATTENTION    NEW         │
│  248          183            12               23                8            │
│  members      memberships    within 7 days    inactive 14+ days this month  │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [All]  [Expiring Soon (12)]  [Need Attention (23)]  [New (8)]  [No Membership]│
│                                                                              │
│  Filter: [Status ▾]  [Last Visit ▾]            Sort: [Recent ▾]             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  👤 Fatima Al-Hassan                              ⭐ VIP · 6 months  │   │
│  │     054-123-4567 📞                                                  │   │
│  │                                                                      │   │
│  │     ████████░░ 8/10 classes    Last visit: Today                    │   │
│  │     Expires: Dec 2 (7 days) ⚠️                                       │   │
│  │                                                                      │   │
│  │     [📅 Book Class]  [🔄 Renew]  [View Profile →]                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ... more member cards ...                                                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Member Card Information

Each card displays:
- Name (link to profile)
- Phone number (clickable tel: link)
- Membership progress bar (X/Y classes)
- Last visit date
- Expiry date with warning if soon
- Badge: VIP / New / Inactive / Expiring
- Quick action buttons

### Smart Segments

| Segment | Filter Logic | Purpose |
|---------|--------------|---------|
| All Members | No filter | Full list |
| Expiring Soon | Membership expires within 7 days | Renewal outreach |
| Need Attention | No visit in 14+ days | Re-engagement |
| New | Joined in last 30 days | Onboarding care |
| No Membership | No active membership | Sales opportunity |

### Add Member Flow (Multi-step)

```
Step 1: Basic Info       → Name, Phone, Email (optional), Birth Date (optional)
Step 2: Add Membership?  → Optional - select plan, payment (reuse existing wizard)
Step 3: Book First Class?→ Optional - select class from upcoming schedule
Step 4: Done             → Success + quick actions
```

### Member Profile Page (Enhanced)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Back                                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐  Fatima Al-Hassan                           ⭐ VIP Member   │
│  │     👤     │  054-123-4567 📞  fatima@email.com ✉️                        │
│  └────────────┘  Member since: June 2024 (6 months) · Birthday: Mar 22     │
│                                                                              │
│                  [📅 Book Class]  [🎁 Add Membership]  [✏️ Edit]            │
│                                                                              │
├─────────────────────────────────┬────────────────────────────────────────────┤
│  CURRENT MEMBERSHIP             │  ACTIVITY SUMMARY                          │
│                                 │                                            │
│  10-Class Package               │  This Month    Last Month    Total         │
│  ████████░░ 8/10 remaining     │  12 visits     10 visits     89 visits     │
│                                 │                                            │
│  Expires: Dec 2 (7 days) ⚠️     │  Favorite: Morning Reformer with Sarah    │
│                                 │  Avg: 2.8 visits/week                      │
│  [🔄 Renew]  [+ Add Classes]   │                                            │
│                                 │                                            │
├─────────────────────────────────┴────────────────────────────────────────────┤
│                                                                              │
│  [Upcoming Bookings]  [Past Visits]  [Memberships]  [Notes]                 │
│                                                                              │
│  UPCOMING BOOKINGS (2)                                       [+ Book Class] │
│  ────────────────────────────────────────────────────────────────────────── │
│  Tomorrow, 9:00 AM · Morning Reformer · Sarah · Studio A          [Cancel]  │
│  Thursday, 10:00 AM · Advanced Mat · Maria · Studio B             [Cancel]  │
│                                                                              │
│  PAST VISITS                                                     [View All] │
│  ────────────────────────────────────────────────────────────────────────── │
│  Today        9:00 AM   Morning Reformer   Sarah   ✓ Attended               │
│  Nov 23       9:00 AM   Morning Reformer   Sarah   ✓ Attended               │
│  Nov 17      10:00 AM   Advanced Mat       Maria   ✗ No-show                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Backend Dependencies

### Likely Need New/Enhanced Endpoints

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `GET /admin/members` with filters | Filter by status, last_visit, membership | Check if exists |
| `GET /admin/members/stats` | Aggregate counts for segments | Likely new |
| `POST /admin/members` | Create new member | Check if exists |
| `PUT /admin/members/{id}` | Update member info | Check if exists |
| `GET /admin/members/{id}/activity` | Activity summary stats | Likely new |

### Request to Backend (if needed)

**Enhanced Members List Endpoint:**
```
GET /admin/members?status={active|expiring|inactive|no_membership}&sort={recent|name|expiry}
```

**Members Stats Endpoint:**
```
GET /admin/members/stats

Response:
{
  "total": 248,
  "active_memberships": 183,
  "expiring_soon": 12,      // within 7 days
  "inactive": 23,           // no visit 14+ days
  "new_this_month": 8,
  "no_membership": 34
}
```

**Member Activity Summary:**
```
GET /admin/members/{id}/activity

Response:
{
  "visits_this_month": 12,
  "visits_last_month": 10,
  "total_visits": 89,
  "favorite_class": "Morning Reformer",
  "favorite_instructor": "Sarah",
  "avg_visits_per_week": 2.8,
  "last_visit": "2024-11-25T09:00:00Z"
}
```

---

## Acceptance Criteria

### Members List Page
- [ ] Stats bar showing segment counts
- [ ] Segment tabs (All, Expiring, Need Attention, New, No Membership)
- [ ] Rich member cards with progress bars and badges
- [ ] Quick actions on cards (Book, Renew, View Profile)
- [ ] Clickable phone numbers (tel: links)
- [ ] Search by name/phone
- [ ] Filter by status, last visit
- [ ] Sort options (recent, name, expiry)
- [ ] Pagination

### Add Member Flow
- [ ] Multi-step wizard dialog
- [ ] Step 1: Basic info (name, phone required)
- [ ] Step 2: Optional membership purchase
- [ ] Step 3: Optional first class booking
- [ ] Step 4: Success confirmation
- [ ] Skip options at each step

### Member Profile Page
- [ ] Enhanced header with contact actions
- [ ] Current membership card with progress
- [ ] Activity summary stats
- [ ] Tabbed content (Bookings, Visits, Memberships, Notes)
- [ ] Quick actions (Book, Add Membership, Edit)
- [ ] Upcoming bookings with cancel
- [ ] Past visits with attendance status

### General
- [ ] Follows design system (minimal, no inline borders)
- [ ] RTL support for Arabic
- [ ] Loading and empty states
- [ ] Responsive design
- [ ] Member names link to profile from anywhere

---

## Components to Create

```
components/members/
├── MembersPage.tsx              # Main page container
├── MembersStatsBar.tsx          # Segment counts
├── MembersSegmentTabs.tsx       # Filter tabs
├── MembersFilters.tsx           # Status/sort dropdowns
├── MemberCard.tsx               # Rich member card
├── MemberBadge.tsx              # VIP/New/Inactive/Expiring badge
├── MembershipProgressBar.tsx    # Visual progress X/Y
├── AddMemberWizard.tsx          # Multi-step add flow
├── MemberProfileHeader.tsx      # Profile top section
├── MembershipCard.tsx           # Current membership display
├── ActivitySummary.tsx          # Visit stats
├── MemberTabs.tsx               # Bookings/Visits/Memberships/Notes
└── PastVisitsList.tsx           # Attendance history
```

---

## Files to Modify

| File | Action |
|------|--------|
| `app/[locale]/members/page.tsx` | Complete redesign |
| `app/[locale]/members/[id]/page.tsx` | Enhance profile |
| `components/member/*` | Refactor/replace existing |
| `lib/members/types.ts` | Add new types (create if needed) |
| `lib/members/api.ts` | Add new API functions |
| `lib/members/hooks.ts` | Add React Query hooks |

---

## Implementation Order

1. **Phase 1: API Layer**
   - Check existing endpoints
   - Request new endpoints if needed
   - Add types and API functions

2. **Phase 2: Members List Redesign**
   - Stats bar
   - Segment tabs
   - Member cards
   - Filters and search

3. **Phase 3: Add Member Flow**
   - Multi-step wizard
   - Integration with existing membership wizard
   - Class booking step

4. **Phase 4: Profile Enhancement**
   - Header redesign
   - Activity summary
   - Tabbed content
   - Past visits list

5. **Phase 5: Polish**
   - Loading states
   - Empty states
   - RTL support
   - Responsive design

---

## Connection to Home Dashboard

Add "Member Alerts" widget to Home Dashboard (update home task):

```
┌─────────────────────────────────┐
│  MEMBER ALERTS                  │
│  ───────────────────────────── │
│  ⚠️ 12 expiring soon        →  │  → Links to Members (Expiring)
│  😴 23 inactive members     →  │  → Links to Members (Inactive)
│  ✨ 8 new this month        →  │  → Links to Members (New)
└─────────────────────────────────┘
```

---

## Testing Checklist

- [ ] UI/UX tested in browser
- [ ] All segments filter correctly
- [ ] Add member flow completes successfully
- [ ] Member profile shows correct data
- [ ] Quick actions work (book, renew, cancel)
- [ ] Phone links open dialer
- [ ] Responsive design verified
- [ ] RTL layout works
- [ ] Error states handled
- [ ] Loading states smooth
