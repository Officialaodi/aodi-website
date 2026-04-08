# Email Feature Plan — Brevo Integration
**AODI Platform · Full Email Capability**

---

## Implementation Status Legend
- ✅ Complete and tested
- ⚠️ Partial / needs review
- ❌ Not yet built

---

## 1. Current State (Before This Sprint)

| Area | Status | Notes |
|------|--------|-------|
| Transactional email | ⚠️ Partial | Used SendGrid API — key not set, no emails sending |
| Password reset email | ❌ Not built | Token flow correct, but email delivery was a TODO comment |
| Application acknowledgment | ❌ Missing | No confirmation email to applicants |
| Admin → contact email | ⚠️ Partial | Route existed but pointed to SendGrid |
| CRM inbox (IMAP sync) | ⚠️ Partial | Infrastructure existed, required external IMAP/SMTP credentials |
| Email templates | ✅ Schema + UI exist | `email_templates` table and UI in place |
| Email logs | ✅ Schema exists | `email_logs` table records outbound history |
| Newsletter | ❌ Subscriber table only | `newsletter_subscribers` table stored sign-ups, nothing sent |

---

## 2. What We Built

### 2.1 Brevo Core Integration ✅ COMPLETE

Created `apps/web/src/lib/brevo.ts` — single module all email features use.

**Implemented functions:**
- ✅ `sendBrevoEmail(params)` — raw Brevo API send
- ✅ `sendPasswordResetEmail(to, name, resetUrl)` — dedicated reset helper
- ✅ `sendApplicationAcknowledgement(type, to, name, payload)` — applicant confirmation
- ✅ `sendAdminNotification(type, submitterName, email, payload)` — admin alert on new form
- ✅ `sendNewsletterEmail(to, subject, htmlBody, unsubscribeToken)` — newsletter send
- ✅ `sendCustomEmail(params)` — admin manual send with CC/BCC support
- ✅ `syncContactToBrevo(email, name, attributes)` — add/update contact in Brevo lists
- ✅ `logEmail(params)` — logs every sent email to `email_logs`

**Environment variables:** `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` — all set in Replit Secrets.

---

### 2.2 Password Recovery Email ✅ COMPLETE

- ✅ `POST /api/admin/forgot-password/route.ts` — wired to `sendPasswordResetEmail()` (replaced TODO comment)
- ✅ Branded HTML email with AODI colours (green `#0F3D2E`, gold `#C9A24D`)
- ✅ "Reset Password" button with 1-hour expiry notice
- ✅ Falls back to console log if `BREVO_API_KEY` not set (dev workflow intact)

---

### 2.3 Application Acknowledgement Emails ✅ COMPLETE

- ✅ Mentor, Mentee, Volunteer, Partner, EmpowerHer, Campus Ambassador, STEM, Partner Africa, ChemBridge 2026 — all send applicant confirmation on submit
- ✅ Dynamic form route sends `Thank you for your submission` confirmation
- ✅ Contact form sends auto-reply
- ✅ Admin notification email migrated from SendGrid → Brevo on all routes
- ✅ Per-form personalised subject lines and branded HTML body

---

### 2.4 Admin Email Composer ✅ COMPLETE

**File:** `apps/web/src/components/admin/EmailComposer.tsx`

- ✅ Template selection dropdown — picks from saved `email_templates`, variables substituted before sending
- ✅ Recipient search/autocomplete — searches `contacts` and `applications` tables, shows source badge
- ✅ CC/BCC fields — expandable via toggle button (`data-testid="button-toggle-ccbcc"`)
- ✅ CC/BCC passed through to Brevo API correctly
- ✅ Every sent email logged to `email_logs` table
- ✅ Send success/failure feedback shown in modal
- ✅ "Send Email" shortcut tab on each application card in `ApplicationCRMPanel`
- ✅ "Reply" button on each contact submission row in admin Contacts tab (pre-fills recipient)

---

### 2.5 CRM Bulk Email ✅ COMPLETE

- ✅ "Send Email" toolbar action in Applications list when one or more rows are selected (`data-testid="button-bulk-email"`)
- ✅ Bulk email iterates through selected applicants — opens `EmailComposer` for each, user composes and sends one at a time (explicit, deliberate — no accidental mass sends)
- ✅ Reply button on each contact submission (pre-fills recipient from contact record)
- ✅ Each send logged individually in `email_logs`

---

### 2.6 Newsletter Send ✅ COMPLETE

**Files:** `NewsletterManager.tsx`, `POST /api/admin/newsletter/send/route.ts`

- ✅ Newsletter composer in admin portal under "Newsletter" tab (subject, rich text body, preview)
- ✅ Send to all active subscribers via Brevo
- ✅ Test mode — send to a single test email before broadcasting
- ✅ Unsubscribe link auto-appended to every newsletter (GDPR)
- ✅ Subscribers synced to Brevo contact list on sign-up (`syncContactToBrevo()` called in `/api/newsletter/route.ts`)
- ✅ Unsubscribe route at `/api/newsletter/unsubscribe/route.ts`

---

### 2.7 CRM IMAP Inbox ✅ COMPLETE

**File:** `apps/web/src/components/admin/CRMInbox.tsx`

- ✅ Reply button on each email — opens `EmailComposer` pre-filled with `Re: {subject}`
- ✅ Mark as read / unread toggle (`data-testid="button-toggle-read"`)
- ✅ Link/unlink email thread to application or contact record manually (`data-testid="button-link-entity"`, `"button-unlink-entity"`)
- ✅ Thread view — groups emails by sender (`data-testid="button-thread-view"`)
- ✅ CRM filter — shows only linked emails (`data-testid="button-linked-only"`)
- ✅ Account filter dropdown
- ✅ Brevo SMTP relay added as a provider option in `email-sync.ts` (host: `smtp-relay.brevo.com`, port 587)

