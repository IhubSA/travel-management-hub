# UI Preview - What You'll See When Deployed

**When you visit https://travel-management-hub.vercel.app**

---

## Page 1: Login Page (`/login`)

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│        ┌──────────────────────┐         │
│        │  Travel Hub Login    │         │
│        │  Angels Resource     │         │
│        │  Centres Travel      │         │
│        │  Management System   │         │
│        └──────────────────────┘         │
│                                         │
│        Email Address                    │
│        ┌──────────────────────┐         │
│        │ your.email@...       │         │
│        └──────────────────────┘         │
│                                         │
│        Password                         │
│        ┌──────────────────────┐         │
│        │ ••••••••••••••    👁 │         │
│        └──────────────────────┘         │
│                                         │
│        ┌──────────────────────┐         │
│        │   Sign In            │         │
│        └──────────────────────┘         │
│                                         │
│        Forgot your password?            │
│        Sign-up is disabled. Contact...  │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Features Visible:**
- Clean, centered design
- Company branding ("Travel Hub Login")
- Email input field
- Password input with show/hide toggle (👁 icon)
- Blue "Sign In" button
- "Forgot password?" link in blue
- Note about sign-up being disabled
- Responsive (mobile-friendly)

---

## Page 2: Dashboard (after login) (`/dashboard`)

```
┌────────────────────────────────────────┐
│                                        │
│  Welcome, Jane                         │
│  Role: STAFF                           │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Travel       │  │ Budget       │   │
│  │ Requests     │  │ Status       │   │
│  │              │  │              │   │
│  │ Manage and   │  │ View project │   │
│  │ track travel │  │ budget and   │   │
│  │ requests     │  │ usage        │   │
│  └──────────────┘  └──────────────┘   │
│                                        │
│  ┌──────────────┐                      │
│  │ Approvals    │                      │
│  │              │                      │
│  │ Manage       │                      │
│  │ pending      │                      │
│  │ approvals    │                      │
│  └──────────────┘                      │
│                                        │
├────────────────────────────────────────┤
│  📝 Role-specific dashboards and      │
│  components will display based on     │
│  user role (STAFF, HOD, TRAVEL_OFF...)│
│                                        │
└────────────────────────────────────────┘
```

**Features Visible:**
- Personal greeting ("Welcome, Jane")
- Current role displayed ("Role: STAFF")
- Placeholder cards for upcoming features:
  - Travel Requests
  - Budget Status
  - Approvals
- Blue info box explaining future features
- Clean, organized layout
- Ready for role-specific content

---

## Page 3: Forgot Password (`/forgot-password`)

### 3A: Initial Form
```
┌────────────────────────────────────────┐
│                                        │
│       Reset Password                   │
│       Enter your email address and     │
│       we'll send a reset link          │
│                                        │
│       Email Address                    │
│       ┌──────────────────────┐         │
│       │ your.email@...       │         │
│       └──────────────────────┘         │
│                                        │
│       ┌──────────────────────┐         │
│       │ Send Reset Link      │         │
│       └──────────────────────┘         │
│                                        │
│       Back to login                    │
│                                        │
└────────────────────────────────────────┘
```

### 3B: After Submission
```
┌────────────────────────────────────────┐
│                                        │
│            ✓                           │
│       Check Your Email                 │
│                                        │
│       We've sent a password reset      │
│       link to your email address.      │
│       Please check your inbox and      │
│       follow the instructions to       │
│       reset your password.             │
│                                        │
│       Back to login                    │
│                                        │
└────────────────────────────────────────┘
```

---

## Page 4: Reset Password (`/reset-password`)

```
┌────────────────────────────────────────┐
│                                        │
│    Create New Password                 │
│    Enter your new password to regain   │
│    access to your account              │
│                                        │
│    New Password                        │
│    ┌──────────────────────┐            │
│    │ ••••••••••••••    👁 │            │
│    └──────────────────────┘            │
│    Minimum 8 characters for security   │
│                                        │
│    Confirm Password                    │
│    ┌──────────────────────┐            │
│    │ ••••••••••••••    👁 │            │
│    └──────────────────────┘            │
│                                        │
│    ┌──────────────────────┐            │
│    │ Reset Password       │            │
│    └──────────────────────┘            │
│                                        │
│    Back to login                       │
│                                        │
└────────────────────────────────────────┘
```

---

## Color Scheme

**Primary Colors:**
- Blue: `#2563eb` (buttons, links, accents)
- Gray: `#f3f4f6` (background)
- White: `#ffffff` (cards, inputs)

**Secondary Colors:**
- Success Green: `#10b981`
- Error Red: `#ef4444`
- Warning Yellow: `#f59e0b`

**Text:**
- Dark Gray: `#111827` (headings)
- Medium Gray: `#6b7280` (body text)
- Light Gray: `#d1d5db` (borders)

---

## Responsive Behavior

### Desktop (1024px+)
```
Full width layout
- Centered content
- Wide input fields
- Comfortable spacing
- Full-size cards
```

### Tablet (768px-1023px)
```
Slightly condensed
- Narrower content area
- Good padding
- Readable text
- Touch-friendly buttons
```

