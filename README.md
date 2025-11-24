# Pilatopia Admin Console

A comprehensive admin dashboard for managing a Pilates studio built with Next.js 16, TypeScript, and shadcn/ui.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Access the application at http://localhost:3000

## 🔑 Test Credentials

- **Email**: khalid@pilatopia.studio
- **Password**: Admin@123

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Internationalization**: next-intl
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Icons**: Lucide React

## 📁 Project Structure

```
PilatopiaConsole/
├── app/
│   └── [locale]/           # Internationalized routes
│       ├── layout.tsx      # Root layout with i18n
│       ├── page.tsx        # Home/Dashboard page
│       ├── login/          # Authentication
│       ├── members/        # Member management
│       │   ├── page.tsx    # Members list
│       │   └── [id]/       # Member details
│       ├── schedule/       # Schedule management
│       └── settings/       # Settings page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── member/             # Member-specific components
│   ├── AppSidebar.tsx      # Navigation sidebar
│   ├── DashboardLayout.tsx # Protected layout wrapper
│   ├── GlobalSearch.tsx    # Command+K search
│   ├── DailyAttendance.tsx # Attendance management
│   └── ClassDetailsModal.tsx
├── hooks/
│   └── useAuth.tsx         # Authentication hook
├── lib/
│   ├── axios.ts            # HTTP client with interceptors
│   ├── auth.ts             # Auth utilities
│   └── utils.ts            # General utilities
├── i18n/
│   ├── routing.ts          # i18n routing config
│   └── request.ts          # Request config
└── messages/
    ├── ar.json             # Arabic translations
    └── en.json             # English translations
```

## ✨ Features Implemented

### 🔐 Authentication System
- JWT token-based authentication
- Automatic token injection via Axios interceptors
- Auto-logout on 401 responses
- Protected routes with redirect
- Login page with form validation
- **API Endpoint**: `POST /admin/auth/login`

### 🌍 Internationalization (i18n)
- **Arabic (RTL)** - Default language
- **English (LTR)** - Secondary language
- Automatic locale routing (`/ar`, `/en`)
- Language switcher in sidebar
- RTL/LTR layout support
- Translation files for all UI text

### 🏠 Home Page / Dashboard
**Features**:
- Global search (⌘K / Ctrl+K)
- Daily attendance management
- Date navigation (Previous/Next/Today)
- Class cards with booking info
- Attendance statistics
- Check-in functionality

**Components**:
- `GlobalSearch` - Command palette for member search
- `DailyAttendance` - Daily class view
- `ClassDetailsModal` - Attendance management

**API Endpoints**:
- `GET /admin/members/search?q={query}&limit=10`
- `GET /admin/attendance/daily?date={yyyy-MM-dd}`
- `GET /admin/attendance/classes/{id}`
- `POST /admin/attendance/classes/{classId}/users/{userId}`

### 👥 Members Management

#### Members List Page
**Features**:
- Paginated member list (20 per page)
- Search by name or phone
- Click row to view details
- Loading states
- Empty states

**API Endpoint**: `GET /admin/members?page={page}&limit=20&search={query}`

#### Member Detail Page
**Features**:
- Profile overview with personal info
- Loyalty points display
- Tabbed interface (Overview, Memberships, Bookings)
- Status badges (Active/Expired/No Membership)
- Back navigation

**Tabs**:
1. **Overview** - Personal information and loyalty points
2. **Memberships** - Membership history and management (placeholder)
3. **Bookings** - Booking history and creation (placeholder)

**API Endpoint**: `GET /admin/members/{id}`

### 📅 Schedule Page
- Placeholder implementation
- Ready for weekly/monthly view

### ⚙️ Settings Page
- Placeholder implementation
- Ready for configuration options

### 🎨 UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Collapsible sidebar navigation
- Dark mode support (via shadcn/ui)
- Loading states and skeletons
- Toast notifications
- Modal dialogs
- Dropdown menus
- Keyboard shortcuts (⌘K for search)
- Accessible components

## 🔌 API Integration

