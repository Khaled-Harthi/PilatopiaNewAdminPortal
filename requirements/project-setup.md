
# Requirements

## Project Scope

We must have a drawer menu with the following pages:
1. [Home](/requirements/home-page.md)
2. [Members](/requirements/members.md)
3. [Schedule](/requirements/schedule.md)
4. [Settings](/requirements/settings.md)
5. Admin name, role and logout button (check [Authentication section](#authentication)).
We also need to create a login page (check [Authentication section](#authentication))

## Authentication

**Implementation**: JWT token-based authentication stored in localStorage

**Login Flow**:
- **Endpoint**: `POST /admin/auth/login`
- **Request Body**: `{ email: string, password: string }`
- **Response**: `{ token: string, admin: { id: number, name: string, email: string, role: 'super_admin' | 'staff' } }`
- **Storage**: Token and admin object stored in localStorage
- **Token Usage**: Automatically attached to all requests via axios interceptor as `Authorization: Bearer {token}`

**Logout Behavior**:
- 401 responses trigger automatic logout and redirect to /login
- Clears localStorage and redirects to login page

**Role-Based Access**:
- `super_admin`: Full access to all features
- `staff`: Limited access (no schedules, promo codes, affiliates, loyalty rules, badges, redemptions, admin users)

## API Configuration

**Base URL**: `https://api.pilatopia.studio/`

**Global Headers**:
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (auto-injected)

**Error Handling**:
- 401: Auto-logout and redirect to login
- 404: Toast notification "Resource not found"
- 500: Toast notification "Server error. Please try again later."
- Network errors: Toast notification "Network error. Please check your connection."

## Timezone Management

**Approach**: All dates stored in UTC on backend, converted to local time for display

**Utility Functions** (in `/src/lib/utils.ts`):
- `toUTC(date)`: Converts local Date to UTC ISO string for API requests
- `fromUTC(utcString)`: Parses UTC ISO string to local Date object
- `formatLocalDate(utcString)`: Formats UTC date to readable local date string
- `formatLocalDateTime(utcString)`: Formats UTC datetime to readable local datetime string

## Internationalization (i18n) - CRITICAL REQUIREMENT

### Languages
- **Arabic (ar)**: Default language, RTL
- **English (en)**: Secondary language, LTR

### Requirements
- Arabic MUST be the default language on first visit
- Language preference stored in localStorage
- Language switcher in drawer menu (simple picker/toggle)
- Full RTL support for Arabic (layout, components, animations)
- All text content must be translatable
- Date/time formatting locale-aware
- Number formatting (Arabic vs Western numerals)
