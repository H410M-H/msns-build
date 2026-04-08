# Google Tracking Implementation Checklist

Complete this checklist to fully set up real-time tracking and scaling for M.S. Naz High School LMS.

## Phase 1: Environment Setup ✅

- [ ] **Add GTM Container ID**
  ```bash
  # In Vercel Project Settings → Vars
  GTM_CONTAINER_ID=GTM-XXXXXX
  ```

- [ ] **Add GA4 API Secret** (for server-side tracking)
  ```bash
  GA4_API_SECRET=your-measurement-protocol-secret
  ```

- [ ] **Add Google Search Console Verification Code**
  ```bash
  GOOGLE_SITE_VERIFICATION=your-verification-code
  ```

- [ ] **Verify environment variables are set**
  - Check Vercel Settings → Vars section
  - Ensure all env vars from `.env.example` are configured

---

## Phase 2: Google Search Console Setup 🔍

- [ ] **Create Google Search Console Account**
  - Go to [Google Search Console](https://search.google.com/search-console)
  - Sign in with Google account

- [ ] **Add Property**
  - Click "Add property"
  - Choose "URL prefix"
  - Enter: `https://msns.edu.pk`

- [ ] **Verify Domain Ownership** (Choose ONE method)
  
  **Option A: HTML Meta Tag (Already configured)**
  - [ ] Code is already in layout.tsx metadata
  - [ ] Check verification in Search Console

  **Option B: HTML File**
  - [ ] Download verification file from Search Console
  - [ ] Place in `/public` directory
  - [ ] Upload to production

  **Option C: DNS Record**
  - [ ] Get TXT record from Search Console
  - [ ] Add to domain DNS settings at your registrar
  - [ ] Wait for DNS propagation (up to 48 hours)

- [ ] **Submit Sitemap**
  - Go to "Sitemaps" in Search Console
  - Submit: `https://msns.edu.pk/sitemap.xml`
  - Verify it's indexed

- [ ] **Submit robots.txt**
  - Already configured at `/public/robots.txt`
  - Add to Search Console if not automatic

- [ ] **Exclude Internal Traffic** (Optional)
  - In Search Console → Settings → Crawl Stats
  - Exclude admin/test traffic if needed

---

## Phase 3: Google Analytics 4 Configuration 📊

### GA4 is Already Connected ✅
- Measurement ID: `G-K3FXJTBQKM`
- Tracking implemented in layout.tsx

### Configure GA4 Properties

- [ ] **Access GA4 Dashboard**
  - Go to [Google Analytics](https://analytics.google.com)
  - Select "M.S. Naz High School" property

- [ ] **Set Up User Properties**
  - Admin → Custom Definitions → User Scopes
  - Create custom user properties:
    - `user_role` (student, teacher, admin, parent)
    - `class_name` (Class 10-A, Class 9-B, etc.)
    - `school_year` (2025-2026)

- [ ] **Create Conversion Goals**
  - Admin → Conversions → New Conversion Event
  - Create conversions for:
    - [ ] `purchase` (fee payment)
    - [ ] `assignment_interaction` (assignment submission)
    - [ ] `exam_completed` (exam completion)
    - [ ] `attendance_marked` (attendance)

- [ ] **Set Up Data Retention**
  - Admin → Property Settings → Data Retention
  - Change from "14 months" to "50 months" for historical data

- [ ] **Create Custom Reports**
  - Explore → Create Reports
  - Save these key reports:
    - User engagement by role
    - Fee payment conversion rate
    - Assignment submission patterns
    - Exam completion trends

- [ ] **Enable User-ID Tracking** (Optional, for privacy compliance)
  - Admin → Data Streams → Web → Enhanced Measurement
  - Enable "Google Signals" for cross-platform tracking

---

## Phase 4: Google Tag Manager Setup 🏷️

### Initial Setup

- [ ] **Create GTM Account**
  - Go to [Google Tag Manager](https://tagmanager.google.com)
  - Click "Create account"
  - Account name: `M.S. Naz High School`
  - Container name: `LMS - Production`
  - Platform: Web
  - Accept terms

- [ ] **Get Container ID**
  - After creation, you'll see: `GTM-XXXXXX`
  - Copy this ID

- [ ] **Update Environment Variables**
  - Vercel Settings → Vars
  - Add: `GTM_CONTAINER_ID=GTM-XXXXXX`
  - Redeploy project

- [ ] **Verify GTM Loads**
  - Visit your site
  - Open DevTools Console
  - Type: `window.dataLayer` should show data

### Create GTM Tags

- [ ] **GA4 Configuration Tag**
  - New Tag → GA4 Configuration
  - Property ID: G-K3FXJTBQKM
  - Trigger: All Pages
  - Publish

- [ ] **Attendance Event Tag**
  - New Tag → GA4 Event
  - Event Name: `attendance_marked`
  - Parameters: student_id, class_id, attendance_status
  - Trigger: Custom Event (attendance_marked)

- [ ] **Assignment Event Tag**
  - New Tag → GA4 Event
  - Event Name: `assignment_interaction`
  - Parameters: assignment_id, class_id, action
  - Trigger: Custom Event (assignment_interaction)

- [ ] **Exam Event Tag**
  - New Tag → GA4 Event
  - Event Name: `exam_completed`
  - Parameters: exam_id, class_id, score, total_marks
  - Trigger: Custom Event (exam_completed)

- [ ] **Payment Event Tag**
  - New Tag → GA4 Event
  - Event Name: `purchase`
  - Parameters: value, currency, transaction_id
  - Trigger: Custom Event (purchase)

- [ ] **Page View Tag**
  - New Tag → GA4 Page View
  - Trigger: Page View
  - Publish

### Test GTM

- [ ] **Enable GTM Preview Mode**
  - GTM Dashboard → Preview
  - Enter your site URL
  - Install GTM preview container on your site

- [ ] **Test Event Tracking**
  - GTM Debug Panel will show on your site
  - Go to student dashboard
  - Click buttons to trigger events
  - Verify events appear in debug panel

- [ ] **Submit GTM Container**
  - When satisfied, click "Submit"
  - Add version name: "v1 - Initial Setup"
  - Container is now published live

---

## Phase 5: Integration with Your App 📱

### Implement Tracking in Components

- [ ] **Login Page**
  - Use `logAuth('login', role)` when user logs in
  - Use `setProperties()` to set user context

- [ ] **Attendance Page**
  - Use `logAttendance(studentId, classId, status)` when marking
  - Use `logFormSubmit()` for form submission

- [ ] **Assignment Page**
  - Use `logAssignment(assignmentId, classId, 'submitted')` on submit
  - Use `logAssignment(assignmentId, classId, 'viewed')` on view

- [ ] **Exam Page**
  - Use `logExam(examId, classId, score, totalMarks)` on submission

- [ ] **Fee Payment Page**
  - Use `logFeePayment(studentId, amount, currency, method)` on success
  - This creates a conversion event

- [ ] **Resource Downloads**
  - Use `logDownload(fileName, fileType, category)` for syllabus, notes, etc.

### Code Example: Update Login Page

```typescript
// pages/login.tsx or app/login/page.tsx
'use client';

import { useAnalytics } from '~/hooks/useAnalytics';

export default function LoginPage() {
  const { logAuth, setProperties } = useAnalytics();

  const handleLogin = async (email: string, password: string) => {
    const user = await loginUser(email, password);
    
    // Track login event
    logAuth('login', user.role, 'email');
    
    // Set user properties for future events
    setProperties(user.id, user.role, user.className, '2025-2026');
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      // Handle login...
    }}>
      {/* Form fields */}
    </form>
  );
}
```

- [ ] **Review examples** in `/src/examples/analytics-usage.tsx`
- [ ] **Update attendance component**
- [ ] **Update assignment component**
- [ ] **Update exam component**
- [ ] **Update payment component**
- [ ] **Add page view tracking to key pages**

---

## Phase 6: Real-Time Monitoring 📈

### GA4 Dashboards

- [ ] **Create Dashboard: User Engagement**
  - Active users in real-time
  - User role distribution
  - Most visited pages
  - Session duration

- [ ] **Create Dashboard: Academic Performance**
  - Exam completion rate
  - Assignment submission rate
  - Average exam scores by class
  - Page engagement by class

- [ ] **Create Dashboard: Financial**
  - Fee payment conversion rate
  - Payment method preference
  - Total fees collected
  - Payment trends

### GTM Monitoring

- [ ] **Regular GTM Review**
  - Check GTM debug panel weekly
  - Review tag firing rates
  - Ensure no duplicate events
  - Monitor for errors

- [ ] **Set Up GTM Alerts**
  - GTM Dashboard → Alerts
  - Create alerts for:
    - Container publish failures
    - Tag firing errors
    - Unusual event patterns

### Search Console Monitoring

- [ ] **Weekly Search Console Review**
  - Check indexation status
  - Monitor search impressions
  - Review Core Web Vitals
  - Check for crawl errors

- [ ] **Submit New Pages**
  - After deploying new pages
  - Manually request indexing in Search Console
  - Monitor crawl status

---

## Phase 7: Scaling & Optimization 🚀

### Server-Side Event Tracking

- [ ] **Implement Measurement Protocol** (for high-volume events)
  - Create API route `/api/analytics/track`
  - Use GA4 Measurement Protocol for server-side events
  - Handle attendance records at scale

### Performance Optimization

- [ ] **Enable Data Sampling** (if exceeding GA4 limits)
  - GA4 samples data at 500K+ events/month
  - Configure sampling in GA4 settings

- [ ] **Filter Internal Traffic**
  - GA4 → Admin → Data Filters
  - Exclude admin/testing traffic
  - Filter localhost traffic

- [ ] **Implement Event Batching**
  - Send multiple events in one request
  - Reduce payload to improve performance

### Cost Optimization

- [ ] **Monitor GA4 Quota**
  - Check events consumed
  - Optimize event firing
  - Remove unnecessary events

- [ ] **Set Up Alerts**
  - Alert on abnormal traffic patterns
  - Alert on data discrepancies
  - Set up budget alerts in Search Console

---

## Phase 8: Compliance & Privacy 🔒

- [ ] **Privacy Policy**
  - Add Google Analytics disclosure
  - Explain data collection practices
  - Link from footer to privacy policy

- [ ] **Cookie Consent**
  - Implement cookie consent banner
  - Allow users to opt-out of tracking
  - Respect user preferences

- [ ] **GDPR Compliance** (if serving EU students/staff)
  - Enable IP anonymization
  - Get explicit consent before tracking
  - Allow data deletion requests
  - Document data retention policy

- [ ] **Local Regulations**
  - Check Pakistan data protection laws
  - Ensure PESB (Punjab Education Standards Board) compliance
  - Document consent mechanisms

---

## Phase 9: Documentation & Training 📚

- [ ] **Create Internal Wiki**
  - Document custom events
  - Provide access instructions
  - Create role-based dashboards

- [ ] **Train Stakeholders**
  - School administration: Financial dashboards
  - Teachers: Engagement metrics
  - IT team: Setup & maintenance

- [ ] **Create Run Books**
  - How to view reports
  - How to troubleshoot common issues
  - How to add new events

- [ ] **Schedule Reviews**
  - Weekly: Quick data check
  - Monthly: Detailed analysis
  - Quarterly: Strategy review

---

## Phase 10: Advanced Features (Optional) 🔧

### UTM Tracking

- [ ] **Campaign Tracking**
  - Add UTM parameters to external links
  - Track campaigns from Facebook, email, etc.
  - Example: `?utm_source=facebook&utm_medium=social&utm_campaign=enrollment`

### Custom Events

- [ ] **Biometric Authentication**
  - Track biometric auth success rate
  - Monitor failures for security analysis

- [ ] **Class Sync Events**
  - Track attendance sync success/failures
  - Monitor data migration events

- [ ] **API Performance**
  - Track API latency
  - Monitor error rates
  - Identify bottlenecks

### Audience Segments

- [ ] **Create Audiences in GA4**
  - High engagement students
  - Inactive students (for re-engagement)
  - By role (student, teacher, admin, parent)
  - By class/grade level

---

## Troubleshooting 🔧

### Events Not Showing in GA4
1. Check browser console: `window.dataLayer` should have events
2. Verify GA4 Measurement ID is correct
3. Check GTM container ID (if using GTM)
4. Allow 24-48 hours for new events to appear
5. Check if IP is filtered in GA4

### GTM Container Not Loading
1. Verify `GTM_CONTAINER_ID` env var is set
2. Check `<GoogleTagManager containerID={...} />` is in layout
3. Verify container is published in GTM
4. Check browser console for errors: `window.gtag` should exist

### Search Console Not Indexing Pages
1. Verify domain in Search Console
2. Submit sitemap: `https://msns.edu.pk/sitemap.xml`
3. Check for robots.txt blocking
4. Review crawl errors in Search Console
5. Allow 1-2 weeks for indexing

### Low Event Volume
1. Verify hooks are called in component
2. Check `window.dataLayer` exists
3. Verify GTM tags are properly triggered
4. Test with GTM Preview mode
5. Check for ad blockers blocking analytics

---

## Success Metrics 📊

Track these KPIs to measure success:

- [ ] **Search Console**
  - Organic impressions: 1000+ monthly
  - Click-through rate: > 5%
  - Average position: < 15

- [ ] **GA4**
  - Daily active users: baseline established
  - Session duration: > 3 minutes
  - Bounce rate: < 40%
  - Conversion rate: > 2%

- [ ] **Event Tracking**
  - Attendance events: 100% capture rate
  - Assignment submissions: 95%+ tracked
  - Exam completions: 100% tracked
  - Fee payments: 100% conversion tracked

---

## Support Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GTM Documentation](https://support.google.com/tagmanager/answer/6103696)
- [Search Console Help](https://support.google.com/webmasters/)
- [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)

---

**Last Updated:** April 8, 2026
**Status:** Ready for Implementation
**Next Review:** May 8, 2026
