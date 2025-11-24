# Member Page



## Sections

### Member Profile

#### Flow 01: View Member Profile
1. **Endpoint**: `GET /admin/members/{id}`
2. **Response**:
```json
{
  "id": "50",
  "name": "John Smith",
  "phoneNumber": "+1234567890",
  "birthDate": "1990-05-15T00:00:00Z",
  "joiningDate": "2025-11-18 15:23:27.673781",
  "membershipStatus": "active" | "expired" | "no membership",
  "points": 25
}
```

#### Business Rules
- Birth date displayed in local timezone


### Memberships
#### Flow 02: View Memberships
1. **Endpoint**: `GET /admin/members/{id}/transactions`
2. **Response**:
```json
{
  "transactions": [{
    "id": "1001",
    "startDate": "2024-01-01T10:00:00Z",
    "classCount": 10,
    "pricePaid": 250.00,
    "usedBalance": 3,
    "remainingBalance": 7,
    "expiryDate": "2024-04-01T23:59:59Z",
    "membershipId": 500
  }]
}
```
#### UI
Title: Memberships
Table with columns:
- Plan Name
- Start date
- Usage: usedBalance/classCount
- Remaining Classes: remainingBalance
- Price Paid:
- Status: 
  - If not started yet: Starts in xx days (or Today)
  - else If all balance used: Expired.
  - else if not expired yet: Expries in xx days, or "Expires Today".
  - else: "Expired"
- in case memebership is active (started and not expired and has balance > 0) then we should have three dots button for actions on this membership:
  - Extend [check flow details](/requirements/memebership-extension.md)
  - Add Class [check flow details](/requirements/memebership-add-class.md)
Button "Add Membership" that opens a [membership dialog](/requirements/add-membership.md)


### Bookings

#### Flow 01: View Bookings
1. **Endpoint**: `GET /admin/members/{id}/bookings?page=1&limit=10`
2. **Response**:
```json
{
  "bookings": [{
    "id": "2001",
    "class_name": "Morning Reformer",
    "schedule_time": "2024-01-20T07:00:00Z",
    "duration_minutes": 50,
    "instructor_name": "Jane Doe",
    "class_type": "Reformer",
    "booked_seats": 5,
    "capacity": 8
  }],
  "pagination": {
    "current_page": 1,
    "total_pages": 2,
    "total_items": 15,
    "items_per_page": 10
  }
}
```

#### Flow 02: Create Booking for Member
1. User clicks "Create a Booking" button
2. Selects date in date picker (defaults to today)
3. System loads available classes for that date
4. **Endpoint**: `GET /admin/schedules/classes/by-date-range?startDate={yyyy-MM-dd}&endDate={yyyy-MM-dd}`
5. User selects class from dropdown
6. User clicks "Create Booking"
7. **Endpoint**: `POST /admin/members/{id}/bookings`
8. **Request Body**: `{ "classId": 123 }`
9. Success: Refreshes bookings list

#### Flow 03: Cancel Booking
1. User clicks "Cancel" button on a booking
2. **Endpoint**: `DELETE /admin/members/{id}/bookings/{bookingId}`
3. Success: Refreshes bookings list
4. **Error Cases**:
   - 404: "Booking not found"
   - 400: "Cannot cancel a class that has already started"


#### UI
Title: Bookings
Table with the following columns:
- Class Name
- Class Room 
- Date: Formats: "Today, 05:00 PM " or "November 1st, 05:00 PM (in x days)" or "Tomorrow, 10:00 AM".
- Instructor
- 3 Dots button:
    - Cancel