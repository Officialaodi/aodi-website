# Email Feature Plan — Brevo Integration
**AODI Platform · Full Email Capability**

---

## 1. Current State

| Area | Status | Notes |
|------|--------|-------|
| Transactional email | ⚠️ Partial | Uses SendGrid API — key not set in Replit secrets, so no emails are sending |
| Password reset email | ❌ Not built | Token is generated and stored correctly, but email delivery is a TODO comment |
| Application acknowledgment | ❌ Missing | No confirmation email goes to the person who submits a form |
| Admin → contact email | ⚠️ Partial | `POST /api/admin/send-email` exists but points to SendGrid |
| CRM inbox (IMAP sync) | ⚠️ Partial | Full sync infrastructure exists (`email_accounts`, `synced_emails`) but requires external IMAP/SMTP credentials |
| Email templates | ✅ Schema + UI exist | `email_templates` table and `EmailTemplatesManager` component are in place |
| Email logs | ✅ Schema exists | `email_logs` table records outbound history |
| Newsletter | ❌ Subscriber table only | `newsletter_subscribers` table stores sign-ups but nothing sends |

**Why replace SendGrid with Brevo:**
- Brevo offers a generous free tier (300 emails/day vs. SendGrid's 100/day)
- Single SDK covers transactional email, marketing campaigns, contact lists, and SMTP relay
- Built-in contact database maps directly to AODI's CRM contacts
- Better support for template management via API
- SMTP relay works as a drop-in replacement for the IMAP/SMTP send path

---

## 2. What We Are Building

### 2.1 Brevo Core Integration
Replace SendGrid with the official Brevo Node.js SDK (`@getbrevo/brevo`). Create a single `apps/web/src/lib/brevo.ts` module that all email-sending features call.

**New environment variables needed:**
```
BREVO_API_KEY          — Brevo API key (from Brevo dashboard → API Keys)
BREVO_SENDER_EMAIL     — Verified sender address (e.g. noreply@africaofourdreaminitiative.org)
BREVO_SENDER_NAME      — Display name (e.g. AODI)
NEXT_PUBLIC_BASE_URL   — Already used; ensures reset links work on all environments
```

**Core module will expose:**
- `sendTransactionalEmail(to, subject, htmlBody, textBody?)` — raw send
- `sendTemplateEmail(to, templateId, params)` — Brevo template-based send
- `sendPasswordResetEmail(to, name, resetUrl)` — dedicated reset helper
- `sendApplicationAcknowledgement(type, to, name, payload)` — applicant confirmation
- `sendAdminNotification(type, submitterName, email, payload)` — admin alert on new form
- `sendBulkEmail(contacts[], subject, htmlBody)` — loop-based send for CRM bulk actions
- `syncContactToBrevo(email, name, attributes)` — add/update contact in Brevo lists

---

### 2.2 Password Recovery Email *(Critical — currently broken)*

**What exists:** The full token flow is implemented (`/admin/forgot-password` page → API generates token → stores in `password_reset_tokens` → `/admin/reset-password` verifies and updates hash). The only missing piece is the actual email delivery.

**What to build:**
- In `POST /api/admin/forgot-password/route.ts`, replace the `// TODO` comment with a call to `sendPasswordResetEmail()`
- Design a clean branded HTML email with AODI colours containing the reset button/link
- Token expires in 1 hour (already implemented)
- If Brevo key is not set, fall back to logging the URL (keeps dev workflow intact)

**Email content:**
- Subject: `Reset your AODI admin password`
- Body: greeting, 1-hour warning, prominent "Reset Password" button, security note

---

### 2.3 Application Acknowledgement Emails *(New)*

Currently, when someone submits a mentor, mentee, volunteer, partner, EmpowerHer, Campus Ambassador, STEM, ChemBridge, or dynamic form — they receive no confirmation. This needs to change.

**What to build:**
- After each successful form submission (all 10 application routes + dynamic form route), send a confirmation email to the applicant
- Also send the existing admin notification email (migrate from SendGrid to Brevo)
- Template varies by form type — personalised subject and body reflecting what they applied for

**Per-form subject lines:**
| Form | Subject |
|------|---------|
| Mentor | `Thank you for applying to mentor with AODI` |
| Mentee | `Your AODI mentee application has been received` |
| Volunteer | `Thank you for volunteering with AODI` |
| Partner | `Thank you for your partnership enquiry` |
| EmpowerHer | `Your EmpowerHer application is confirmed` |
| Campus Ambassador | `Your Campus Ambassador application is confirmed` |
| STEM Workshops | `Your STEM workshop interest has been noted` |
| Partner Africa | `Your Partner Africa application has been received` |
| ChemBridge 2026 | `ChemBridge 2026 — Your registration is confirmed` |
| Dynamic forms | `Thank you for your submission` |
| Contact form | `We've received your message` |

**Email body elements:**
- AODI branding header (green/gold)
- Personalised greeting with first name
- Clear confirmation of what was submitted
- Expected next steps / timeline
- Contact email for queries
- Unsubscribe notice (GDPR compliance)

---

### 2.4 Admin Email Composer *(Upgrade existing)*

The `/api/admin/send-email` route exists and the UI to call it is in the admin panel. Currently it points to SendGrid.

**What to build:**
- Migrate the route to use Brevo instead of SendGrid
- Add template selection — admin picks from saved `email_templates`, variables are substituted before sending
- Add recipient search — admin types a name/email and gets autocomplete from `contacts` and `applications` tables
- CC/BCC fields
- Log every sent email to `email_logs` (already structured correctly)
- Show send status (success/failure) in the UI
- Add "Send to applicant" shortcut button on each application card in the CRM panel (pre-fills recipient from application record)
- Add "Reply" button on each contact entry (pre-fills recipient from contact record)

---

### 2.5 CRM Bulk Email *(New)*

Allow admins to email multiple contacts/applicants at once.

**What to build:**
- "Send Email" toolbar action in the Applications list when one or more rows are selected
- "Bulk Email" action in the Contacts list
- A modal with: subject line, body (rich text), preview of recipients
- Rate-limited sending (Brevo transactional API, not campaign — stays within free tier)
- All sends logged individually in `email_logs`
- Progress indicator for large batches

---

### 2.6 Newsletter Send *(New)*

The `newsletter_subscribers` table stores sign-ups but nothing ever sends to them.

**What to build:**
- Newsletter composer in admin portal under a new "Newsletter" tab
- Subject, body (rich text via TipTap), preview
- Send to all active subscribers OR a filtered subset
- Sync subscribers to a Brevo contact list for deliverability (can also be used to manage unsubscribes)
- Unsubscribe link auto-appended to every newsletter (GDPR)
- Track opens/clicks via Brevo dashboard (no additional code needed — Brevo handles this)

---

### 2.7 CRM IMAP Inbox (Retain + Enhance)

The IMAP sync infrastructure is already built (`email-sync.ts`, `email_accounts` table, sync routes). This is independent of Brevo and is about *receiving* email into the CRM.

**Brevo SMTP Relay (replace IMAP outbound):**
- The `sendEmailViaAccount` function currently uses Nodemailer with user-supplied SMTP credentials
- Add Brevo SMTP as an option alongside the existing providers (host: `smtp-relay.brevo.com`, port 587)
- This gives admins the option to send via Brevo relay instead of personal mailboxes

**Inbox enhancements to build:**
- "Reply" button on each synced email — opens the email composer pre-filled with the thread context
- Mark as read / unread from UI (already tracked in `synced_emails.isRead`)
- Link/unlink an email thread to an application or contact record manually (in addition to the auto-link on sync)
- Display thread view when multiple emails share the same contact

---

### 2.8 Email Templates Manager (Enhance existing)

The schema and `EmailTemplatesManager.tsx` component exist. Currently templates are stored but not fully wired to the send flow.

**What to build:**
- Wire templates into the admin email composer (dropdown to select template)
- Variable substitution engine: `{{name}}`, `{{applicationType}}`, `{{date}}`, `{{adminDashboardUrl}}`, etc.
- Preview pane showing the rendered template with sample variables
- Brevo template sync option: push templates to Brevo for native tracking (optional advanced feature)
- Built-in system templates (created automatically on first run):
  - `password-reset` — for admin password recovery
  - `application-received` — generic applicant confirmation
  - `application-mentor` / `application-mentee` / etc. — per-type confirmations
  - `admin-notification` — new application alert for the team
  - `newsletter` — base newsletter layout

---

## 3. Database Changes

No new tables required. Minor additions to existing ones:

| Table | Change |
|-------|--------|
| `email_logs` | Add `contact_id integer` (link logs to contacts as well as applications), `error_message text` (capture failures), `brevo_message_id text` (for tracking lookups) |
| `newsletter_subscribers` | Add `brevo_contact_id text`, `unsubscribed_at timestamp`, `source text` (which page they signed up from) |
| `email_templates` | Add `brevo_template_id integer` (for synced templates) |

Run `npm run db:push` after schema changes.

---

## 4. New Files to Create

```
apps/web/src/lib/brevo.ts                          Core Brevo module (replaces email.ts)
apps/web/src/lib/email-templates.ts                Template variable substitution helpers
apps/web/src/app/api/admin/newsletter/route.ts     Newsletter send endpoint
apps/web/src/app/api/newsletter/unsubscribe/route.ts  Public unsubscribe handler
apps/web/src/components/admin/EmailComposer.tsx    Reusable compose modal (used in CRM + bulk)
apps/web/src/components/admin/NewsletterManager.tsx  Newsletter admin UI
```

---

## 5. Files to Modify

```
apps/web/src/lib/email.ts                          Rewrite to use Brevo instead of SendGrid
apps/web/src/lib/email-sync.ts                     Add Brevo SMTP as a relay provider option
apps/web/src/app/api/admin/forgot-password/route.ts   Replace TODO with Brevo send call
apps/web/src/app/api/admin/send-email/route.ts     Replace SendGrid with Brevo
apps/web/src/app/api/applications/*/route.ts       Add applicant acknowledgement email (all 9 routes)
apps/web/src/app/api/forms/[slug]/submit/route.ts  Add applicant acknowledgement email
apps/web/src/app/api/contact/route.ts              Add auto-reply to contact form submitter
apps/web/src/lib/schema.ts                         Add columns listed above
apps/web/src/components/admin/ApplicationCRMPanel.tsx  Add "Send Email" shortcut button
apps/web/src/components/admin/CRMInbox.tsx         Add Reply button + thread view
apps/web/src/components/admin/EmailTemplatesManager.tsx  Add preview + wire to composer
```

---

## 6. Build Order

The features should be built in this sequence to keep the site functional at every step:

1. **Brevo core module** (`brevo.ts`) — foundation everything else depends on
2. **Password reset email** — critical; currently broken in production
3. **Application acknowledgements** — high value, simple to add
4. **Admin notification migration** — move SendGrid → Brevo in existing routes
5. **Admin email composer upgrade** — template selection, recipient search
6. **CRM bulk email** — depends on composer component
7. **Newsletter send** — depends on Brevo contact list sync
8. **IMAP inbox enhancements** — reply button, thread view
9. **Template system upgrades** — preview, variable engine, system templates
10. **Schema additions** — `email_logs` columns, `newsletter_subscribers` columns (can be done in step 1)

---

## 7. Environment Variable Checklist

| Variable | Where to set | Required? |
|----------|-------------|-----------|
| `BREVO_API_KEY` | Replit Secrets + Vercel | ✅ Yes |
| `BREVO_SENDER_EMAIL` | Replit Secrets + Vercel | ✅ Yes |
| `BREVO_SENDER_NAME` | Replit Secrets + Vercel | Optional (defaults to "AODI") |
| `NEXT_PUBLIC_BASE_URL` | Replit Secrets + Vercel | ✅ Yes (used for reset links) |
| `SENDGRID_API_KEY` | Remove once Brevo is live | — |

**Note:** `BREVO_SENDER_EMAIL` must be a verified sender in your Brevo account. Go to Brevo → Senders & IPs → Add a new sender and verify the domain `africaofourdreaminitiative.org` via DNS.

---

## 8. Brevo Account Setup Steps (Before Building)

1. Create account at [brevo.com](https://brevo.com) (free tier: 300 emails/day, unlimited contacts)
2. Go to **Settings → API Keys** → Create a new API key → copy it as `BREVO_API_KEY`
3. Go to **Senders & IPs → Domains** → Add `africaofourdreaminitiative.org` → follow DNS verification (adds TXT + DKIM records in Namecheap/Vercel DNS)
4. Create a **Contact List** called "AODI Newsletter Subscribers"
5. Optionally create a **Contact List** called "AODI Applicants" for CRM contacts

---

## 9. Out of Scope (Not Building Now)

- Brevo marketing campaigns (separate from transactional — would need campaign API)
- SMS notifications (Brevo supports this but not needed currently)
- Email open/click webhooks to AODI database (Brevo dashboard handles tracking natively)
- Automated email sequences / drip campaigns

---

*This document covers everything needed. Build starts at Step 1 (Brevo core module) once the Brevo account and API key are ready.*
