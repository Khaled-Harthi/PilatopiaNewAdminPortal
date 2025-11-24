# Flow to extend expiration date of a a membership


#### Flow 03: View Balance Bucket Extensions
1. User clicks "View" button on a transaction
2. **Endpoint**: `GET /admin/balance/memberships/{membershipId}/extensions`
3. **Response**:
```json
{
  "extensions": [{
    "id": 10,
    "balance_bucket_id": 500,
    "original_expiry": "2024-03-01T23:59:59Z",
    "new_expiry": "2024-04-01T23:59:59Z",
    "extension_days": 31,
    "reason": "Customer loyalty",
    "extended_by": 1,
    "extended_by_name": "Admin User",
    "created_at": "2024-02-28T10:00:00Z",
    "updated_at": "2024-02-28T10:00:00Z"
  }]
}
```

#### Flow 04: Extend Expiry Date
1. User clicks "Extend Expiry" in extension modal
2. Selects new expiry date (date picker)
3. Optionally enters reason
4. **Endpoint**: `PUT /admin/memberships/{membershipId}/extend`
5. **Request Body**:
```json
{
  "expiryDate": "2024-05-01T23:59:59Z",
  "reason": "Customer request"
}
```
6. Success: Refreshes transaction list


**Extension History Modal**:
- Original expiry date
- New expiry date
- Extension days (calculated)
- Reason (optional, shows "-" if empty)
- Extended by (admin name)
- Extension date


Business Rules:
- Expiry extension must set time to 23:59:59 of selected date
- Extension reason is optional
- Extension days automatically calculated by backend
