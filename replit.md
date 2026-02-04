# AODI Website

## Overview

This project delivers a professional website for the Africa of Our Dream Education Initiative (AODI), a UK-registered NGO. The platform aims to engage diverse audiences including donors, partners, mentors, mentees, and volunteers by providing information on AODI's programs, showcasing impact, and facilitating engagement through application and donation forms. The site emphasizes leadership and talent development in Africa, showcasing impact, and facilitating engagement.

## User Preferences

Preferred communication style: Simple, everyday language.
Design choice: Build exactly to ChatGPT spec - zero improvisation on design/content/features.

## System Architecture

The AODI website is built as a Next.js 14 frontend application, utilizing the App Router and styled with Tailwind CSS, adhering to AODI's brand colors. UI components are custom-built on Radix UI for accessibility. Form handling is managed with React Hook Form and Zod validation, with submissions processed via Next.js API routes and stored in a PostgreSQL database using Drizzle ORM.

The project features a comprehensive Content Management System (CMS) accessible via an `/admin` dashboard. This CMS allows for dynamic management of all website content, including applications, governance, impact metrics, programs, events, partners, testimonials, stories, and resources. Security features include rate limiting, HMAC-signed session authentication, and robust security headers. SEO is enhanced through an auto-generated sitemap, robots.txt, Schema.org markup, Open Graph tags, and Google Analytics integration.

The CMS includes a TipTap-based rich text editor for content formatting and a secure media upload system for images. Configurable site settings allow management of homepage and footer content.

The CRM integrates a universal email sync system compatible with IMAP/SMTP providers (Gmail, Outlook, cPanel) for two-way email synchronization, auto-linking emails to CRM contacts, and sending emails from connected accounts.

A Role-Based Access Control (RBAC) system manages user access with granular permissions across applications, CRM, content, governance, impact, and user management. This includes `admin_users`, `roles`, `permissions`, and `role_permissions` tables, with a secure authentication flow and predefined roles like 'Super Admin'.

A comprehensive audit trail system tracks all administrative actions in the `activity_logs` table, including authentication, content management, user management, and email operations, accessible via a dashboard with filtering capabilities.

A privacy-focused, built-in analytics system tracks website performance without third-party data sharing. It records sessions, page views, events, and conversions in dedicated database tables (`analytics_sessions`, `analytics_page_views`, `analytics_events`, `analytics_conversions`). The admin portal provides dashboards for overview, pages, sources, geography, conversions, events, and real-time activity. Client-side tracking is handled by the `AnalyticsTracker` component, and custom events can be tracked using `data-track` attributes.

Interactive chart visualizations using Recharts are integrated into analytics dashboards for various data representations (bar, line, area, pie charts).

A dedicated event registration system, exemplified by the "ChemBridge Inclusion Accelerator 2026," handles event-specific registrations with features like international phone number support, hCaptcha, Zod validation, and conversion tracking.

## Dynamic Event Page System

Event pages support two templates controlled by the `pageTemplate` field:
- **standard**: Basic event page layout with hero, body content, and sidebar details
- **featured-program**: Enhanced layout for flagship programs with:
  - Objectives grid with 18 available icons (Beaker, Microscope, GraduationCap, Globe, Lightbulb, Network, Award, Target, Heart, Star, Zap, Shield, BookOpen, Users, Calendar, MapPin, Clock, CheckCircle)
  - Eligibility criteria list with custom title and intro
  - Delivery mode section with optional description
  - Gradient sidebar with duration and certificate info
  - Custom CTA section with configurable title, description, and button text

Events can be duplicated from the admin portal (creates copy with modified slug and opens editor). External registration URLs are properly handled with target="_blank" and external link icons.

