# Settings Page

The setting page will only have one tab for now

## Admin Users Tab

#### Flow 01: View All Admin Users
1. **Endpoint**: `GET /admin/auth/list`
2. **Response**:
```json
{
  "success": true,
  "admins": [{
    "id": 1,
    "email": "admin@pilatopia.studio",
    "name": "Admin User",
    "role": "super_admin",
    "created_at": "2024-01-01T10:00:00Z",
    "last_login": "2024-01-15T08:30:00Z"
  }]
}
```

#### Flow 02: Create Admin User
1. User clicks "Create Admin" button
2. Modal opens with form
3. User fills in:
   - Full name (required)
   - Email (required, must be valid email format)
   - Password (required, minimum 6 characters)
   - Role (dropdown: staff or super_admin)
4. User clicks "Create Admin"
5. **Endpoint**: `POST /admin/auth`
6. **Request Body**:
```json
{
  "email": "newadmin@pilatopia.studio",
  "password": "securepass123",
  "name": "New Admin",
  "role": "staff"
}
```
7. **Response**:
```json
{
  "success": true,
  "admin": {
    "id": 2,
    "email": "newadmin@pilatopia.studio",
    "name": "New Admin",
    "role": "staff",
    "created_at": "2024-01-15T10:00:00Z",
    "last_login": null
  },
  "message": "Admin created successfully"
}
```
8. Success: Modal closes, admin list refreshes

### Data Points Displayed

**Admin Users Table**:
- Name
- Email
- Role badge (purple "Super Admin" or gray "Staff")
- Created at (formatted: "Jan 1, 2024, 10:00 AM")
- Last login (formatted date or "Never")

**Create Admin Form**:
- Full name input
- Email input (type=email)
- Password input (type=password, minLength=6)
- Role selector (staff or super_admin)

### Business Rules
1. SuperAdmin role required to access page
2. Password minimum: 6 characters
3. All fields required (name, email, password, role)
4. Email must be valid format
5. Role options: "staff" (basic access) or "super_admin" (full access)
6. Last login shows "Never" if null
7. Created at always populated
8. Client-side validation before API call