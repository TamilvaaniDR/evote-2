# E-Voting System Troubleshooting Guide

## Issues with Voter Identification and OTP Validation

### Problem: Voters are not being identified correctly

**Possible Causes:**
1. Voter doesn't exist in database
2. Voter is not eligible (eligible = false)
3. Voter is not assigned to any elections
4. Database connection issues

**Debugging Steps:**
1. Check backend console for debug messages
2. Verify voter exists in database with correct eligibility
3. Check if voter is assigned to elections
4. Test with the test voter data provided

### Problem: OTP validation is not working

**Possible Causes:**
1. OTP generation and verification using different keys
2. OTP expired (5-minute timeout)
3. OTP not being stored correctly in memory
4. Frontend/backend communication issues

**Debugging Steps:**
1. Check backend console for OTP generation messages
2. Verify OTP is being displayed in dev mode
3. Check OTP verification debug messages
4. Ensure OTP is entered within 5 minutes

## Debug Information Added

### Backend Debugging
- Added console logs for voter identification
- Added OTP generation and verification logs
- Added detailed error messages

### Frontend Debugging
- Added console logs for login attempts
- Added error logging for API calls
- Added response logging

## Test Data

Use this test voter for debugging:

```json
{
  "voterId": "TEST001",
  "name": "Test User",
  "rollno": "2023001",
  "dept": "Computer Science",
  "year": "2023",
  "email": "test@university.edu",
  "phone": "+1234567890",
  "eligible": true,
  "assignedElections": []
}
```

## Testing Steps

1. **Create Test Voter:**
   - Go to Admin → Voters
   - Add the test voter data
   - Assign to an election

2. **Test Voter Login:**
   - Go to Voter Dashboard
   - Enter any identifier (voterId, email, or phone)
   - Check backend console for debug messages
   - Use the displayed dev OTP

3. **Check Debug Output:**
   - Backend console should show voter identification
   - OTP generation and verification logs
   - Frontend console should show API calls

## Common Solutions

### If voter is not found:
```bash
# Check database connection
# Verify voter exists with eligible = true
# Check voter assignments
```

### If OTP fails:
```bash
# Check OTP generation logs
# Verify OTP is not expired
# Check OTP verification logs
# Ensure correct OTP is entered
```

### If elections don't show:
```bash
# Check voter election assignments
# Verify elections are running
# Check election timing (startAt/endAt)
```

## Environment Variables

Make sure these are set correctly:
- `NODE_ENV` (affects OTP display)
- `TOKEN_SECRET` (for JWT tokens)
- `OTP_SECRET` (for voter hashing)

## Database Queries

To check voter data:
```javascript
// Check if voter exists
db.voters.findOne({ voterId: "TEST001" })

// Check voter eligibility
db.voters.findOne({ voterId: "TEST001", eligible: true })

// Check voter elections
db.voters.findOne({ voterId: "TEST001" }).assignedElections
```

## Contact

If issues persist, check:
1. Backend console logs
2. Frontend browser console
3. Network tab for API calls
4. Database connectivity

