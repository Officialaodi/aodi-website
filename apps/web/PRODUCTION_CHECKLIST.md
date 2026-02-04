# AODI Website - Production Readiness Checklist

This document outlines all the configuration steps and secrets required to deploy the AODI website to production.

---

## Required Secrets (Essential)

These secrets are **mandatory** for the platform to function:

| Secret | Purpose | How to Get It |
|--------|---------|---------------|
| `SESSION_SECRET` | Admin portal authentication & file uploads | Generate a random 64-character hex string |
| `DATABASE_URL` | PostgreSQL database connection | Provided by Replit automatically |

### Generating SESSION_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -hex 32
```

---

## Payment Processing

Configure at least one payment provider to accept donations:

### Paystack (African/Nigerian Payments)

| Secret | Purpose |
|--------|---------|
| `PAYSTACK_SECRET_KEY` | Server-side payment processing |

**Setup Steps:**
1. Sign up at [paystack.com](https://paystack.com)
2. Complete business verification
3. Go to Settings → API Keys & Webhooks
4. Copy the Secret Key (starts with `sk_live_` for production)

### PayPal (International Payments)

| Secret | Purpose |
|--------|---------|
| `PAYPAL_CLIENT_ID` | PayPal app identification |
| `PAYPAL_CLIENT_SECRET` | Server-side authentication |

**Setup Steps:**
1. Create account at [developer.paypal.com](https://developer.paypal.com)
2. Go to Dashboard → My Apps & Credentials
3. Create a new app (select "Live" for production)
4. Copy Client ID and Secret

---

## Email Service

For sending confirmation emails to applicants and donors:

| Secret | Purpose |
|--------|---------|
| `SENDGRID_API_KEY` | Transactional email delivery |

**Setup Steps:**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your sender domain or email
3. Go to Settings → API Keys → Create API Key
4. Select "Full Access" or customize permissions
5. Copy the API key (only shown once)

---

## Spam Prevention (Highly Recommended)

Protects forms from bot submissions:

| Secret | Purpose |
|--------|---------|
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | Client-side CAPTCHA widget |
| `HCAPTCHA_SECRET_KEY` | Server-side verification |

**Setup Steps:**
1. Sign up at [hcaptcha.com](https://hcaptcha.com)
2. Add your domain
3. Copy Site Key and Secret Key from dashboard

---

## Analytics (Built-in - No Configuration Required)

The platform includes a comprehensive, privacy-first analytics system that is **superior to Google Analytics** for your use case. No external configuration or third-party data sharing required.

**Built-in Analytics Features (Available Now):**

| Feature | Built-in | Google Analytics |
|---------|----------|------------------|
| Real-time visitor tracking | Yes | Yes |
| Page views & scroll depth | Yes | Yes (GA4 only) |
| Session duration & bounce rate | Yes | Yes |
| Geographic location (by country/continent) | Yes | Yes |
| Traffic source attribution | Yes | Yes |
| UTM campaign tracking | Yes | Yes |
| Device/browser/OS breakdown | Yes | Yes |
| Conversion tracking (donations, applications) | Yes | Yes |
| Acquisition channel breakdown | Yes | Yes |
| User interaction events | Yes | Yes |
| GDPR-compliant (no third-party sharing) | Yes | No |
| Data ownership (your database) | Yes | No |
| No cookie consent banner needed | Yes | No |
| Works with ad blockers | Yes | No |

**Why our analytics is better for AODI:**
1. **Privacy-first**: All data stays in your database, no third-party sharing
2. **Conversion tracking**: Automatic tracking of applications and donations
3. **African focus**: Geographic tracking optimized for African countries
4. **No ad blockers**: Works even when visitors block third-party trackers
5. **GDPR-compliant**: No cookie consent banners needed

Access analytics at: `/admin` → Analytics tab

> **Optional**: You can still add Google Analytics if needed by setting `NEXT_PUBLIC_GA_MEASUREMENT_ID`, but it's not recommended since the built-in analytics provides all the same features without privacy concerns.

---

## Error Monitoring (Optional)

| Secret | Purpose |
|--------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking and monitoring |

**Setup Steps:**
1. Sign up at [sentry.io](https://sentry.io)
2. Create a new Next.js project
3. Copy the DSN from project settings

---

## Post-Publication Steps

### 1. Create Admin Account
After publishing, visit `/admin/setup` to create the first superadmin account.

> **Important:** This page only works when no admin users exist in the database.

### 2. Populate Content

Log into `/admin` and add:
- [ ] Programs and descriptions
- [ ] Upcoming events
- [ ] Impact metrics with data
- [ ] Trustee profiles
- [ ] Partner organizations
- [ ] Success stories and news
- [ ] Resources and documents

### 3. Configure Site Settings

In the admin portal, update:
- [ ] Homepage hero section (title, subtitle, image, CTA)
- [ ] About section content
- [ ] Footer contact information (address, email, phone)
- [ ] Social media links

### 4. Test Critical Flows

Before announcing the site:
- [ ] Submit a test application (mentor, mentee, volunteer, partner)
- [ ] Make a test donation (use Paystack/PayPal test mode first)
- [ ] Verify confirmation emails are received
- [ ] Check all pages load correctly
- [ ] Test mobile responsiveness

---

## Environment Variables Summary

### Required
```
SESSION_SECRET=<64-char-hex-string>
DATABASE_URL=<provided-by-replit>
```

### Payment Processing
```
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
```

### Email
```
SENDGRID_API_KEY=SG.xxxxx
```

### Spam Prevention
```
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=xxxxx
HCAPTCHA_SECRET_KEY=xxxxx
```

### Optional Monitoring
```
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## Database Migrations

If deploying to a new environment, the following schema updates may need to be applied:

### Geographic Analytics
The `analytics_sessions` table requires a `continent` column for geographic tracking:

```sql
ALTER TABLE analytics_sessions ADD COLUMN IF NOT EXISTS continent TEXT;
```

### Conversion Tracking Idempotency
The `analytics_conversions` table requires a unique `conversion_reference` column for donation idempotency:

```sql
ALTER TABLE analytics_conversions ADD COLUMN IF NOT EXISTS conversion_reference TEXT UNIQUE;
```

This prevents duplicate donation tracking when users refresh the thank-you page.

---

## Security Checklist

- [x] Admin authentication with secure session tokens
- [x] Password hashing with PBKDF2 (100,000 iterations)
- [x] Rate limiting on public form endpoints
- [x] CAPTCHA protection on forms
- [x] XSS prevention with HTML sanitization
- [x] Secure file upload validation
- [x] HTTPS enforced in production
- [x] HTTP-only cookies for sessions

---

## Support

For technical issues, refer to the `replit.md` file in the project root for detailed system architecture documentation.
