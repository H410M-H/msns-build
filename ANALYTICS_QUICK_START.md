# Analytics Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Add Environment Variables
Go to **Vercel Project Settings → Vars** and add:

```
GTM_CONTAINER_ID=GTM-XXXXXX
GOOGLE_SITE_VERIFICATION=your-code
GA4_API_SECRET=your-secret
```

### 2. Create Google Tag Manager Account
1. Visit: https://tagmanager.google.com
2. Create new account and container
3. Copy your `GTM-XXXXXX` ID
4. Paste into `GTM_CONTAINER_ID` above

### 3. Verify Domain in Search Console
1. Visit: https://search.google.com/search-console
2. Add property: `https://msns.edu.pk`
3. Use meta tag verification (already in code)
4. Submit sitemap: `https://msns.edu.pk/sitemap.xml`

### 4. Deploy Changes
```bash
git push origin main
# Vercel auto-deploys
# Analytics now active!
```

### 5. Start Tracking Events
Use in your components:

```typescript
'use client';

import { useAnalytics } from '~/hooks/useAnalytics';

export function MyComponent() {
  const { logAuth, logAttendance, logFeePayment } = useAnalytics();

  // Track login
  const handleLogin = () => {
    logAuth('login', 'student', 'email');
  };

  // Track attendance
  const handleAttendance = () => {
    logAttendance('STU001', 'CLASS10A', 'present');
  };

  // Track fee payment
  const handlePayment = () => {
    logFeePayment('STU001', 50000, 'PKR', 'online');
  };

  return (
    <>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleAttendance}>Mark Present</button>
      <button onClick={handlePayment}>Pay Fee</button>
    </>
  );
}
```

---

## 📊 Tracking Events Cheat Sheet

### Authentication
```typescript
const { logAuth, setProperties } = useAnalytics();

logAuth('login', 'student', 'email');
logAuth('logout', 'student');
logAuth('signup', 'student', 'email');

// Set user context for all future events
setProperties(userId, 'student', 'Class 10-A', '2025-2026');
```

### Academic
```typescript
const { logAttendance, logAssignment, logExam } = useAnalytics();

// Attendance
logAttendance('STU001', 'CLASS10A', 'present');
logAttendance('STU001', 'CLASS10A', 'absent');
logAttendance('STU001', 'CLASS10A', 'late');

// Assignments
logAssignment('ASSIGN001', 'CLASS10A', 'viewed');
logAssignment('ASSIGN001', 'CLASS10A', 'submitted');

// Exams
logExam('EXAM001', 'CLASS10A', 85, 100); // score, total_marks
```

### Financial
```typescript
const { logFeePayment } = useAnalytics();

// Tracked as conversion in GA4
logFeePayment('STU001', 50000, 'PKR', 'online');
logFeePayment('STU001', 50000, 'PKR', 'bank_transfer');
```

### Resources
```typescript
const { logDownload } = useAnalytics();

logDownload('Syllabus.pdf', 'pdf', 'syllabus');
logDownload('Chapter1_Notes.pdf', 'pdf', 'notes');
logDownload('ExamPaper.pdf', 'pdf', 'exam_paper');
```

### Engagement
```typescript
const { logPageView, logEngagement } = useAnalytics();

logPageView('/dashboard', 'Dashboard', 'student');
logEngagement('Dashboard', 300); // 5 minutes in seconds
```

### Forms
```typescript
const { logFormSubmit } = useAnalytics();

logFormSubmit('attendance_form', 'attendance', 'success');
logFormSubmit('attendance_form', 'attendance', 'error');
```

### Errors
```typescript
const { logError } = useAnalytics();

logError('API_ERROR', 'Network timeout', { 
  endpoint: '/api/students' 
});
```

---

## 🔍 Verify It's Working

### Check GA4 is Active
```javascript
// Open browser console and paste:
window.dataLayer
// Should show events array with data
```

### Check GTM is Loaded
```javascript
// Open browser console and paste:
window.gtag
// Should show gtag function exists
```

### Check Events in GTM
1. Go to GTM Dashboard
2. Click **Preview**
3. Enter your site URL
4. GTM debug panel appears on site
5. Trigger events (login, attendance, etc.)
6. See them in debug panel in real-time

---

## 📈 View Your Data

### GA4 Real-Time Dashboard
1. Go to: https://analytics.google.com
2. Select "M.S. Naz High School" property
3. Click **Realtime**
4. Watch events happen live

### Search Console Performance
1. Go to: https://search.google.com/search-console
2. View organic search impressions
3. Monitor indexation status
4. Check Core Web Vitals

### GTM Container Status
1. Go to: https://tagmanager.google.com
2. Select your container
3. Check **Recent Changes**
4. Monitor **Tag Firing Rate**

---

## 🚨 Troubleshooting

