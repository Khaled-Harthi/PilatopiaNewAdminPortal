# Add Arabic i18n Support to Member Profile Components

**Status**: In Progress
**Requirement Source**: Project-wide i18n requirement (Arabic RTL default)
**Estimated Complexity**: Medium

## Objective
Add full Arabic and English translation support to all member profile components that currently have hardcoded English text.

## Background
The project uses next-intl for internationalization with Arabic (RTL) as the default language and English as a secondary language. Several components in the member profile section were implemented without i18n support, violating the project's multilingual requirements.

## Affected Components
1. `components/member/AddMembershipWizard.tsx` - Complete 5-step membership purchase wizard
2. `components/member/MemberBookings.tsx` - Bookings list and create booking dialog
3. `components/member/MemberMemberships.tsx` - Memberships list with transaction history

## Acceptance Criteria
- [ ] Import `useTranslations` from `next-intl` in all affected components
- [ ] Extract all hardcoded English text strings
- [ ] Add translation keys to `messages/en.json`
- [ ] Add Arabic translations to `messages/ar.json`
- [ ] Replace all hardcoded text with `t()` function calls
- [ ] Test all components in both Arabic and English
- [ ] Verify RTL layout works correctly in Arabic
- [ ] Ensure date formatting respects locale
- [ ] Test promo code functionality in both languages
- [ ] Tested by Claude with Playwright
- [ ] Approved by user

## Technical Notes

### Translation Key Structure
Organize keys under `memberProfile` namespace:
```json
{
  "memberProfile": {
    "bookings": { ... },
    "memberships": { ... },
    "addMembership": {
      "title": "...",
      "steps": {
        "selectPlan": { ... },
        "promoCode": { ... },
        "paymentDetails": { ... },
        "confirmation": { ... },
        "success": { ... }
      }
    }
  }
}
```

### Components to Update
1. **AddMembershipWizard.tsx** (~60+ strings):
   - Dialog title
   - Step indicators (1 of 5, 2 of 5, etc.)
   - All step headings
   - Form labels (Payment Method, Start Date, Notes, etc.)
   - Button text (Next, Back, Validate, Confirm Purchase, Done)
   - Success messages
   - Error messages

2. **MemberBookings.tsx** (~20+ strings):
   - Section heading "Bookings"
   - Button text "Create Booking"
   - Table headers (Class Name, Date & Time, Instructor)
   - Dialog title "Create Booking"
   - Form labels
   - Empty state messages
   - Success/error messages

3. **MemberMemberships.tsx** (~25+ strings):
   - Section heading "Memberships"
   - Button text "Add Membership"
   - Table headers (Plan Name, Start Date, Usage, Remaining, Price Paid, Status)
   - Status badges (Active, Expired, Starts in X days, etc.)
   - Action menu items (Extend, Add Class)
   - Empty state messages

### Date Formatting
- Use `date-fns` locale support for Arabic dates
- Import `ar` locale from `date-fns/locale`
- Pass locale to `format()` function based on current locale

### Dependencies
- `next-intl` - already installed
- `date-fns/locale` - for Arabic date formatting

### Potential Challenges
1. RTL layout for promo code validation box
2. Number formatting (Arabic uses Eastern Arabic numerals in some contexts)
3. Currency display (SAR/SR positioning in RTL)
4. Date formatting differences between locales
5. Form validation messages

## Testing Checklist
- [ ] Component renders in Arabic (default)
- [ ] Component renders in English
- [ ] All text is translated (no English showing in Arabic mode)
- [ ] RTL layout works correctly
- [ ] Date formatting shows correct locale
- [ ] Numbers and currency display correctly
- [ ] Form validation messages are translated
- [ ] Success/error messages are translated
- [ ] Tested full Add Membership flow in both languages
- [ ] Tested Create Booking in both languages
- [ ] Promo code validation works in both languages
- [ ] All button actions work in both languages

## Implementation Steps
1. Read existing translation files to understand structure
2. Create comprehensive list of all strings to translate
3. Add English keys to `messages/en.json`
4. Add Arabic translations to `messages/ar.json`
5. Update AddMembershipWizard.tsx with i18n
6. Update MemberBookings.tsx with i18n
7. Update MemberMemberships.tsx with i18n
8. Test with Playwright in both locales
9. Fix any RTL layout issues
10. Request user approval