---

### 2.8 Email Templates Manager ✅ COMPLETE

**File:** `apps/web/src/components/admin/EmailTemplatesManager.tsx`

- ✅ Wired into admin email composer — template dropdown populates subject + body
- ✅ Variable substitution engine (`email-templates.ts`): `{{name}}`, `{{firstName}}`, `{{email}}`, `{{applicationType}}`, `{{date}}`, `{{adminDashboardUrl}}`, etc.
- ✅ Preview pane shows rendered template with sample variables
- ✅ "Seed System Templates" button creates 8 built-in templates automatically:
  - `password-reset`
  - `application-received`
  - `application-mentor` / `application-mentee` / `application-volunteer`
  - `admin-notification`
  - `newsletter`
  - `contact-autoreply`
- ✅ Categories: application, notification, newsletter, system, general, donation
- ✅ Edit + Preview tabs in template form dialog
- ✅ `brevo_template_id` column added to `email_templates` table for future Brevo native template sync

---

## 3. Database Changes ✅ COMPLETE

| Table | Change | Status |
|-------|--------|--------|
| `email_logs` | `contact_id`, `error_message`, `brevo_message_id` columns | ✅ Done |
| `newsletter_subscribers` | `brevo_contact_id`, `unsubscribed_at`, `source` columns | ✅ Done |
| `email_templates` | `brevo_template_id` column | ✅ Done |

`npm run db:push` — run and changes applied. ✅

---

## 4. New Files Created ✅

```
apps/web/src/lib/brevo.ts                                  ✅ Core Brevo module
apps/web/src/lib/email-templates.ts                        ✅ Variable substitution helpers + system templates
apps/web/src/app/api/admin/newsletter/send/route.ts        ✅ Newsletter send endpoint
apps/web/src/app/api/newsletter/unsubscribe/route.ts       ✅ Public unsubscribe handler
apps/web/src/components/admin/EmailComposer.tsx            ✅ Reusable compose modal
apps/web/src/components/admin/NewsletterManager.tsx        ✅ Newsletter admin UI
apps/web/src/app/api/admin/email-templates/seed/route.ts   ✅ Seed system templates endpoint
```

---

## 5. Files Modified ✅

```
apps/web/src/lib/email-sync.ts                             ✅ Brevo SMTP relay added as provider
apps/web/src/app/api/admin/forgot-password/route.ts        ✅ TODO replaced with Brevo send
apps/web/src/app/api/admin/send-email/route.ts             ✅ CC/BCC support added; Brevo wired
apps/web/src/app/api/applications/*/route.ts               ✅ Acknowledgement emails on all 9 routes
apps/web/src/app/api/forms/[slug]/submit/route.ts          ✅ Acknowledgement email for dynamic forms
apps/web/src/app/api/contact/route.ts                      ✅ Auto-reply added
apps/web/src/app/api/newsletter/route.ts                   ✅ Brevo contact sync on subscribe
apps/web/src/lib/schema.ts                                 ✅ All new columns added
apps/web/src/components/admin/ApplicationCRMPanel.tsx      ✅ "Send Email" tab on each application
apps/web/src/components/admin/CRMInbox.tsx                 ✅ Reply, read/unread, link/unlink, thread view
apps/web/src/components/admin/EmailTemplatesManager.tsx    ✅ Preview pane, seed button, categories
apps/web/src/app/admin/page.tsx                            ✅ EmailComposer imported; bulk email button; contact reply button
```

---

## 6. Environment Variable Checklist

| Variable | Status |
|----------|--------|
| `BREVO_API_KEY` | ✅ Set in Replit Secrets |
| `BREVO_SENDER_EMAIL` | ✅ Set in Replit Secrets |
| `BREVO_SENDER_NAME` | ✅ Set in Replit Secrets |
| `NEXT_PUBLIC_BASE_URL` | ⚠️ Needed for reset links — verify it is set on Vercel |
| `SENDGRID_API_KEY` | ❌ Can be removed — no longer used |

**Note:** `BREVO_SENDER_EMAIL` must be a verified sender in your Brevo account. Go to Brevo → Senders & IPs → Add a new sender and verify the domain `africaofourdreaminitiative.org` via DNS (TXT + DKIM records in Namecheap/Vercel DNS).

---

## 7. Brevo Account Setup Steps (Required for Live Email Delivery)

1. Create account at [brevo.com](https://brevo.com) (free tier: 300 emails/day, unlimited contacts)
2. Go to **Settings → API Keys** → Create a new API key → set as `BREVO_API_KEY`
3. Go to **Senders & IPs → Domains** → Add `africaofourdreaminitiative.org` → follow DNS verification
4. Create a **Contact List** called "AODI Newsletter Subscribers"
5. Optionally create a **Contact List** called "AODI Applicants" for CRM contacts

---

## 8. Out of Scope

- Brevo marketing campaigns (separate from transactional — would need campaign API)
- SMS notifications
- Email open/click webhooks to AODI database (Brevo dashboard handles tracking natively)
- Automated email sequences / drip campaigns
- Brevo native template sync (`brevo_template_id` column is in place for future use)

---

*All planned email features are now implemented. The platform is fully Brevo-powered for transactional email, newsletter, CRM inbox, and admin compose workflows.*