### Q: Events not appearing in GA4?
**A:** 
- [ ] Check GA4 Measurement ID is correct
- [ ] Verify event name in code matches GA4
- [ ] Wait 24 hours (new events take time)
- [ ] Check if ad blocker is blocking tracking

### Q: GTM not loading?
**A:**
- [ ] Verify `GTM_CONTAINER_ID` env var is set
- [ ] Redeploy site after adding env var
- [ ] Check browser console for errors
- [ ] Ensure container is published in GTM

### Q: Search Console shows no results?
**A:**
- [ ] Verify domain ownership
- [ ] Submit sitemap
- [ ] Check robots.txt doesn't block crawling
- [ ] Wait 1-2 weeks for indexing

### Q: Low event volume?
**A:**
- [ ] Confirm hook is called in component
- [ ] Check `window.dataLayer` in console
- [ ] Use GTM Debug panel to verify firing
- [ ] Review component implementation

---

## 📁 File Reference

**Main Files Created:**
```
src/
├── lib/
│   └── analytics/
│       └── ga4-events.ts          ← Event definitions
├── hooks/
│   └── useAnalytics.ts            ← Main hook to use
├── components/
│   └── analytics/
│       └── GoogleTagManager.tsx    ← GTM component
└── examples/
    └── analytics-usage.tsx         ← Code examples

public/
├── sitemap.xml                     ← Auto-indexed
└── robots.txt                      ← Crawl rules

ANALYTICS_SETUP.md                  ← Full documentation
GOOGLE_TRACKING_CHECKLIST.md        ← Step-by-step tasks
ANALYTICS_QUICK_START.md            ← This file
```

---

## 📋 Implementation Checklist

- [ ] Add `GTM_CONTAINER_ID` to Vercel env vars
- [ ] Create GTM account and container
- [ ] Verify domain in Google Search Console
- [ ] Submit sitemap in Search Console
- [ ] Deploy site (Vercel auto-deploys)
- [ ] Test with GTM Preview mode
- [ ] Add `useAnalytics` hook to login component
- [ ] Add tracking to attendance component
- [ ] Add tracking to assignment component
- [ ] Add tracking to exam component
- [ ] Add tracking to payment component
- [ ] Monitor GA4 Realtime dashboard
- [ ] Create custom GA4 reports
- [ ] Set up GTM custom tags
- [ ] Publish GTM container

---

## 🎯 Success Criteria

✅ **You'll know it's working when you see:**

1. **GA4 Events appearing in Realtime**
   - Go to Analytics → Realtime → Events
   - See events firing as you use the app

2. **GTM Debug Panel showing events**
   - Launch GTM Preview mode
   - See all tags firing and variables

3. **Search Console showing your domain**
   - See organic search impressions
   - See pages being crawled and indexed

4. **Custom reports showing data**
   - Create GA4 report filtering by `user_role`
   - See "student", "teacher", "admin" segments

---

## 💡 Pro Tips

### Tip 1: Use Multiple Environments
```typescript
// Use different tracking in dev vs production
const isDev = process.env.NODE_ENV === 'development';

if (!isDev) {
  logAuth('login', 'student', 'email');
}
```

### Tip 2: Batch Events for Performance
```typescript
// For high-volume events, batch them
const eventQueue: any[] = [];

const flushEvents = async () => {
  // Send all events at once
  for (const event of eventQueue) {
    await track(event);
  }
  eventQueue.length = 0;
};
```

### Tip 3: Create Custom Hooks
```typescript
// For specific features, create custom hooks
export function useAttendanceAnalytics() {
  const { logAttendance } = useAnalytics();
  
  return {
    trackPresent: (id: string, cls: string) => 
      logAttendance(id, cls, 'present'),
    trackAbsent: (id: string, cls: string) => 
      logAttendance(id, cls, 'absent'),
  };
}
```

### Tip 4: Monitor Conversions
```typescript
// Fee payments are tracked as "purchase" conversions
// Create GA4 goal: Admin → Goals → Create Goal
// Goal type: "Purchase"
// This gives you conversion rate automatically
```

---

## 📞 Getting Help

1. **GA4 Issues**: https://support.google.com/analytics
2. **GTM Issues**: https://support.google.com/tagmanager
3. **Search Console**: https://support.google.com/webmasters
4. **This Project**: Check ANALYTICS_SETUP.md

---

## ✨ What's Next?

After basic setup:

1. **Create Custom Reports** - Segment by class, role, date
2. **Set Up Alerts** - Get notified of unusual activity
3. **Analyze Patterns** - Understand student engagement
4. **Optimize Flow** - Improve based on user behavior
5. **Scale Events** - Add more detailed tracking

---

**Time to complete**: ~2 hours
**Effort level**: Easy (mostly configuration)
**Learning curve**: Gentle (examples provided)

**Questions?** Refer to ANALYTICS_SETUP.md or GOOGLE_TRACKING_CHECKLIST.md

---

*Last Updated: April 8, 2026*
*Version: 1.0*
*Status: Ready for Implementation*
