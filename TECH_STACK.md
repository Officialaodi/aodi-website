# AODI Website - Technical Stack Documentation

## Overview

The Africa of Our Dream Education Initiative (AODI) website is a full-featured content management system and public-facing website built with modern web technologies.

---

## Core Technologies

### Frontend Framework
- **Next.js 16** - React framework with App Router
  - Server-side rendering (SSR)
  - Incremental Static Regeneration (ISR)
  - API Routes for backend functionality
  - Turbopack for fast development builds

### Language
- **TypeScript** - Type-safe JavaScript
  - Strict mode enabled
  - Full type coverage across the application

### Styling
- **Tailwind CSS** - Utility-first CSS framework
  - Custom AODI brand colors configured
  - Responsive design utilities
  - Dark mode support (configured but using light theme)

### UI Components
- **Radix UI** - Accessible, unstyled component primitives
- **shadcn/ui** - Pre-built components on top of Radix UI
- **Lucide React** - Icon library

---

## Backend & Database

### Database
- **PostgreSQL** - Relational database
  - Used via Neon (serverless Postgres) or any PostgreSQL provider
  - 15+ optimized indexes for performance

### ORM
- **Drizzle ORM** - TypeScript-first SQL ORM
  - Type-safe database queries
  - Schema-driven development
  - Migration support via `drizzle-kit`

### Authentication
- **Custom HMAC-signed sessions** - Secure cookie-based auth
  - Session tokens with HMAC signatures
  - Role-based access control (RBAC)
  - Password hashing with bcrypt

---

## Database Schema Overview

### Core Tables
| Table | Purpose |
|-------|---------|
| `admin_users` | Admin/CMS user accounts |
| `roles` | User roles (Super Admin, Editor, etc.) |
| `permissions` | Granular permissions |
| `role_permissions` | Role-to-permission mappings |

### Content Tables
| Table | Purpose |
|-------|---------|
| `programs` | Program listings |
| `events` | Events with two templates (standard, featured-program) |
| `stories` | Impact stories and testimonials |
| `resources` | Downloadable resources |
| `partners` | Partner organizations |
| `testimonials` | User testimonials |
| `site_settings` | Configurable site content |

### CRM Tables
| Table | Purpose |
|-------|---------|
| `applications` | All form submissions |
| `crm_contacts` | CRM contact records |
| `crm_notes` | Notes on contacts |
| `crm_tags` | Contact tags |
| `email_accounts` | Connected email accounts (IMAP/SMTP) |
| `emails` | Synced emails |

### Forms System
| Table | Purpose |
|-------|---------|
| `forms` | Dynamic form definitions |
| `form_fields` | Form field configurations |

### Analytics Tables
| Table | Purpose |
|-------|---------|
| `analytics_sessions` | Visitor sessions |
| `analytics_page_views` | Page view tracking |
| `analytics_events` | Custom event tracking |
| `analytics_conversions` | Conversion tracking |

### Governance
| Table | Purpose |
|-------|---------|
| `trustees` | Board of trustees |
| `executive_director` | Executive director info |

### Activity Tracking
| Table | Purpose |
|-------|---------|
| `activity_logs` | Audit trail for all admin actions |

---

## Key Features

### Admin CMS
- Full content management for all website content
- Role-based access control with granular permissions
- Activity logging and audit trail
- Rich text editor (TipTap)
- Media/image upload system

### Forms Management
- 10 pre-built forms (mentor, mentee, volunteer, etc.)
- Dynamic form builder for custom forms
- Form enable/disable with custom closure messages
- Event-linked registration forms with beautiful UI

### CRM System
- Contact management
- Email sync (IMAP/SMTP)
- Application tracking with filtering and pagination
- Tagging and notes system

### Analytics
- Privacy-focused built-in analytics
- Session and page view tracking
- Conversion tracking
- Real-time activity dashboard

### Event System
- Two page templates: standard and featured-program
- Event duplication from admin
- External registration URL support
- 18 available objective icons

---

## Form Validation & Security

- **Zod** - Schema validation for all forms
- **React Hook Form** - Form state management
- **hCaptcha** - Bot protection on all public forms
- **UK GDPR Compliance** - Policy consent required on all forms
- **Rate limiting** - API route protection
- **HMAC signatures** - Secure session cookies
- **Security headers** - XSS, CSRF protection

---

## External Services

| Service | Purpose | Required |
|---------|---------|----------|
| PostgreSQL (Neon/Supabase) | Database | Yes |
| hCaptcha | Spam protection | Recommended |
| SendGrid | Transactional emails | Optional |
| Paystack | Payment processing (Africa) | Optional |
| PayPal | Payment processing (International) | Optional |
| Google Analytics | Web analytics | Optional |
| Sentry | Error monitoring | Optional |

---

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin CMS pages
│   │   ├── api/                # API routes
│   │   ├── about/              # Public pages
│   │   ├── programs/
│   │   ├── events/
│   │   ├── forms/              # Dynamic form pages
│   │   └── ...
│   ├── components/
│   │   ├── admin/              # Admin-specific components
│   │   ├── layout/             # Layout components (Header, Footer)
│   │   ├── ui/                 # shadcn/ui components
│   │   └── ...
│   ├── lib/
│   │   ├── db.ts               # Database connection
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   ├── admin-auth.ts       # Admin authentication
│   │   └── ...
│   └── styles/
│       └── globals.css         # Global styles
├── public/                     # Static assets
├── drizzle/                    # Database migrations
└── ...
```

---

## Deployment Requirements

### Environment Variables
See `.env.example` for all required and optional variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - For signing session cookies
- `ADMIN_PASSWORD` - Master password for admin recovery

**Recommended:**
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` - For bot protection
- `HCAPTCHA_SECRET_KEY` - For bot protection

### Build Commands
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Build for production
npm run build

# Start production server
npm start
```

### Vercel Deployment
1. Connect GitHub repository
2. Set Root Directory: `apps/web`
3. Framework Preset: Next.js (auto-detected)
4. Add all environment variables
5. Deploy

### Cloudflare Pages Deployment
1. Connect GitHub repository
2. Set Root Directory: `apps/web`
3. Build command: `npm run build`
4. Output directory: `.next`
5. Add environment variables
6. Note: May need additional configuration for API routes

---

## Database Setup

After deploying, run database schema push:
```bash
npm run db:push
```

Then visit `/admin/setup` to create the first Super Admin account.

If you can't access setup (admin already exists), use the password reset endpoint:
```bash
curl -X POST https://your-domain.com/api/admin/reset-admin \
  -H "Content-Type: application/json" \
  -d '{"masterPassword":"YOUR_ADMIN_PASSWORD","email":"admin@example.com","newPassword":"newpassword"}'
```

---

## Performance Optimizations

- Image optimization with Next.js Image (AVIF/WebP)
- Server-side caching with 5-minute revalidation
- Database indexes on frequently queried columns
- Static generation with ISR for content pages
- Console removal in production builds

---

## PWA Features

- Installable on mobile and desktop
- Offline support with service worker
- App-like standalone experience
- Quick action shortcuts
