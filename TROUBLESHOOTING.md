# Troubleshooting Guide

## Global Search Not Working

### Possible Issues

#### 1. **Not Logged In**
The global search requires authentication. If you're not logged in:
- The API call will return 401
- You'll be automatically redirected to `/login`

**Solution**: Make sure you're logged in first before testing the search.

#### 2. **API Endpoint Not Available**
The search uses `GET /admin/members/search?q={query}&limit=10`

If the API isn't running or doesn't have this endpoint:
- Check browser console (F12) for errors
- Look for "Search failed:" messages
- Verify the API is accessible at `https://api.pilatopia.studio/`

**Test manually**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.pilatopia.studio/admin/members/search?q=test&limit=10"
```

#### 3. **CORS Issues**
If the API doesn't allow requests from localhost:3000:
- You'll see CORS errors in browser console
- API needs to whitelist the origin

**Solution**: Configure API to allow `http://localhost:3000`

#### 4. **Dialog Not Opening**
If pressing ⌘K/Ctrl+K doesn't open the dialog:
- Check if you're focused on the page (not in address bar)
- Try clicking the "Search members..." button instead
- Check browser console for JavaScript errors

### How to Test

1. **Login First**:
   ```
   http://localhost:3000/en/login
   Email: khalid@pilatopia.studio
   Password: Admin@123
   ```

2. **Open Browser Console** (F12)

3. **Navigate to Home** (should redirect after login)

4. **Press ⌘K** (Mac) or **Ctrl+K** (Windows/Linux)

5. **Check Console Output**:
   - Should see: "Searching for: [your query]"
   - If successful: "Search response: {members: [...]}"
   - If failed: "Search failed:" with error details

### Debug Logs Added

The GlobalSearch component now has console.log statements:
- `console.log('Searching for:', search)` - When search starts
- `console.log('Search response:', response.data)` - On success
- `console.error('Search failed:', error)` - On error
- `console.error('Error details:', error.response?.data)` - Error details

### Common Errors

#### Error: 401 Unauthorized
**Cause**: Not logged in or token expired
**Solution**: Log in again

#### Error: 404 Not Found
**Cause**: API endpoint doesn't exist
**Solution**: Verify API has `/admin/members/search` endpoint

#### Error: Network Error
**Cause**: API not accessible
**Solution**: Check API is running and accessible

#### Error: CORS
**Cause**: API doesn't allow localhost
**Solution**: Configure API CORS settings

## Other Common Issues

### Pages Loading but No Styling
**Cause**: Tailwind CSS not compiling
**Solution**:
```bash
rm -rf .next
npm run dev
```

### Build Fails
**Solution**:
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Can't Navigate to Member Details
**Cause**: Member ID route not dynamic
**Status**: ✅ Fixed - Using `[id]` dynamic route

### Sidebar Not Working
**Cause**: Missing sidebar state provider
**Status**: ✅ Implemented - Using SidebarProvider

## Testing Checklist

- [ ] Can access login page
- [ ] Can log in with valid credentials
- [ ] Redirected to home after login
- [ ] Can see sidebar navigation
- [ ] Sidebar can be toggled
- [ ] Can press ⌘K to open search
- [ ] Can click "Search members..." to open search
- [ ] Can type in search (min 2 chars)
- [ ] See "Searching..." message
- [ ] See search results or "No members found"
- [ ] Can click a result to navigate
- [ ] Navigate to member detail page
- [ ] Can navigate back to members list

## API Integration Status

| Feature | Endpoint | Status |
|---------|----------|--------|
| Login | `POST /admin/auth/login` | ✅ Integrated |
| Members List | `GET /admin/members` | ✅ Integrated |
| Member Details | `GET /admin/members/{id}` | ✅ Integrated |
| Global Search | `GET /admin/members/search` | ✅ Integrated |
| Daily Classes | `GET /admin/attendance/daily` | ✅ Integrated |
| Class Details | `GET /admin/attendance/classes/{id}` | ✅ Integrated |
| Check-in | `POST /admin/attendance/classes/{classId}/users/{userId}` | ✅ Integrated |

## Getting Help

If you're still experiencing issues:

1. **Check browser console** for errors (F12)
2. **Check network tab** to see API requests/responses
3. **Verify you're logged in** (check localStorage for 'token')
4. **Test API directly** with curl or Postman
5. **Check server logs** (`BashOutput` for dev server)

## Known Limitations

1. **Membership Management**: UI ready, needs full implementation
2. **Booking Management**: UI ready, needs full implementation
3. **Schedule Management**: Placeholder only
4. **Settings**: Placeholder only

## Next Steps for Full Implementation

See `README.md` for planned features and implementation roadmap.
