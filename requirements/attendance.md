## Attendance Management


We should have:
- Date filter (Toady's date by default) with arrows "<-" to go back in date and "->" to move forward.

### User Flows

#### Flow 01: View Daily Classes
1. User lands on page 
2. System loads classes for selected date (defaults to today's date)
3. **Endpoint**: `GET /admin/attendance/daily?date={yyyy-MM-dd}`
4. **Response**:
```json
{
  "success": true,
  "date": "2024-01-15",
  "total_classes": 5,
  "classes": [{
    "class": {
      "id": 1,
      "name": "Morning Reformer",
      "time": "2024-01-15T07:00:00Z",
      "instructor": "Jane Doe",
      "capacity": 8,
      "booking_count": 6
    },
    "attendance": {
      "records": [...],
      "stats": {
        "total": 6,
        "present": 4,
        "absent": 1,
        "late": 0,
        "not_recorded": 1
      }
    }
  }]
}
```

#### Flow 02: View Class Details and Bookings
1. User clicks "Manage Attendance" on a class card
2. System opens modal with class details
3. **Endpoint**: `GET /admin/attendance/classes/{classId}`
4. **Response**:
```json
{
  "success": true,
  "class": {
    "id": 1,
    "name": "Morning Reformer",
    "type": "Reformer",
    "instructor_name": "Jane Doe",
    "capacity": 8,
    "schedule_time": "2024-01-15T07:00:00Z",
    "duration_minutes": 50,
    "booked_seats": 6
  },
  "total_bookings": 6,
  "bookings": [{
    "booking_id": 100,
    "user_id": 50,
    "user_name": "John Smith",
    "phone_number": "+1234567890",
    "attendance_id": null,
    "check_in_time": null,
    "notes": null
  }]
}
```

#### Flow 03: Record Attendance (Check-in)
1. User clicks "Check-in" button for a specific member
2. System records attendance with current timestamp
3. **Endpoint**: `POST /admin/attendance/classes/{classId}/users/{userId}`
4. **Request Body**: None (empty POST)
5. **Response**:
```json
{
  "success": true,
  "record": {
    "id": 200,
    "booking_id": 100,
    "user_id": 50,
    "class_id": 1,
    "check_in_time": "2024-01-15T07:05:00Z",
    "recorded_by": 10,
    "created_at": "2024-01-15T07:05:00Z",
    "updated_at": "2024-01-15T07:05:00Z"
  }
}
```
6. UI updates to show member as "Present"

### Data Points Displayed

**Class List View**:
- Class name
- Time (formatted: "7:00 AM")
- Instructor name
- Booking count / Capacity (with red badge if full)
- Day of week and date in header

**Class Details Modal**:
- Class name
- Instructor name
- Schedule time and duration (e.g., "7:00 AM (50 min)")
- Booked seats / Capacity
- For each booking:
  - Member name
  - Phone number
  - Attendance status badge ("Attended" green / "-" gray)
  - Check-in button (if not checked in)

### Business Rules

1. Only shows classes for the selected date
2. Classes sorted by time (earliest first)
3. Attendance can be recorded multiple times (no duplicate prevention shown in code)
4. Check-in time is set to current server time
5. Check-in recorded by current admin (tracked in backend)