A comprehensive Forms Management System allows admins to control all website forms from the admin portal. Key features include:
- **Enable/Disable Forms**: Toggle any form on/off with custom closure messages displayed when forms are disabled
- **Built-in Forms**: 10 pre-configured forms (mentor, mentee, volunteer, partner, empowerher, campus-ambassador, stem-workshops, partner-africa, chembridge-2026, contact)
- **Dynamic Form Builder**: Create new forms without code changes, with configurable fields supporting 11 field types (text, email, phone, textarea, select, checkbox, radio, number, date, url, country)
- **Automatic CRM Integration**: All form submissions are stored in the applications table with type=slug and payload JSON for CRM processing
- **Form Status Hook**: Existing forms use the `useFormStatus` hook to check enabled status and display `FormClosedMessage` when disabled
- **URL Redirects**: Legacy form URLs redirect to dynamic form pages:
  - /get-involved/mentor → /forms/mentor
  - /get-involved/mentee → /forms/mentee
  - /get-involved/volunteer → /forms/volunteer
  - /get-involved/partner → /forms/partner
  - /apply/empowerher → /forms/empowerher
  - /apply/campus-ambassador → /forms/campus-ambassador
  - /apply/stem-workshops → /forms/stem-workshops
  - /apply/partner-africa → /forms/partner-africa

## Beautiful Event-Linked Forms

Forms can be linked to events via the `eventId` field to display professional registration pages:
- **Event Hero Section**: When a form is linked to an event, displays a beautiful hero with event image/gradient, title, subtitle, category badge, dates, and location
- **Section Grouping**: Form fields can be assigned to sections (e.g., "Personal Information", "Academic & Professional Background") via the `section` field in form_fields. Sections display with numbered badges (1, 2, etc.)
- **Professional Styling**: Forms feature gradient backgrounds, shadowed cards, consistent field heights (h-11), and AODI brand colors
- **Success States**: Beautiful success confirmation with event details and gradient header
- **Admin Editing**: The Forms Manager supports editing section assignments for each field

## Progressive Web App (PWA)

The platform is configured as a Progressive Web App for mobile users:
- **Installable**: Users can add the app to their home screen on mobile and desktop
- **Offline Support**: Service worker caches pages for offline access with a friendly offline page
- **App-like Experience**: Standalone display mode without browser UI
- **Push Notifications Ready**: Service worker configured for future push notification support
- **App Icons**: Full set of icons (72px to 512px) for all devices
- **Shortcuts**: Quick actions for Apply as Mentee, Become a Mentor, and Programs

## Performance Optimizations

The platform includes several performance optimizations:
- **Image Optimization**: Next.js Image component with AVIF/WebP formats and 30-day cache TTL
- **Data Caching**: Server-side caching using `unstable_cache` with 5-minute revalidation for public content
- **Static Generation**: Content pages use ISR (Incremental Static Regeneration) with `revalidate = 300`
- **Database Indexes**: Optimized indexes on frequently queried columns (is_active, display_order, status, type, created_at)
- **Loading States**: Loading components for better perceived performance
- **Production Optimizations**: Console removal in production, CSS optimization, removed X-Powered-By header

## UK GDPR Compliance & Form Protection

All website forms include comprehensive legal compliance:
- **PolicyConsent Component**: Reusable consent checkbox requiring agreement to Privacy Policy, Terms of Service, and Safeguarding Policy
- **hCaptcha Integration**: Bot protection with graceful degradation (renders only when NEXT_PUBLIC_HCAPTCHA_SITE_KEY is configured)
- **API Validation**: Server-side verification of policy consent before accepting any form submission
- **Policy Pages**: Comprehensive 15-section UK GDPR-compliant Privacy Policy, Terms of Service, and Safeguarding Policy

Forms protected:
- Mentor, Mentee, Volunteer, Partner applications
- EmpowerHer, Campus Ambassador, STEM Workshops, Partner Africa applications
- ChemBridge 2026 event registration
- Contact form
- Dynamic forms (via Forms Management System)

## External Dependencies

-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM
-   **UI Library**: Radix UI
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **Email Service**: SendGrid
-   **Payment Gateways**: Paystack, PayPal
-   **Analytics**: Google Analytics 4
-   **Error Monitoring**: Sentry
-   **Spam Prevention**: hCaptcha
-   **Social Media**: YouTube, LinkedIn, X (Twitter), Facebook, Instagram