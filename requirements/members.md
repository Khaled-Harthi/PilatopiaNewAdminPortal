# Memberships

A page that lists members and navigates to member details page.

#### Flow 01: View Members List
1. Page loads with default pagination (page 1, 20 items per page)
2. **Endpoint**: `GET /admin/members?page=1&limit=20&search=`
3. **Response**:
```json
{
  "members": [{
    "id": "50",
    "name": "John Smith",
    "phoneNumber": "+1234567890",
    "joiningDate": "2025-11-18 15:23:27.673781",
  }],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 98,
    "items_per_page": 20
  }
}
```

#### Flow 02: Search Members
1. User enters name or phone in search box
2. User clicks "Search" button
3. System resets to page 1 and searches
4. **Endpoint**: `GET /admin/members?page=1&limit=20&search={query}`
5. Returns filtered members list
6. We can use Command + K as keyboard shortcut to make a search.

#### Flow 03: Clear Search
1. User clicks "Clear" button
2. Search input cleared
3. Resets to page 1 with no search filter

#### Flow 04: Navigate to Member Details
1. User clicks on table row.
2. Navigates to [Member details page](/requirements/member-page.md).

### Data Points Displayed

**Members Table**:
- Member name
- Phone number
- Joining Date
- Actions button

**Pagination Controls**:
- Current page / Total pages
- Previous/Next buttons (disabled at boundaries)

### Business Rules

1. Search query must match name OR phone number
2. Pagination: 20 members per page
3. Search resets pagination to page 1
4. No member data shown while loading (skeleton display)
