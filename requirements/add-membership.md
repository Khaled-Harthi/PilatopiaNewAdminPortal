## Flow to add a membership to a user.

**Step 1: Plan Selection**
- System loads membership plans on mount
- **Endpoint**: `GET /admin/membership-plans`
- **Response**:
```json
{
  "membershipPlans": [{
    "id": "1",
    "name": "10 Class Package",
    "classCount": 10,
    "price": 250.00,
    "validityDays": 90
  }]
}
```
- User selects a plan
- User clicks "Next"

**Step 2: Promo Code (Optional)**
- User enters promo code (optional step)
- **Endpoint**: `GET /admin/promo-codes/validate?code={code}&userId={userId}`
- **Response (Valid)**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discountType": "percentage",
    "discountValue": 20,
    "finalPrice": 200.00,
    "message": "20% discount applied"
  }
}
```
- **Response (Invalid)**:
```json
{
  "success": false,
  "data": {
    "valid": false,
    "error": "EXPIRED",
    "message": "This promo code has expired"
  }
}
```
- User clicks "Next" (can skip without code)

**Step 3: Payment Confirmation**
- User selects payment method: cash, card, or bank_transfer
- User selects start date (defaults to tomorrow)
- User optionally enters notes
- User clicks "Next"
- **Endpoint**: `POST /admin/members/{customerId}/purchase`
- **Request Body**:
```json
{
  "planId": "1",
  "startDate": "2024-01-15T00:00:00Z",
  "description": "10 Class Package purchased in-store\n- Notes here",
  "promoCode": "SAVE20",
  "paymentMethod": "cash"
}
```
- **Response**:
```json
{
  "membershipId": 500,
  "transactionId": 1001,
  "expiryDate": "2024-04-15T23:59:59Z"
}
```
**Step 4: Confirmation**
- Display transaction confirmation
- User clicks "Confirm Purchase"

**Step 5: Success**
- Displays purchase confirmation

### UI

**Progress Indicator**:
- Step 1-5 with icons and descriptions
- Progress bar showing completion percentage
- Current step highlighted

**Step 1 - Plan Selection**:
- Plan cards showing: name, class count, validity days, price
- Selected plan highlighted

**Step 2 - Promo Code**:
- Promo code input field
- Validation status (loading, valid, invalid)
- Discount information (if valid)
- Final price after discount
- Error message (if invalid)

**Step 5 - Payment Confirmation**:
- Payment method selector (cash/card/bank transfer)
- Start date picker
- Notes textarea

**Step 5 - Payment Confirmation**:
- Summary: Customer name, selected plan, start date, end date, original price
- Discount applied (if any)
- Final amount

**Step 5 - Success**:
- Success icon and message

### Business Rules

1. Must select plan before promo code step
2. Promo code is optional, can skip step
3. Promo code validation requires user ID and code
4. Start date defaults to tomorrow, can be changed, can't be in the past
5. Start date time set to 00:00:00 (start of day)
6. Payment method defaults to "cash"
7. Description includes plan name and any notes entered
8. Cannot proceed to next step without required fields