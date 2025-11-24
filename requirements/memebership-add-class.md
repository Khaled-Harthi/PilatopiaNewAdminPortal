# Adjust Balance (Add/Remove Classes)
**Required Endpoint:** `POST /admin/balance/memberships/{membershipId}/adjust`

This endpoint allows admins to manually add or remove classes from a member's balance. This is useful for compensating members for cancelled classes or correcting errors.

**Request:**
```json
{
  "adjustment": 5,
  "reason": "Compensation for cancelled class"
}
```

For negative adjustments:
```json
{
  "adjustment": -3,
  "reason": "Admin correction due to booking error"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Membership balance adjusted by 5 classes",
  "membership": {
    "id": 123,
    "user_id": 456,
    "available_classes": 15,
    "expires_at": "2025-07-15T10:00:00.000Z",
    "created_at": "2025-01-10T08:00:00.000Z",
    "updated_at": "2025-01-17T12:30:00.000Z"
  },
  "transaction": {
    "id": 789,
    "user_id": 456,
    "membership_id": 123,
    "type": "adjustment",
    "amount": 5,
    "description": "Manual adjustment by admin. Reason: Compensation for cancelled class",
    "created_at": "2025-01-17T12:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Cannot reduce balance below 0. Current balance: 2, Adjustment: -5"
}
```

**Business Rules:**
- Can adjust balance up or down
- Cannot reduce balance below 0
- Must provide a reason for audit trail
- Creates a transaction record for tracking


UI:
- Number increments with + and - 
- textarea that's required for desctiption.
- Submit button
- Show success confirmation and new updated balance.
