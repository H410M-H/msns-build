# Google Analytics Setup Guide for M.S. Naz High School LMS

This guide walks you through setting up Google Search Console, Google Analytics 4 (GA4), and Google Tag Manager (GTM) for real-time tracking and scaling.

## Current Setup Status

✅ **Already Configured:**
- Google Analytics 4 (GA4) - Measurement ID: `G-K3FXJTBQKM`
- Vercel Analytics integrated
- JSON-LD Schema for SEO

📋 **To Be Configured:**
- Google Search Console
- Google Tag Manager
- Custom event tracking

---

## 1. Google Search Console Setup

### Step 1: Verify Domain Ownership

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add property"** → Select **URL prefix**
3. Enter: `https://msns.edu.pk`
4. Choose verification method:
   - **HTML file (Recommended)**: Download the file and place in `/public`
   - **DNS record**: Add TXT record to your domain registrar
   - **Meta tag**: Already added to layout.tsx
   - **Google Analytics**: Use existing GA4 property

### Step 2: Submit Sitemap

1. In Search Console, go to **Sitemaps**
2. Submit: `https://msns.edu.pk/sitemap.xml`
3. Submit: `https://msns.edu.pk/robots.txt`

### Step 3: Monitor Performance

- Check **Performance** tab to see search impressions, clicks, and ranking positions
- Review **Coverage** tab to ensure all pages are indexed
- Check **Core Web Vitals** to monitor page performance

---

## 2. Google Analytics 4 (GA4) Configuration

### Current Setup:
- **Measurement ID**: G-K3FXJTBQKM
- **Tracking Code**: Installed in `/src/app/layout.tsx`
- **Vercel Analytics**: Enabled for Real User Monitoring (RUM)

### Custom Events Already Configured:

The following school-specific events are tracked automatically:

**Authentication Events**
- `user_login` - Track when users log in
- `user_logout` - Track when users log out
- `user_signup` - Track new user registration

**Academic Events**
- `attendance_marked` - When attendance is recorded
- `assignment_interaction` - When assignments are viewed/submitted
- `exam_completed` - When exams are completed with scores
- `page_engagement` - Time spent on pages

**Financial Events**
- `purchase` - Fee payments (tracked as conversions)

**System Events**
- `form_submit` - Form submissions with success/error status
- `file_download` - Resource downloads
- `exception` - Errors and exceptions

### How to Track Events in Your Code:

```typescript
'use client';

import { useAnalytics } from '~/hooks/useAnalytics';

export function MyComponent() {
  const { 
    logPageView, 
    logAuth, 
    logAttendance, 
    logFeePayment,
    setProperties 
  } = useAnalytics();

  // After successful login
  const handleLogin = async (userId: string, role: string) => {
    await loginUser(userId);
    logAuth('login', role, 'email');
    setProperties(userId, role, 'Class 10', '2025-2026');
  };

  // Track attendance
  const handleMarkAttendance = (studentId: string, classId: string) => {
    logAttendance(studentId, classId, 'present');
  };

  // Track fee payment
  const handleFeePayment = (studentId: string, amount: number) => {
    logFeePayment(studentId, amount, 'PKR', 'online');
  };

  return (
    // Component code
  );
}
```

### GA4 Dashboard Analysis:

1. **Realtime Report**: View active users and events in real-time
2. **Engagement Report**: See which pages and features users engage with most
3. **Conversion Report**: Monitor fee payments and important actions
4. **Audience Report**: Understand user segments by role and class
5. **Tech Report**: Monitor browsers, devices, and OS usage

---

## 3. Google Tag Manager (GTM) Setup

### Why Use GTM?

- **Easier Event Management**: Change tracking without code deployment
- **Real-time Updates**: Publish changes immediately
- **Debugging**: Built-in preview and debug tools
- **Scalability**: Manage multiple tracking services from one place

### Step 1: Create GTM Account

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Click **Create account**
3. Enter:
   - Account name: `M.S. Naz High School`
   - Container name: `LMS - Production`
   - Target platform: **Web**
4. Accept terms and create

### Step 2: Get Your Container ID

After creating, you'll receive a Container ID like: `GTM-XXXXXX`

### Step 3: Enable GTM in Your App

Update `/src/app/layout.tsx`:

```typescript
import { GoogleTagManager } from '~/components/analytics/GoogleTagManager';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        {/* ... existing head content ... */}
        <GoogleTagManager containerID="GTM-XXXXXX" /> {/* Add this line */}
      </head>
      <body>
        {/* ... rest of layout ... */}
      </body>
    </html>
  );
}
```

