# Admin System Setup Instructions

## Issue: kaniobed28@gmail.com logged in but getting "Access Denied"

The admin system needs to be initialized first. Here's how to fix it:

## Quick Fix Steps:

### Step 1: Update Firestore Rules (Temporary)
1. Go to your Firebase Console
2. Navigate to Firestore Database > Rules
3. Replace your current rules with the content from `firestore-rules-development.rules`
4. Publish the rules

### Step 2: Initialize Admin System
1. Make sure you're signed in as `kaniobed28@gmail.com`
2. Visit: `http://localhost:3000/admin/quick-init`
3. Click "Initialize Admin" button
4. You should see a success message

### Step 3: Test Admin Access
1. Visit: `http://localhost:3000/admin`
2. You should now have access to the admin dashboard

## Alternative Methods:

### Method 1: Use the Standard Init Page
1. Visit: `http://localhost:3000/admin/init-system`
2. Click "Initialize Admin System"

### Method 2: Use the Debug Page
1. Visit: `http://localhost:3000/admin/debug`
2. Check your authentication status
3. Click "Initialize Principal Admin"

## Troubleshooting:

### If you still get "Access Denied":
1. Check the browser console for errors
2. Verify you're signed in with the correct email
3. Try the debug page to see detailed information
4. Clear browser cache and cookies
5. Sign out and sign back in

### If Firestore operations fail:
1. Check that the Firestore rules are updated
2. Verify your Firebase project is correctly configured
3. Check the browser network tab for failed requests

## Security Note:
The development rules in `firestore-rules-development.rules` are more permissive for testing. 
Once the admin system is working, replace them with the production rules from `firestore-admin-rules.rules`.

## Next Steps After Setup:
1. Visit `/admin` - Main admin dashboard
2. Visit `/admin/audit-logs` - View admin activity logs
3. Visit `/admin/init-categories` - Manage categories
4. Continue with remaining admin features implementation

## Need Help?
If you're still having issues, check:
1. Browser console for JavaScript errors
2. Firebase Console for Firestore errors
3. Network tab for failed API calls
4. Make sure you're using the correct Firebase project