### Mobile (< 768px)
```
Full-width layout
- Padding on edges
- Large touch targets
- Full-width inputs
- Stacked cards
- Simplified spacing
```

---

## Interactive Elements

### Buttons
- **Normal State:** Solid blue, white text
- **Hover State:** Darker blue, slight shadow
- **Disabled State:** Gray, cursor disabled
- **Loading State:** Shows spinner "Signing in..."

### Input Fields
- **Normal:** White background, gray border
- **Focused:** Blue border, subtle blue outline
- **Disabled:** Light gray background
- **Error:** Red border, red error text below
- **Show/Hide:** Eye icon toggle (👁/🙈)

### Links
- **Normal:** Blue text, no underline
- **Hover:** Blue text, underline
- **Visited:** Same as normal (no purple)

---

## Loading & Error States

### Loading State
```
┌────────────────────────────────────────┐
│                                        │
│      ⟳⟳⟳⟳⟳                          │
│      Loading...                        │
│                                        │
└────────────────────────────────────────┘
```

### Error State
```
┌────────────────────────────────────────┐
│  ⚠ Invalid email or password          │
│                                        │
│  Email Address                         │
│  ┌──────────────────────┐              │
│  │                      │ ← Red border  │
│  └──────────────────────┘              │
│                                        │
│  Password                              │
│  ┌──────────────────────┐              │
│  │                      │ ← Red border  │
│  └──────────────────────┘              │
│                                        │
│  ┌──────────────────────┐              │
│  │ Sign In              │              │
│  └──────────────────────┘              │
│                                        │
└────────────────────────────────────────┘
```

---

## Accessibility Features

✅ **Implemented:**
- Semantic HTML labels
- Keyboard navigation (Tab through inputs)
- Color not the only indicator (text labels too)
- Clear focus states (blue outline)
- Proper heading hierarchy
- Alt text on icons
- Form validation feedback
- Error messages clearly linked to fields

---

## What Happens When You Test Login

### Successful Login Flow
1. Enter test email: `jane.smith@angels-travel.example.com`
2. Enter password (from Phase 2 seed data)
3. Click "Sign In"
4. Brief loading spinner
5. ✅ Redirect to `/dashboard`
6. Dashboard shows: "Welcome, Jane" + "Role: STAFF"

### Wrong Password
1. Click "Sign In"
2. Red error box appears: "Invalid email or password"
3. Input fields show red borders
4. Stay on login page
5. Can try again

### Forgot Password Flow
1. Click "Forgot your password?"
2. See forgot password form
3. Enter email
4. Click "Send Reset Link"
5. See success page: "Check Your Email"
6. Email arrives with reset link
7. Click link in email
8. Taken to reset password form
9. Enter new password (8+ chars)
10. Click "Reset Password"
11. See success page with redirect
12. Redirected to login
13. Log in with new password

---

## Future Enhancements (Phase 3 Continuation)

The layout will add:
- **Header:** Company logo, user name, role badge, dropdown menu
- **Sidebar:** Role-specific navigation links
- **Dashboard Cards:** Real data instead of placeholders
- **Tables:** Lists of requests, approvals, projects
- **Forms:** Create new requests, manage projects
- **Admin Pages:** User management, project management
- **Mobile Menu:** Hamburger menu for small screens

---

## Browser Support

✅ **Works On:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Expectations

**On First Load:**
- Page loads in ~1-2 seconds
- CSS is optimized with Tailwind
- No external resources needed (self-contained)

**After Login:**
- Dashboard loads instantly
- Session persists on refresh
- Token auto-refreshes in background

---

## Security Visual Indicators

✅ **Visible to Users:**
- HTTPS (green lock icon in browser)
- No sensitive data shown in URLs
- Passwords hidden (•••••••)
- "Invalid email or password" (doesn't reveal if email exists)
- "Minimum 8 characters" requirement shown
- Secure password strength requirements

---

## What to Test After Deployment

1. **Navigation:**
   - [ ] Click all links
   - [ ] Check URLs change correctly
   - [ ] Back button works

2. **Authentication:**
   - [ ] Login with correct credentials works
   - [ ] Login with wrong password shows error
   - [ ] Unauthenticated users redirected to login
   - [ ] Logout redirects to login

3. **Forms:**
   - [ ] Email field validates format
   - [ ] Password field validates length
   - [ ] Submit button disables when invalid
   - [ ] Loading state shows during submission

4. **Responsiveness:**
   - [ ] Desktop view (1024px+)
   - [ ] Tablet view (768px-1023px)
   - [ ] Mobile view (<768px)
   - [ ] All text readable
   - [ ] All buttons clickable

5. **Errors:**
   - [ ] Error messages clear
   - [ ] Recovery is possible
   - [ ] No sensitive info leaked

---

## Next Session: Adding More Pages

Once you see this layout working, you'll add:
- Dashboard variants per role
- Sidebar navigation menu
- Header with user menu
- Admin pages for user/project management
- Travel request forms
- Approval workflow UI
- Budget pages

Each will use the same styling and components, just different content.

---

**That's what you'll see when deployed!**

The authentication flow is complete and ready for Phase 3 features.

See `DEPLOY_NOW.md` to get it live in 10 minutes.