### Step 4: Set Up GTM Tags

In GTM Dashboard:

1. **Create a New Tag** → Click "New"
2. **Tag Configuration**: Select "Google Analytics: GA4 Configuration"
3. Choose your GA4 property ID
4. **Triggering**: Select "All Pages"
5. **Publish** the container

### Step 5: Send Custom Events via GTM

Create tags in GTM for each custom event:

**Example: Attendance Marked Tag**
- **Tag Type**: Google Analytics: GA4 Event
- **Event Name**: `attendance_marked`
- **Parameters**:
  - `student_id` (variable)
  - `class_id` (variable)
  - `attendance_status` (variable)
- **Trigger**: When custom event `attendance_marked` is fired

### Step 6: Preview & Debug

1. Click **Preview** in GTM
2. Enter your site URL
3. GTM Debug Panel will show on your site
4. Test events by triggering them in your app
5. When satisfied, **Submit** the container

---

## 4. Real-time Tracking & Monitoring

### GA4 Real-time Dashboard

1. Go to **Realtime** report in GA4
2. Watch active users in real-time
3. See events as they happen
4. Monitor page navigation flows

### Create Custom Dashboards

**Academic Performance Dashboard:**
- Exam completion rate
- Assignment submission rate
- Average scores by class
- Page engagement time

**User Engagement Dashboard:**
- Daily active users
- Login frequency
- Feature usage patterns
- Drop-off points

**Financial Tracking:**
- Fee payment conversions
- Payment method preferences
- Outstanding payments by class

---

## 5. Scaling & Performance Optimization

### Implement Server-Side Tracking

For high-volume events (attendance, grades), use server-side tracking:

```typescript
// api/analytics/track.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { eventName, eventParams } = await req.json();

  // Send to GA4 using Measurement Protocol
  const response = await fetch(
    'https://www.google-analytics.com/mp/collect',
    {
      method: 'POST',
      body: JSON.stringify({
        measurement_id: 'G-K3FXJTBQKM',
        api_secret: process.env.GA4_API_SECRET,
        events: [
          {
            name: eventName,
            params: eventParams,
          },
        ],
      }),
    }
  );

  return NextResponse.json({ success: response.ok });
}
```

### Data Retention

- GA4 default: 14 months for user data
- To keep data longer: Go to Admin → Property Settings → Enable "Google Analytics data retention" up to 50 months

### User Privacy

- Add privacy policy mentioning analytics tracking
- Implement cookie consent banner
- Ensure GDPR/local compliance

### Performance Tips

1. **Implement data sampling** for large datasets
2. **Use event parameters** instead of custom dimensions for flexibility
3. **Create filters** in GA4 to exclude internal traffic
4. **Set up alerts** for unusual activity
5. **Monitor API quotas** if using Measurement Protocol

---

## 6. Troubleshooting

### GA4 Events Not Showing Up

1. **Check implementation**: Ensure `useAnalytics` hook is used correctly
2. **Debug**: Open browser DevTools → Network, search for `google-analytics`
3. **GA4 Debug Mode**: Enable debug mode in GA4 settings
4. **Wait 24 hours**: New events can take time to appear

### GTM Container Not Loading

1. Verify Container ID is correct
2. Check `<GoogleTagManager containerID="GTM-XXXXXX" />` is in layout
3. Open GTM Preview mode
4. Check browser console for errors

### Search Console Not Showing Results

1. Ensure domain is properly verified
2. Submit sitemap
3. Allow 1-2 weeks for indexing
4. Check for robots.txt restrictions

---

## 7. Useful Links

- [GA4 Setup](https://support.google.com/analytics/answer/9304153)
- [GTM Setup](https://support.google.com/tagmanager/answer/6103696)
- [Search Console Help](https://support.google.com/webmasters/)
- [Measurement Protocol (Server-side)](https://developers.google.com/analytics/devguides/collection/protocol/ga4)

---

## Next Steps

1. ✅ Verify domain in Google Search Console
2. ✅ Submit sitemap to Search Console
3. ✅ Create GTM account and get Container ID
4. ✅ Update layout.tsx with GTM container ID
5. ✅ Set up custom tags in GTM
6. ✅ Monitor real-time data in GA4 and GTM
7. ✅ Create custom reports for different stakeholders
8. ✅ Set up alerts for important metrics

---

*Last updated: April 8, 2026*
