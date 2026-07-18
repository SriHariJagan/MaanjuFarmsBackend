# Backend Audit Report — Maanjoo Farms

**Audit Date:** July 18, 2026
**Auditor:** Automated Code Analysis

---

## Executive Summary

This project is a functional e-commerce + villa booking backend built with Express 5 and MongoDB. It supports product ordering, villa reservations, Razorpay payments, email notifications, pincode validation, and admin management.

While the core functionality works for a demo/prototype, the codebase has **critical security vulnerabilities**, **missing production requirements**, and **architectural issues** that must be addressed before deployment to production.

---

## Scores

| Category | Score | Assessment |
|---|---|---|
| **Architecture** | 5/10 | Functional but lacks separation of concerns, no service layer |
| **Security** | 3/10 | Critical JWT secret exposure, no rate limiting, no helmet |
| **Performance** | 4/10 | No pagination on products, blocking email sends, N+1 queries |
| **Code Quality** | 5/10 | Dead files, inconsistent error formats, large controllers |
| **Scalability** | 3/10 | Local file storage, no caching, no queue system |
| **Maintainability** | 4/10 | No tests, no TypeScript, inconsistent patterns |
| **Documentation** | 0/10 → 8/10 (after this audit) | Previously undocumented |
| **Production Readiness** | 2/10 | Missing Docker, PM2, logging, monitoring, health checks |

---

## Critical Issues (Fix Immediately)

1. **Weak JWT Secret** — `JWT_SECRET=superSecretKeyChangeThis` — Token forgery possible
2. **Email Credentials in .env** — Gmail app password in plaintext
3. **No Rate Limiting** — Login brute force attack possible
4. **Missing `axios` Dependency** — `npm install` breaks pincode validation
5. **Admin by Email** — Anyone registering with `ADMIN_EMAIL` becomes admin

---

## High Priority Issues

1. **No Helmet** — Missing security headers (XSS, clickjacking, MIME sniffing)
2. **CORS Wide Open** — No origin restriction
3. **Error Messages Leak Internals** — Stack traces in production responses
4. **No Input Validation** — No validation library, open to injection
5. **File Upload MIME Spoofing** — Only checks Content-Type header
6. **No CSRF Protection**
7. **Webhook Booking Bug** — `findOneAndUpdate` result not captured (line 302, webhookController.js)
8. **Villa Booking Email Bug** — References `data.address.email` which doesn't exist for bookings

---

## Medium Priority Issues

1. **No Pagination on Products** — All products returned at once
2. **No Search/Filter on Products** — Frontend must filter client-side
3. **Booking Cancel Doesn't Unblock Room**
4. **No Order Cancel Endpoint** — Stock never restored
5. **No Token Blacklist** — Tokens valid until expiry
6. **No Password Strength Validation**
7. **Seed Scripts Broken** — Empty MONGO_URI strings
8. **`crypto` npm Package** — Unnecessary (use Node built-in)
9. **Services/mailService.js Empty** — Dead file
10. **Old Email Templates Not Imported** — Dead files
11. **`generateInvoice.js` Unused** — Dead code

---

## Low Priority Issues

1. **Test pincode endpoint** — Remove or guard with NODE_ENV
2. **Inconsistent error response format** — `msg` vs `message` vs `error`
3. **`routers/` typo** — Should be `routes/`
4. **`readme` file** — Contains outdated Stripe command

---

## Quick Wins

| Fix | Effort | Impact | File |
|---|---|---|---|
| Add `axios` to package.json | 1 min | Critical (prevents crash) | package.json |
| Change JWT secret | 1 min | Critical | .env |
| Remove `crypto` from deps | 1 min | Low | package.json |
| Add pagination to products | 1 hour | High | productController.js |
| Add `.lean()` to read queries | 15 min | Medium | All controllers |
| Add compression middleware | 5 min | Medium | index.js |
| Delete dead files | 5 min | Medium | services/mailService.js, old templates |
| Restrict CORS origin | 5 min | High | index.js |
| Add helmet | 5 min | High | index.js |

---

## Final Verdict

### ❌ Not Production Ready

The application has **critical security vulnerabilities** and **missing production requirements**. It is suitable for **development and local testing** only.

### Estimated Effort for Production Readiness

| Phase | Effort | Description |
|---|---|---|
| Critical fixes | 2-4 hours | JWT, rate limiting, axios, admin role |
| Security hardening | 4-8 hours | Helmet, CORS, input validation, CSRF |
| Performance | 4-8 hours | Pagination, async emails, N+1 fixes |
| Production infra | 8-16 hours | Docker, PM2, logging, monitoring, health checks |
| Testing | 16-40 hours | Unit tests, integration tests, E2E |
| Documentation | Already complete | This audit + all generated docs |

**Total estimated effort: ~2-5 days for a single developer**
