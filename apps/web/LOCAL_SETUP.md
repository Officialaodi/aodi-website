# AODI Website - Local Development Setup

Complete guide to run the AODI website locally on your computer using VS Code.

---

## Prerequisites

Before you begin, make sure you have installed:

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **VS Code** - Download from [code.visualstudio.com](https://code.visualstudio.com/)
3. **Git** - Download from [git-scm.com](https://git-scm.com/)
4. **PostgreSQL Database** - Choose one:
   - [Neon](https://neon.tech/) (Recommended - Free tier available)
   - [Supabase](https://supabase.com/)
   - Local PostgreSQL installation

---

## Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/Officialaodi/aodi-website.git
cd aodi-website
```

---

## Step 2: Navigate to the Web App

```bash
cd apps/web
```

---

## Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js (React framework)
- Drizzle ORM (Database)
- Tailwind CSS (Styling)
- And all other dependencies

---

## Step 4: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` in VS Code and fill in your values:
   ```bash
   code .env.local
   ```

### Required Environment Variables

| Variable | Description | How to Get It |
|----------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | From Neon/Supabase dashboard |
| `SESSION_SECRET` | Random 32+ character string | Run: `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | Master password for admin recovery | Create a secure password |

### Recommended Environment Variables

| Variable | Description | How to Get It |
|----------|-------------|---------------|
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | hCaptcha site key | [hcaptcha.com](https://www.hcaptcha.com/) |
| `HCAPTCHA_SECRET_KEY` | hCaptcha secret key | [hcaptcha.com](https://www.hcaptcha.com/) |

### Optional Environment Variables

| Variable | Description | How to Get It |
|----------|-------------|---------------|
| `PAYSTACK_SECRET_KEY` | Paystack API key | [dashboard.paystack.com](https://dashboard.paystack.com/) |
| `SENDGRID_API_KEY` | SendGrid email API | [app.sendgrid.com](https://app.sendgrid.com/) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID | [analytics.google.com](https://analytics.google.com/) |

---

## Step 5: Set Up the Database

Push the database schema to your PostgreSQL database:

```bash
npm run db:push
```

This creates all the necessary tables in your database.

---

## Step 6: Run the Development Server

```bash
npm run dev
```

The site will be available at: **http://localhost:3000**

---

## Step 7: Create Your Admin Account

1. Open your browser and go to: **http://localhost:3000/admin/setup**
2. Fill in your admin details (name, email, password)
3. Click "Create Super Admin Account"
4. You can now log in at: **http://localhost:3000/admin/login**

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code checker |
| `npm run db:push` | Push database schema changes |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

---

## Building for Production

To create a production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

---

## Deploying to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com/) and sign in with GitHub
3. Click "New Project" and import your repository
4. Set the **Root Directory** to: `apps/web`
5. Add all environment variables from `.env.local`
6. Click "Deploy"

After deployment:
- Visit your Vercel URL + `/admin/setup` to create the admin account
- Or use the password reset endpoint if an admin already exists

---

## Deploying to Cloudflare Pages

1. Push your code to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com/)
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `apps/web`
   - **Build command**: `npm run build`
   - **Output directory**: `.next`
5. Add environment variables
6. Deploy

Note: Cloudflare Pages may require additional configuration for API routes.

---

## Troubleshooting

### Database Connection Error
- Check that your `DATABASE_URL` is correct
- Ensure your database is running and accessible
- For Neon/Supabase, check that your IP is allowed

### Admin Login Not Working
Use the password reset endpoint:
```bash
curl -X POST http://localhost:3000/api/admin/reset-admin \
  -H "Content-Type: application/json" \
  -d '{"masterPassword":"YOUR_ADMIN_PASSWORD","email":"admin@example.com","newPassword":"newpassword"}'
```

### Port Already in Use
Change the port in the dev command:
```bash
npm run dev -- -p 3001
```

### Build Errors
1. Delete `.next` folder: `rm -rf .next`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Try building again: `npm run build`

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
│   ├── lib/           # Utilities, database, auth
│   └── styles/        # Global CSS
├── public/            # Static files (images, icons)
├── .env.example       # Environment template
├── .env.local         # Your local environment (create this)
├── package.json       # Dependencies and scripts
└── drizzle.config.ts  # Database configuration
```

---

## Need Help?

- Check the [TECH_STACK.md](../../TECH_STACK.md) for technical details
- Check the [README.md](../../README.md) for project overview
- Contact: aodi.info@africaofourdreaminitiative.org
