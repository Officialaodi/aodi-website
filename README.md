# AODI - Africa of Our Dream Education Initiative

A comprehensive website and content management system for AODI, a UK-registered NGO focused on leadership and talent development in Africa.

## Features

- **Public Website** - Professional, responsive website showcasing programs, events, impact stories, and resources
- **Admin CMS** - Full content management with role-based access control
- **CRM System** - Application tracking, contact management, and email sync
- **Forms System** - Dynamic form builder with 10+ pre-built forms
- **Analytics** - Privacy-focused built-in analytics dashboard
- **Event Management** - Two page templates with duplication support
- **PWA Support** - Installable app with offline support

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Styling | Tailwind CSS |
| UI Components | Radix UI / shadcn/ui |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Bot Protection | hCaptcha |
| Payments | Paystack, PayPal |
| Email | SendGrid |

See [TECH_STACK.md](./TECH_STACK.md) for detailed documentation.

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- PostgreSQL database ([Neon](https://neon.tech/) recommended - free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/Officialaodi/aodi-website.git
cd aodi-website

# Navigate to the web app
cd apps/web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and secrets

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Visit **http://localhost:3000** to see the site.

Create your admin account at **http://localhost:3000/admin/setup**

---

## Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env.local` and configure:

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Random 32+ character string for session signing |
| `ADMIN_PASSWORD` | Master password for admin account recovery |

### Recommended

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | hCaptcha site key for form protection |
| `HCAPTCHA_SECRET_KEY` | hCaptcha secret key |

### Optional

| Variable | Description |
|----------|-------------|
| `PAYSTACK_SECRET_KEY` | Paystack payment processing |
| `SENDGRID_API_KEY` | SendGrid email service |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error monitoring |

---

## Available Commands

Run these from the `apps/web` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push database schema to PostgreSQL |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository to [Vercel](https://vercel.com/)
3. Set **Root Directory**: `apps/web`
4. Add environment variables
5. Deploy

### Cloudflare Pages

1. Push code to GitHub
2. Connect to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Set **Root Directory**: `apps/web`
4. Set **Build command**: `npm run build`
5. Add environment variables
6. Deploy

### Post-Deployment

1. Run `npm run db:push` to set up database tables
2. Visit `/admin/setup` to create the Super Admin account

---

## Admin Access

| URL | Purpose |
|-----|---------|
| `/admin/setup` | First-time admin account creation |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard |

### Password Recovery

If locked out, use the password reset endpoint:

```bash
curl -X POST https://your-domain.com/api/admin/reset-admin \
  -H "Content-Type: application/json" \
  -d '{"masterPassword":"YOUR_ADMIN_PASSWORD","email":"admin@example.com","newPassword":"newpassword"}'
```

---

## Project Structure

```
apps/web/
├── src/
│   ├── app/           # Next.js pages and API routes
│   │   ├── admin/     # Admin CMS pages
│   │   ├── api/       # API endpoints
│   │   └── ...        # Public pages
│   ├── components/    # React components
│   ├── lib/           # Database, auth, utilities
│   └── styles/        # Global CSS
├── public/            # Static assets
├── .env.example       # Environment template
├── drizzle.config.ts  # Database configuration
└── package.json       # Dependencies
```

---

## Documentation

- [LOCAL_SETUP.md](./apps/web/LOCAL_SETUP.md) - Detailed local development guide
- [TECH_STACK.md](./TECH_STACK.md) - Complete technical documentation
- [.env.example](./apps/web/.env.example) - Environment variables reference

---

## License

Private - Africa of Our Dream Education Initiative

## Contact

- Website: [africaofourdreaminitiative.org](https://africaofourdreaminitiative.org)
- Email: aodi.info@africaofourdreaminitiative.org
