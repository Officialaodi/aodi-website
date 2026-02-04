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

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI / shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Security**: hCaptcha, HMAC sessions, RBAC

See [TECH_STACK.md](./TECH_STACK.md) for detailed documentation.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon, Supabase, or local)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/aodi-website.git
cd aodi-website
```

2. Install dependencies:
```bash
cd apps/web
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. Push database schema:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

6. Visit `http://localhost:3000/admin/setup` to create the first admin account.

## Environment Variables

See `apps/web/.env.example` for all required and optional environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for signing session cookies
- `ADMIN_PASSWORD` - Master password for admin recovery

**Recommended:**
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` - For form spam protection
- `HCAPTCHA_SECRET_KEY` - For form spam protection

## Deployment

### Vercel (Recommended for Next.js)

1. Import your GitHub repository to Vercel
2. Set **Root Directory** to `apps/web`
3. Add all environment variables from `.env.example`
4. Deploy

### Cloudflare Pages

1. Connect your GitHub repository
2. Set **Root Directory** to `apps/web`
3. Build command: `npm run build`
4. Output directory: `.next`
5. Add environment variables

### Post-Deployment

1. Run database migrations: `npm run db:push`
2. Visit `/admin/setup` to create the Super Admin account

## Project Structure

```
apps/web/
├── src/
│   ├── app/          # Next.js pages and API routes
│   ├── components/   # React components
│   ├── lib/          # Utilities and database
│   └── styles/       # Global styles
├── public/           # Static assets
└── drizzle/          # Database migrations
```

## Admin Access

- **Setup**: `/admin/setup` (first-time only)
- **Login**: `/admin/login`
- **Dashboard**: `/admin`

If locked out, use the password reset endpoint:
```bash
curl -X POST https://your-domain.com/api/admin/reset-admin \
  -H "Content-Type: application/json" \
  -d '{"masterPassword":"YOUR_ADMIN_PASSWORD","email":"admin@example.com","newPassword":"newpassword"}'
```

## License

Private - Africa of Our Dream Education Initiative

## Contact

- Website: [africaofourdreaminitiative.org](https://africaofourdreaminitiative.org)
- Email: aodi.info@africaofourdreaminitiative.org
