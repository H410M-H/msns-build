# LMS RBAC Dashboard Rollout Checklist

## Pre-Deployment Testing (Before npm run build)
- [ ] Verify all file paths are correct
- [ ] Check all imports are available and properly named
- [ ] Ensure no circular dependencies
- [ ] Validate Tailwind CSS class names
- [ ] Check responsive breakpoints on target devices

## Build & Deployment
- [ ] Run `npm run check` - TypeScript and linting
- [ ] Run `npm run build` - Production build verification
- [ ] Run `npm run dev` - Development server testing
- [ ] Verify no console errors in browser DevTools
- [ ] Test Lighthouse performance scores
- [ ] Check lighthouse accessibility scores (target: 90+)

## Dashboard Testing by Role

### Admin Dashboard Testing
- [ ] Load admin dashboard successfully
- [ ] All statistics display correctly
- [ ] Tabs switch without errors (Management, Events, Analytics)
- [ ] Mobile responsive (test on mobile browser)
- [ ] Quick actions navigate correctly
- [ ] EventsTable lazy loads properly

### Teacher Dashboard Testing
- [ ] Load teacher dashboard successfully
- [ ] Quick actions visible and functional
- [ ] Academic overview displays
- [ ] Tabs (My Classes, Attendance, Schedule) switch properly
- [ ] Mobile responsive (test on mobile browser)
- [ ] Links to attendance, marks, diaries, timetable work
- [ ] Skeleton loader displays while loading events

### Clerk Dashboard Testing
- [ ] Load clerk dashboard successfully
- [ ] Finance dashboard displays with both tabs
- [ ] Transaction table shows data correctly
- [ ] Quick fee collection input works
- [ ] Monthly collection targets display
- [ ] Default analysis cards show data
- [ ] ExpensesTable lazy loads and displays (KEY TEST)
- [ ] Mobile responsive (test on mobile browser)

### Student Dashboard Testing
- [ ] Load student dashboard successfully
- [ ] Academic progress shows with bars
- [ ] Upcoming tasks display correctly
- [ ] Quick access buttons navigate properly
- [ ] Fee status alert displays
- [ ] Attendance and subjects tabs work
- [ ] Mobile responsive (test on mobile browser)
- [ ] Report card link works

### Principal Dashboard Testing
- [ ] Load principal dashboard successfully
- [ ] Overview tab displays stats
- [ ] Academic tab shows class information
- [ ] Calendar tab displays events
- [ ] Mobile responsive (test on mobile browser)

### Head Dashboard Testing
- [ ] Load head dashboard successfully
- [ ] Department overview displays
- [ ] Management tab accessible
- [ ] Events tab shows events
- [ ] Mobile responsive (test on mobile browser)

## Cross-Browser Testing
- [ ] Chrome/Chromium (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (if macOS available)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

## Responsive Design Testing
- [ ] Mobile (320px-480px)
- [ ] Tablet (481px-768px)
- [ ] Desktop (769px-1024px)
- [ ] Large Desktop (1025px+)

## Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Lazy loading components load on scroll
- [ ] No memory leaks in Chrome DevTools
- [ ] CPU usage stays low during interactions

## Accessibility Testing
- [ ] Tab navigation works throughout
- [ ] Screen reader announces component text
- [ ] Color contrast ratios meet WCAG AA
- [ ] All images have alt text
- [ ] Keyboard accessible forms and buttons
- [ ] Focus indicators visible

## Code Quality
- [ ] No TypeScript errors in console
- [ ] No console.error() messages
- [ ] No console.warn() messages (except third-party)
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting consistent

## Security Testing
- [ ] No sensitive data in client-side code
- [ ] Authentication checks present
- [ ] Session management working
- [ ] HTTPS enforced in production
- [ ] CSRF protection enabled

## Data Integration Testing
- [ ] Mock data displays correctly
- [ ] Real API calls work when integrated
- [ ] Error handling displays properly
- [ ] Loading states show correctly
- [ ] Empty states handled gracefully

## Internationalization (Future)
- [ ] Text strings can be easily translated
- [ ] Date formats are locale-aware
- [ ] Number formatting is locale-aware
- [ ] RTL support considered for future

## Documentation
- [ ] Code comments are clear
- [ ] Component props documented
- [ ] API endpoints documented
- [ ] Deployment steps documented
- [ ] Troubleshooting guide created

## Post-Deployment Monitoring
- [ ] Application errors monitored
- [ ] Performance metrics tracked
- [ ] User feedback collected
- [ ] Bug reports tracked
- [ ] Performance degradation alerts set

## Bug Fixes Applied Before This Checklist
✓ ExpensesTable default export added
✓ ClassDiariesTab type errors fixed
✓ ClassAttendanceTab unused import removed
✓ SubjectDiary router type issues resolved

## Known Issues & Workarounds
1. Mock data is used for all dashboards - needs real API integration
2. File upload functionality requires GCP configuration
3. PDF generation requires pdf-lib setup
4. Email notifications require SMTP configuration

## Deployment Commands
```bash
# Install dependencies
npm install

# Run type checking and linting
npm run check

# Build for production
npm run build

# Start production server
npm start

# Development mode
npm run dev
```

## Rollback Plan
If issues occur in production:
1. Switch to previous version using git revert
2. Restart application
3. Clear browser cache and CDN cache
4. Monitor error logs for root cause
5. Deploy hotfix once identified

## Sign-Off
- [ ] Development Lead
- [ ] QA Lead
- [ ] DevOps Lead
- [ ] Product Owner

---
Date of Implementation: 2026-02-27
Version: 1.4
Status: Ready for Testing