### Base Configuration
- **Base URL**: `https://api.pilatopia.studio/`
- **Headers**: Auto-injected `Authorization: Bearer {token}`
- **Error Handling**:
  - 401: Auto-logout and redirect
  - 404: Toast notification
  - 500: Server error notification
  - Network errors: Connection error notification

### Available Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/auth/login` | POST | User login |
| `/admin/members` | GET | List members (paginated) |
| `/admin/members/{id}` | GET | Get member details |
| `/admin/members/search` | GET | Search members |
| `/admin/attendance/daily` | GET | Daily classes |
| `/admin/attendance/classes/{id}` | GET | Class details & bookings |
| `/admin/attendance/classes/{classId}/users/{userId}` | POST | Check-in member |

## 🎯 shadcn/ui Components Used

- Button
- Input
- Label
- Card
- Badge
- Dialog
- Command
- Sidebar
- Sheet
- Separator
- Skeleton
- Tooltip
- Table
- Tabs
- Dropdown Menu

## 🌐 Internationalization

### Supported Languages
- Arabic (ar) - RTL, Default
- English (en) - LTR

### Translation Files
Located in `/messages/`:
- `ar.json` - Arabic translations
- `en.json` - English translations

### Adding Translations
1. Add key-value pairs to both language files
2. Use `useTranslations('namespace')` hook in components
3. Access translations with `t('key')`

Example:
```tsx
const t = useTranslations('Navigation');
<span>{t('home')}</span>
```

## 🔒 Authentication Flow

1. User enters credentials on `/login`
2. `POST /admin/auth/login` with email and password
3. Store JWT token and admin object in localStorage
4. Redirect to dashboard
5. All subsequent API calls include `Authorization: Bearer {token}`
6. On 401 response, clear localStorage and redirect to login

## 📊 Data Flow

### Attendance Check-in Flow
1. View daily classes
2. Click "Manage Attendance" on a class
3. Modal shows all bookings
4. Click "Check-in" for a member
5. `POST /admin/attendance/classes/{classId}/users/{userId}`
6. UI updates to show "Attended" badge
7. Parent view refreshes to show updated stats

### Member Search Flow (⌘K)
1. Press Command+K (or Ctrl+K)
2. Enter search query (min 2 characters)
3. Debounced API call after 300ms
4. Results displayed in command palette
5. Click result to navigate to member detail page

## 🚧 Planned Features

### Memberships Management
- Add new membership
- Extend membership expiry
- Add classes to membership
- View membership history
- Track usage and balance

### Bookings Management
- Create booking for member
- Cancel booking
- View booking history
- Pagination for bookings

### Schedule Management
- Weekly/monthly view
- Add/edit classes
- Manage instructors
- Room allocation

### Settings
- Admin user management
- Studio configuration
- Notification preferences
- Integration settings

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Navigate between pages using sidebar
- [ ] Switch language (Arabic ↔ English)
- [ ] Search members (⌘K)
- [ ] View daily attendance
- [ ] Navigate between dates
- [ ] Open class details modal
- [ ] Check-in a member
- [ ] View members list
- [ ] Search members
- [ ] Paginate through members
- [ ] View member details
- [ ] Switch between member tabs
- [ ] Logout

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

## 📝 Development Guidelines

### Code Style
- Use functional components
- TypeScript for type safety
- Tailwind utility classes
- Follow shadcn/ui patterns
- Use `'use client'` directive only when needed

### File Naming
- Components: PascalCase (e.g., `MemberOverview.tsx`)
- Utils/libs: camelCase (e.g., `auth.ts`)
- Pages: lowercase (e.g., `page.tsx`)

### Component Structure
```tsx
'use client'; // Only if needed

import { ... } from '...';

interface Props {
  // Props type definition
}

export function ComponentName({ props }: Props) {
  // Component logic
  return (
    // JSX
  );
}
```

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear .next cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run build again
npm run build
```

### Styles Not Loading
- Ensure `globals.css` is imported in layout
- Check Tailwind config
- Verify PostCSS config
- Restart dev server

### API Errors
- Check network tab in browser dev tools
- Verify API base URL in `lib/axios.ts`
- Check token in localStorage
- Verify CORS settings on API

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app)

## 👨‍💻 Development Team

Built with Claude Code by Anthropic

## 📄 License

ISC
