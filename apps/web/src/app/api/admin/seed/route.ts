import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { permissions, roles, rolePermissions, forms, formFields, integrationSettings, partners, stories, resources, programs, testimonials, impactMetrics, applications, contacts } from "@/lib/schema"
import { eq, sql, notExists } from "drizzle-orm"

export const dynamic = 'force-dynamic'

const DEFAULT_PERMISSIONS = [
  { key: "applications.view", name: "View Applications", category: "Applications", description: "View all applications" },
  { key: "applications.manage", name: "Manage Applications", category: "Applications", description: "Update application status and details" },
  { key: "applications.delete", name: "Delete Applications", category: "Applications", description: "Delete applications" },
  { key: "crm.view", name: "View CRM", category: "CRM", description: "Access CRM contacts and data" },
  { key: "crm.manage", name: "Manage CRM", category: "CRM", description: "Edit contacts and send emails" },
  { key: "content.view", name: "View Content", category: "Content", description: "View all website content" },
  { key: "content.manage", name: "Manage Content", category: "Content", description: "Edit website content" },
  { key: "governance.view", name: "View Governance", category: "Governance", description: "View governance information" },
  { key: "governance.manage", name: "Manage Governance", category: "Governance", description: "Edit governance content" },
  { key: "impact.view", name: "View Impact", category: "Impact", description: "View impact metrics" },
  { key: "impact.manage", name: "Manage Impact", category: "Impact", description: "Edit impact metrics" },
  { key: "users.view", name: "View Users", category: "User Management", description: "View admin users" },
  { key: "users.manage", name: "Manage Users", category: "User Management", description: "Create and edit admin users" },
  { key: "users.delete", name: "Delete Users", category: "User Management", description: "Delete admin users" },
  { key: "roles.view", name: "View Roles", category: "User Management", description: "View roles and permissions" },
  { key: "roles.manage", name: "Manage Roles", category: "User Management", description: "Create and edit roles" },
  { key: "analytics.view", name: "View Analytics", category: "Analytics", description: "View website analytics" },
  { key: "settings.view", name: "View Settings", category: "Settings", description: "View system settings" },
  { key: "settings.manage", name: "Manage Settings", category: "Settings", description: "Edit system settings" },
  { key: "forms.view", name: "View Forms", category: "Forms", description: "View form configurations" },
  { key: "forms.manage", name: "Manage Forms", category: "Forms", description: "Create and edit forms" },
  { key: "events.view", name: "View Events", category: "Events", description: "View events" },
  { key: "events.manage", name: "Manage Events", category: "Events", description: "Create and edit events" },
]

const BUILT_IN_FORMS = [
  { slug: "mentor", name: "Become a Mentor", description: "Application form for mentors who want to guide and support young African leaders", isBuiltIn: true, isEnabled: true, successMessage: "Thank you for your interest in becoming a mentor! We will review your application and get back to you within 5 business days." },
  { slug: "mentee", name: "Apply as Mentee", description: "Application form for young Africans seeking mentorship and guidance", isBuiltIn: true, isEnabled: true, successMessage: "Thank you for applying to our mentorship program! We will review your application and match you with a suitable mentor." },
  { slug: "volunteer", name: "Volunteer Application", description: "Join AODI as a volunteer and contribute to our mission", isBuiltIn: true, isEnabled: true, successMessage: "Thank you for volunteering with AODI! We will contact you about upcoming opportunities." },
  { slug: "partner", name: "Partnership Inquiry", description: "For organizations interested in partnering with AODI", isBuiltIn: true, isEnabled: true, successMessage: "Thank you for your partnership interest! Our team will review and contact you shortly." },
  { slug: "contact", name: "Contact Us", description: "General contact form for inquiries", isBuiltIn: true, isEnabled: true, successMessage: "Thank you for contacting us! We will respond to your inquiry within 2 business days." },
  { slug: "empowerher", name: "EmpowerHer Application", description: "Application for the EmpowerHer women leadership program", isBuiltIn: true, isEnabled: true, successMessage: "Thank you for applying to EmpowerHer! We will review your application and notify you of the outcome." },
  { slug: "campus-ambassador", name: "Campus Ambassador Application", description: "Become an AODI Campus Ambassador at your university", isBuiltIn: true, isEnabled: true, successMessage: "Thank you for applying to be a Campus Ambassador! We will review your application shortly." },
  { slug: "stem-workshops", name: "STEM Workshops Registration", description: "Register for AODI STEM education workshops", isBuiltIn: true, isEnabled: true, successMessage: "Thank you for registering! You will receive workshop details via email." },
  { slug: "partner-africa", name: "Partner Africa Application", description: "Application for the Partner Africa initiative", isBuiltIn: true, isEnabled: true, successMessage: "Thank you for your Partner Africa application! We will be in touch soon." },
  { slug: "chembridge-2026", name: "ChemBridge 2026 Registration", description: "Registration for the ChemBridge Inclusion Accelerator 2026 event", isBuiltIn: true, isEnabled: true, successMessage: "Thank you for registering for ChemBridge 2026! You will receive confirmation and event details via email." },
]

const TITLE_OPTIONS = JSON.stringify(["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof"])

const COMMON_FORM_FIELDS: Record<string, Array<{ fieldKey: string; label: string; fieldType: string; isRequired: boolean; displayOrder: number; placeholder?: string; options?: string; width?: string; section?: string }>> = {
  mentor: [
    { fieldKey: "title", label: "Title", fieldType: "select", isRequired: true, displayOrder: 1, placeholder: "Select title", options: TITLE_OPTIONS, width: "third" },
    { fieldKey: "firstName", label: "First Name", fieldType: "text", isRequired: true, displayOrder: 2, placeholder: "Enter first name", width: "third" },
    { fieldKey: "lastName", label: "Last Name", fieldType: "text", isRequired: true, displayOrder: 3, placeholder: "Enter last name", width: "third" },
    { fieldKey: "email", label: "Email Address", fieldType: "email", isRequired: true, displayOrder: 4, placeholder: "Enter your email" },
    { fieldKey: "phone", label: "Phone Number", fieldType: "phone", isRequired: true, displayOrder: 5, placeholder: "+44 7XXX XXXXXX" },
    { fieldKey: "country", label: "Country", fieldType: "country", isRequired: true, displayOrder: 6 },
    { fieldKey: "occupation", label: "Current Occupation", fieldType: "text", isRequired: true, displayOrder: 7, placeholder: "e.g., Software Engineer" },
    { fieldKey: "organization", label: "Organization/Company", fieldType: "text", isRequired: false, displayOrder: 8, placeholder: "Your company or organization" },
    { fieldKey: "expertise", label: "Areas of Expertise", fieldType: "textarea", isRequired: true, displayOrder: 9, placeholder: "Describe your areas of expertise" },
    { fieldKey: "motivation", label: "Why do you want to become a mentor?", fieldType: "textarea", isRequired: true, displayOrder: 10, placeholder: "Share your motivation" },
  ],
  mentee: [
    { fieldKey: "title", label: "Title", fieldType: "select", isRequired: true, displayOrder: 1, placeholder: "Select title", options: TITLE_OPTIONS, width: "third" },
    { fieldKey: "firstName", label: "First Name", fieldType: "text", isRequired: true, displayOrder: 2, placeholder: "Enter first name", width: "third" },
    { fieldKey: "lastName", label: "Last Name", fieldType: "text", isRequired: true, displayOrder: 3, placeholder: "Enter last name", width: "third" },
    { fieldKey: "email", label: "Email Address", fieldType: "email", isRequired: true, displayOrder: 4, placeholder: "Enter your email" },
    { fieldKey: "phone", label: "Phone Number", fieldType: "phone", isRequired: true, displayOrder: 5, placeholder: "+234 XXX XXX XXXX" },
    { fieldKey: "country", label: "Country", fieldType: "country", isRequired: true, displayOrder: 6 },
    { fieldKey: "age", label: "Age", fieldType: "number", isRequired: true, displayOrder: 7 },
    { fieldKey: "education", label: "Education Level", fieldType: "select", isRequired: true, displayOrder: 8, options: JSON.stringify(["Secondary School", "Undergraduate", "Graduate", "Postgraduate", "Other"]) },
    { fieldKey: "goals", label: "What are your career/life goals?", fieldType: "textarea", isRequired: true, displayOrder: 9, placeholder: "Describe your goals" },
    { fieldKey: "expectations", label: "What do you expect from a mentor?", fieldType: "textarea", isRequired: true, displayOrder: 10, placeholder: "Share your expectations" },
  ],
  volunteer: [
    { fieldKey: "title", label: "Title", fieldType: "select", isRequired: true, displayOrder: 1, placeholder: "Select title", options: TITLE_OPTIONS, width: "third" },
    { fieldKey: "firstName", label: "First Name", fieldType: "text", isRequired: true, displayOrder: 2, placeholder: "Enter first name", width: "third" },
    { fieldKey: "lastName", label: "Last Name", fieldType: "text", isRequired: true, displayOrder: 3, placeholder: "Enter last name", width: "third" },
    { fieldKey: "email", label: "Email Address", fieldType: "email", isRequired: true, displayOrder: 4, placeholder: "Enter your email" },
    { fieldKey: "phone", label: "Phone Number", fieldType: "phone", isRequired: true, displayOrder: 5 },
    { fieldKey: "country", label: "Country", fieldType: "country", isRequired: true, displayOrder: 6 },
    { fieldKey: "availability", label: "Availability (hours per week)", fieldType: "select", isRequired: true, displayOrder: 7, options: JSON.stringify(["1-5 hours", "5-10 hours", "10-20 hours", "20+ hours"]) },
    { fieldKey: "skills", label: "Skills and Experience", fieldType: "textarea", isRequired: true, displayOrder: 8, placeholder: "Describe your skills" },
    { fieldKey: "interests", label: "Areas of Interest", fieldType: "textarea", isRequired: true, displayOrder: 9, placeholder: "What areas interest you?" },
  ],
  partner: [
    { fieldKey: "title", label: "Title", fieldType: "select", isRequired: true, displayOrder: 1, placeholder: "Select title", options: TITLE_OPTIONS, width: "third" },
    { fieldKey: "firstName", label: "First Name", fieldType: "text", isRequired: true, displayOrder: 2, placeholder: "Enter first name", width: "third" },
    { fieldKey: "lastName", label: "Last Name", fieldType: "text", isRequired: true, displayOrder: 3, placeholder: "Enter last name", width: "third" },
    { fieldKey: "email", label: "Email Address", fieldType: "email", isRequired: true, displayOrder: 4, placeholder: "Enter your email" },
    { fieldKey: "organization", label: "Organization Name", fieldType: "text", isRequired: true, displayOrder: 5, placeholder: "Your organization" },
    { fieldKey: "website", label: "Website", fieldType: "url", isRequired: false, displayOrder: 6, placeholder: "https://example.com" },
    { fieldKey: "partnershipType", label: "Type of Partnership", fieldType: "select", isRequired: true, displayOrder: 7, options: JSON.stringify(["Funding/Sponsorship", "Program Collaboration", "In-kind Support", "Strategic Alliance", "Other"]) },
    { fieldKey: "message", label: "Partnership Proposal", fieldType: "textarea", isRequired: true, displayOrder: 8, placeholder: "Describe your partnership proposal" },
  ],
  contact: [
    { fieldKey: "title", label: "Title", fieldType: "select", isRequired: true, displayOrder: 1, placeholder: "Select title", options: TITLE_OPTIONS, width: "third" },
    { fieldKey: "firstName", label: "First Name", fieldType: "text", isRequired: true, displayOrder: 2, placeholder: "Enter first name", width: "third" },
    { fieldKey: "lastName", label: "Last Name", fieldType: "text", isRequired: true, displayOrder: 3, placeholder: "Enter last name", width: "third" },
    { fieldKey: "email", label: "Email Address", fieldType: "email", isRequired: true, displayOrder: 4, placeholder: "Enter your email" },
    { fieldKey: "subject", label: "Subject", fieldType: "text", isRequired: true, displayOrder: 5, placeholder: "What is this about?" },
    { fieldKey: "message", label: "Message", fieldType: "textarea", isRequired: true, displayOrder: 6, placeholder: "Your message" },
  ],
  empowerher: [
    { fieldKey: "title", label: "Title", fieldType: "select", isRequired: true, displayOrder: 1, placeholder: "Select title", options: TITLE_OPTIONS, width: "third" },
    { fieldKey: "firstName", label: "First Name", fieldType: "text", isRequired: true, displayOrder: 2, placeholder: "Enter first name", width: "third" },
    { fieldKey: "lastName", label: "Last Name", fieldType: "text", isRequired: true, displayOrder: 3, placeholder: "Enter last name", width: "third" },
    { fieldKey: "email", label: "Email Address", fieldType: "email", isRequired: true, displayOrder: 4, placeholder: "Enter your email" },
    { fieldKey: "phone", label: "Phone Number", fieldType: "phone", isRequired: true, displayOrder: 5 },
    { fieldKey: "country", label: "Country", fieldType: "country", isRequired: true, displayOrder: 6 },
    { fieldKey: "age", label: "Age", fieldType: "number", isRequired: true, displayOrder: 7 },
    { fieldKey: "education", label: "Education Level", fieldType: "select", isRequired: true, displayOrder: 8, options: JSON.stringify(["Secondary School", "Undergraduate", "Graduate", "Postgraduate", "Other"]) },
    { fieldKey: "experience", label: "Professional Experience", fieldType: "textarea", isRequired: true, displayOrder: 9, placeholder: "Describe your experience" },
    { fieldKey: "goals", label: "Leadership Goals", fieldType: "textarea", isRequired: true, displayOrder: 10, placeholder: "What are your leadership goals?" },
  ],
  "campus-ambassador": [
    { fieldKey: "title", label: "Title", fieldType: "select", isRequired: true, displayOrder: 1, placeholder: "Select title", options: TITLE_OPTIONS, width: "third" },
    { fieldKey: "firstName", label: "First Name", fieldType: "text", isRequired: true, displayOrder: 2, placeholder: "Enter first name", width: "third" },
    { fieldKey: "lastName", label: "Last Name", fieldType: "text", isRequired: true, displayOrder: 3, placeholder: "Enter last name", width: "third" },
    { fieldKey: "email", label: "Email Address", fieldType: "email", isRequired: true, displayOrder: 4, placeholder: "Enter your email" },
    { fieldKey: "phone", label: "Phone Number", fieldType: "phone", isRequired: true, displayOrder: 5 },
    { fieldKey: "university", label: "University Name", fieldType: "text", isRequired: true, displayOrder: 6, placeholder: "Your university" },
    { fieldKey: "country", label: "Country", fieldType: "country", isRequired: true, displayOrder: 7 },
    { fieldKey: "yearOfStudy", label: "Year of Study", fieldType: "select", isRequired: true, displayOrder: 8, options: JSON.stringify(["Year 1", "Year 2", "Year 3", "Year 4", "Postgraduate"]) },
    { fieldKey: "motivation", label: "Why do you want to be a Campus Ambassador?", fieldType: "textarea", isRequired: true, displayOrder: 9, placeholder: "Share your motivation" },
  ],
  "stem-workshops": [
    { fieldKey: "title", label: "Title", fieldType: "select", isRequired: true, displayOrder: 1, placeholder: "Select title", options: TITLE_OPTIONS, width: "third" },
    { fieldKey: "firstName", label: "First Name", fieldType: "text", isRequired: true, displayOrder: 2, placeholder: "Enter first name", width: "third" },
    { fieldKey: "lastName", label: "Last Name", fieldType: "text", isRequired: true, displayOrder: 3, placeholder: "Enter last name", width: "third" },
    { fieldKey: "email", label: "Email Address", fieldType: "email", isRequired: true, displayOrder: 4, placeholder: "Enter your email" },
    { fieldKey: "phone", label: "Phone Number", fieldType: "phone", isRequired: true, displayOrder: 5 },
    { fieldKey: "institution", label: "School/Institution", fieldType: "text", isRequired: true, displayOrder: 6, placeholder: "Your school or institution" },
    { fieldKey: "workshopType", label: "Workshop Interest", fieldType: "select", isRequired: true, displayOrder: 7, options: JSON.stringify(["Robotics", "Coding", "Science Experiments", "Mathematics", "All of the above", "Other"]) },
    { fieldKey: "ageGroup", label: "Age Group", fieldType: "select", isRequired: true, displayOrder: 8, options: JSON.stringify(["Under 12", "12-15", "16-18", "18+"]) },
  ],
  "partner-africa": [
    { fieldKey: "title", label: "Title", fieldType: "select", isRequired: true, displayOrder: 1, placeholder: "Select title", options: TITLE_OPTIONS, width: "third" },
    { fieldKey: "firstName", label: "First Name", fieldType: "text", isRequired: true, displayOrder: 2, placeholder: "Enter first name", width: "third" },
    { fieldKey: "lastName", label: "Last Name", fieldType: "text", isRequired: true, displayOrder: 3, placeholder: "Enter last name", width: "third" },
    { fieldKey: "email", label: "Email Address", fieldType: "email", isRequired: true, displayOrder: 4, placeholder: "Enter your email" },
    { fieldKey: "organization", label: "Organization Name", fieldType: "text", isRequired: true, displayOrder: 5, placeholder: "Your organization" },
    { fieldKey: "country", label: "Country", fieldType: "country", isRequired: true, displayOrder: 6 },
    { fieldKey: "partnershipArea", label: "Partnership Area", fieldType: "select", isRequired: true, displayOrder: 7, options: JSON.stringify(["Education", "Technology", "Healthcare", "Agriculture", "Other"]) },
    { fieldKey: "message", label: "Partnership Proposal", fieldType: "textarea", isRequired: true, displayOrder: 8, placeholder: "Describe your partnership proposal" },
  ],
  "chembridge-2026": [
    { fieldKey: "title", label: "Title", fieldType: "select", isRequired: true, displayOrder: 1, placeholder: "Select title", options: TITLE_OPTIONS, width: "third", section: "Personal Information" },
    { fieldKey: "firstName", label: "First Name", fieldType: "text", isRequired: true, displayOrder: 2, placeholder: "Enter first name", width: "third", section: "Personal Information" },
    { fieldKey: "lastName", label: "Last Name", fieldType: "text", isRequired: true, displayOrder: 3, placeholder: "Enter last name", width: "third", section: "Personal Information" },
    { fieldKey: "email", label: "Email Address", fieldType: "email", isRequired: true, displayOrder: 4, placeholder: "Enter your email", section: "Personal Information" },
    { fieldKey: "phone", label: "Phone Number", fieldType: "phone", isRequired: true, displayOrder: 5, section: "Personal Information" },
    { fieldKey: "country", label: "Country", fieldType: "country", isRequired: true, displayOrder: 6, section: "Personal Information" },
    { fieldKey: "institution", label: "Institution/University", fieldType: "text", isRequired: true, displayOrder: 7, placeholder: "Your university or institution", section: "Academic Background" },
    { fieldKey: "fieldOfStudy", label: "Field of Study", fieldType: "text", isRequired: true, displayOrder: 8, placeholder: "e.g., Organic Chemistry", section: "Academic Background" },
    { fieldKey: "educationLevel", label: "Education Level", fieldType: "select", isRequired: true, displayOrder: 9, options: JSON.stringify(["Undergraduate", "Graduate", "PhD", "Postdoc", "Professional"]), section: "Academic Background" },
    { fieldKey: "motivation", label: "Why do you want to participate in ChemBridge 2026?", fieldType: "textarea", isRequired: true, displayOrder: 10, placeholder: "Describe your goals and expectations", section: "Application Details" },
  ],
}

const DEFAULT_PARTNERS = [
  { name: "Royal Society of Chemistry", logoUrl: "/images/partners/rsc-logo.png", type: "Academic Partner", url: "https://www.rsc.org", description: "The Royal Society of Chemistry is a learned society in the United Kingdom with the goal of advancing the chemical sciences.", displayOrder: 1 },
  { name: "African Academy of Sciences", logoUrl: "/images/partners/aas-logo.png", type: "Strategic Partner", url: "https://www.aasciences.africa", description: "The African Academy of Sciences is a pan African organization promoting scientific development across Africa.", displayOrder: 2 },
  { name: "UNESCO", logoUrl: "/images/partners/unesco-logo.png", type: "International Partner", url: "https://www.unesco.org", description: "UNESCO works to create the conditions for dialogue among civilizations and cultures based upon respect for commonly shared values.", displayOrder: 3 },
  { name: "University of Lagos", logoUrl: "/images/partners/unilag-logo.png", type: "Academic Partner", url: "https://www.unilag.edu.ng", description: "The University of Lagos is a federal government research university in Lagos, Nigeria, established in 1962.", displayOrder: 4 },
  { name: "Wellcome Trust", logoUrl: "/images/partners/wellcome-logo.png", type: "Funding Partner", url: "https://wellcome.org", description: "Wellcome exists to improve health for everyone by helping great ideas to thrive through funding, advocacy, and partnership.", displayOrder: 5 },
  { name: "British Council", logoUrl: "/images/partners/british-council-logo.png", type: "Strategic Partner", url: "https://www.britishcouncil.org", description: "The British Council builds connections, understanding, and trust between people through education and culture.", displayOrder: 6 },
]

const DEFAULT_STORIES = [
  { slug: "empowering-future-scientists", title: "Empowering Future Scientists Across Africa", excerpt: "How AODI's mentorship programme is creating the next generation of African researchers and innovators.", body: "<p>In the heart of Lagos, Nigeria, a group of young scientists are defying expectations. Through AODI's flagship mentorship programme, these aspiring researchers have gained access to world-class mentors, cutting-edge resources, and a supportive community that believes in their potential.</p><p>\"Before joining AODI, I felt isolated in my research journey,\" says Amara, a PhD student in biochemistry. \"Now I have mentors who guide me, peers who inspire me, and a network that spans the entire continent.\"</p><p>The programme has already impacted over 500 early-career researchers across 15 African countries, with participants reporting significant improvements in their research skills, career confidence, and professional networks.</p>", category: "Impact Stories", featuredImage: "/images/stories/scientists.jpg", isFeatured: true },
  { slug: "breaking-barriers-stem", title: "Breaking Barriers in STEM Education", excerpt: "Young women in Kenya are changing the face of technology through AODI's EmpowerHer initiative.", body: "<p>The EmpowerHer initiative has been transforming lives across East Africa, providing young women with the skills, mentorship, and opportunities they need to thrive in STEM fields.</p><p>Mary, a 22-year-old software developer from Nairobi, credits the programme with launching her career. \"I never thought I could work in tech. Now I'm building apps that help farmers in my community access better markets for their produce.\"</p><p>Since its launch, EmpowerHer has trained over 300 young women in coding, data science, and digital entrepreneurship, with 85% of graduates securing employment or starting their own ventures within six months.</p>", category: "Programme Highlights", featuredImage: "/images/stories/empowerher.jpg", isFeatured: false },
  { slug: "chemistry-innovation-awards", title: "AODI Chemistry Innovation Awards 2025", excerpt: "Celebrating excellence and innovation in chemical sciences across the African continent.", body: "<p>The inaugural AODI Chemistry Innovation Awards recognized outstanding contributions to chemical sciences research and education in Africa. The ceremony brought together researchers, educators, and industry leaders from 20 countries to celebrate achievement and discuss the future of chemistry in Africa.</p><p>The awards highlighted groundbreaking research in sustainable materials, pharmaceutical development, and environmental chemistry, showcasing the incredible talent emerging from African universities and research institutions.</p>", category: "News", featuredImage: "/images/stories/awards.jpg", isFeatured: false },
  { slug: "partnership-global-universities", title: "New Partnerships with Global Universities", excerpt: "AODI announces collaboration agreements with leading universities in Europe and North America.", body: "<p>AODI has signed memoranda of understanding with several prestigious universities, opening new opportunities for African researchers to collaborate with international peers, access specialized equipment, and participate in exchange programmes.</p><p>These partnerships will facilitate joint research projects, visiting scholar programmes, and shared access to research databases and facilities. The collaboration marks a significant step toward AODI's vision of connecting African talent with global opportunities.</p>", category: "Announcements", featuredImage: "/images/stories/partnership.jpg", isFeatured: false },
  { slug: "gmp-2026-applications-open", title: "AODI Announces 2026 Global Mentorship Program Applications Now Open", excerpt: "Applications are now being accepted for the 2026 cohort of the Global Mentorship & Leadership Program, with expanded capacity to support 500 mentees.", body: "<p>AODI is excited to announce that applications for the 2026 Global Mentorship & Leadership Program are now open. This year's program has been expanded to accommodate 500 mentees across 20 African countries.</p><p>The program provides structured mentorship pairing African students and early-career professionals with experienced mentors from academia and industry worldwide. Applications close on March 31, 2026.</p>", category: "News", featuredImage: "/images/stories/gmp-applications.jpg", isFeatured: true },
  { slug: "university-partnerships-2026", title: "AODI Partners with Leading African Universities for Campus Ambassador Program", excerpt: "New partnerships with 12 universities across 8 African countries will extend AODI's reach to thousands of students.", body: "<p>AODI has formalized partnership agreements with 12 leading universities across Nigeria, Ghana, Kenya, South Africa, Tanzania, Rwanda, Ethiopia, and Cameroon for the Campus Ambassador Program.</p><p>These partnerships will enable AODI to embed student-led leadership initiatives within university communities, reaching thousands of students with mentorship, skills training, and career development opportunities.</p>", category: "Announcements", featuredImage: "/images/stories/campus-partners.jpg", isFeatured: false },
]

const DEFAULT_RESOURCES = [
  { title: "AODI Strategic Plan 2024-2028", description: "Our comprehensive five-year strategy outlining our vision, goals, and approach to transforming education and leadership development across Africa.", category: "Publications", fileUrl: "/uploads/strategic-plan-2024.pdf", fileType: "pdf", displayOrder: 1 },
  { title: "Annual Report 2024", description: "A detailed overview of our programmes, impact, and financial performance for the 2024 fiscal year.", category: "Reports", fileUrl: "/uploads/annual-report-2024.pdf", fileType: "pdf", displayOrder: 2 },
  { title: "Mentorship Programme Guide", description: "A comprehensive guide for mentors and mentees participating in AODI's Global Mentorship programme, including best practices and expectations.", category: "Guides", fileUrl: "/uploads/mentorship-guide.pdf", fileType: "pdf", displayOrder: 3 },
  { title: "Research Funding Opportunities", description: "A curated list of research funding opportunities available to early-career African researchers across various disciplines.", category: "Guides", externalUrl: "https://www.aodi.org/funding-guide", fileType: "link", displayOrder: 4 },
  { title: "Career Development Toolkit", description: "Essential resources for career planning, CV writing, and interview preparation tailored for African professionals.", category: "Toolkits", fileUrl: "/uploads/career-toolkit.pdf", fileType: "pdf", displayOrder: 5 },
  { title: "STEM Education Best Practices", description: "A collection of teaching resources and methodologies for improving STEM education in African schools and universities.", category: "Educational Materials", externalUrl: "https://www.aodi.org/stem-resources", fileType: "link", displayOrder: 6 },
]

const DEFAULT_PROGRAMS = [
  { title: "Global Mentorship & Leadership Program", slug: "global-mentorship", summary: "Structured mentorship supporting African students and professionals to navigate global opportunities.", isFeatured: true, ctaText: "Explore", ctaLink: "/get-involved/mentee", displayOrder: 1, accentColor: "bg-aodi-teal", borderColor: "border-aodi-teal", primaryCluster: "Leadership & Mentorship" },
  { title: "EmpowerHer Initiative", slug: "empowerher", summary: "Empowering young African women through mentorship, skills, and leadership development.", isFeatured: false, ctaText: "Learn More", ctaLink: "/apply/empowerher", displayOrder: 2, accentColor: "bg-aodi-gold", borderColor: "border-aodi-gold", primaryCluster: "Skills, Gender & Economic Empowerment" },
  { title: "Campus Ambassador Program", slug: "campus-ambassador", summary: "Student-led leadership initiative embedded within universities and colleges across Africa.", isFeatured: false, ctaText: "Learn More", ctaLink: "/apply/campus-ambassador", displayOrder: 3, accentColor: "bg-aodi-green", borderColor: "border-aodi-green", primaryCluster: "Campus & Youth Engagement" },
  { title: "Conferences & Summits", slug: "conferences", summary: "Annual gatherings bringing together African leaders, mentors, and change-makers.", isFeatured: false, ctaText: "View Events", ctaLink: "/get-involved/partner", displayOrder: 4, accentColor: "bg-[#8B5CF6]", borderColor: "border-[#8B5CF6]" },
  { title: "Workshops & Training", slug: "workshops", summary: "Skill-building workshops and training programs led by industry experts.", isFeatured: false, ctaText: "Browse Workshops", ctaLink: "/get-involved/mentee", displayOrder: 5, accentColor: "bg-[#F59E0B]", borderColor: "border-[#F59E0B]" },
  { title: "Code Yourself Out of Poverty", slug: "code-yourself-out-of-poverty", summary: "Digital skills training for underserved African youth to unlock employment and entrepreneurship.", isFeatured: false, ctaText: "Learn More", displayOrder: 4, accentColor: "bg-aodi-teal", borderColor: "border-aodi-teal", primaryCluster: "Skills, Gender & Economic Empowerment" },
  { title: "STEM Education Workshops", slug: "stem-education-workshops", summary: "Hands-on STEM learning, mentorship, and exposure to real-world scientific careers.", isFeatured: false, ctaText: "Learn More", ctaLink: "/apply/stem-workshops", displayOrder: 5, accentColor: "bg-aodi-teal", borderColor: "border-aodi-teal", primaryCluster: "STEM Education & Research Capacity" },
  { title: "Partner Africa Project (CREI)", slug: "crei", summary: "Building research collaboration between African institutions and global partners.", isFeatured: false, ctaText: "Learn More", ctaLink: "/apply/partner-africa", displayOrder: 6, accentColor: "bg-aodi-teal", borderColor: "border-aodi-teal", primaryCluster: "STEM Education & Research Capacity" },
  { title: "Send the Child to Equipped School", slug: "equipped-school", summary: "Strengthening schools in underserved communities with resources and infrastructure.", isFeatured: false, ctaText: "Learn More", displayOrder: 7, accentColor: "bg-aodi-teal", borderColor: "border-aodi-teal", primaryCluster: "Foundational Education Access" },
]

const DEFAULT_TESTIMONIALS = [
  { name: "Amara Okonkwo", role: "Rhodes Scholar, Oxford University", country: "Nigeria", quote: "The AODI mentorship program transformed my trajectory. My mentor helped me navigate the scholarship application process and connected me with opportunities I never knew existed.", programSlug: "global-mentorship-leadership", displayOrder: 1 },
  { name: "David Mensah", role: "Software Engineer, Google", country: "Ghana", quote: "Through AODI, I connected with mentors who believed in my potential and guided me toward my dream career in tech. The structured support made all the difference.", programSlug: "global-mentorship-leadership", displayOrder: 2 },
  { name: "Fatima Hassan", role: "Medical Student, University of Cape Town", country: "Kenya", quote: "EmpowerHer gave me the confidence and network to pursue medicine. The women-focused leadership training was exactly what I needed.", programSlug: "empowerher", displayOrder: 3 },
  { name: "Chidi Nnamdi", role: "Campus Ambassador, University of Lagos", country: "Nigeria", quote: "Being a Campus Ambassador taught me leadership skills I use every day. AODI gave me a platform to make real impact in my community.", programSlug: "campus-ambassador", displayOrder: 4 },
]

const DEFAULT_IMPACT_METRICS = [
  { category: "Beneficiaries & Reach", label: "Young People Reached", value: "27,000+", unit: "beneficiaries", period: "Since inception", description: "Individuals reached through AODI programs, workshops, mentorship, and outreach initiatives", displayOrder: 1, showOnHomepage: true },
  { category: "Beneficiaries & Reach", label: "Nigerian States Represented", value: "10+", unit: "states", period: "Since inception", description: "Geographic spread of beneficiaries across Nigeria", displayOrder: 2, showOnHomepage: false },
  { category: "Beneficiaries & Reach", label: "African Countries Represented", value: "13", unit: "countries", period: "Since inception", description: "African countries represented across AODI activities", displayOrder: 3, showOnHomepage: true },
  { category: "Beneficiaries & Reach", label: "Underserved Backgrounds", value: "40%+", unit: "beneficiaries", period: "Since inception", description: "Proportion of beneficiaries from underserved or low-income backgrounds", displayOrder: 4, showOnHomepage: false },
  { category: "Education & Capacity Building", label: "Students Trained (STEM)", value: "5,000+", unit: "students", period: "Since inception", description: "Students trained through STEM workshops, lectures, and bootcamps", displayOrder: 5, showOnHomepage: false },
  { category: "Education & Capacity Building", label: "Students Supported (Mentorship)", value: "1,000+", unit: "students", period: "Since inception", description: "Participants supported through structured mentorship programs", displayOrder: 6, showOnHomepage: true },
  { category: "Education & Capacity Building", label: "Cambridge Outreach Participants", value: "5,900+", unit: "participants", period: "Since inception", description: "Participants reached through the Higher Education & Accessibility Cambridge Outreach", displayOrder: 7, showOnHomepage: false },
  { category: "Mentorship & Career Advancement", label: "Global Mentors Engaged", value: "400+", unit: "mentors", period: "Since inception", description: "Mentors engaged across academia and industry", displayOrder: 8, showOnHomepage: true },
  { category: "Mentorship & Career Advancement", label: "Positive Program Outcomes", value: "70%+", unit: "mentees", period: "Program cohorts", description: "GMP mentees reporting improved academic clarity, career direction, or scholarship readiness", displayOrder: 9, showOnHomepage: false },
  { category: "Mentorship & Career Advancement", label: "Progression Outcomes", value: "50+", unit: "beneficiaries", period: "Since inception", description: "Mentees securing scholarships, internships, or academic placements", displayOrder: 10, showOnHomepage: false },
  { category: "Programs & Partnerships", label: "Flagship Programs Delivered", value: "5+", unit: "programs", period: "Since inception", description: "Core leadership, mentorship, and access initiatives delivered", displayOrder: 11, showOnHomepage: true },
  { category: "Programs & Partnerships", label: "Institutional Partners", value: "15+", unit: "partners", period: "Since inception", description: "Strategic and institutional partners engaged", displayOrder: 12, showOnHomepage: true },
]

const DEFAULT_INTEGRATIONS = [
  { integrationKey: "brevo", displayName: "Brevo (Sendinblue)", description: "Email delivery service for transactional emails, newsletters and CRM campaigns", secretsRequired: "BREVO_API_KEY,BREVO_SENDER_EMAIL,BREVO_SENDER_NAME", category: "email" },
  { integrationKey: "smtp", displayName: "SMTP Email", description: "Standard SMTP email configuration for sending emails", secretsRequired: "SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASS", category: "email" },
  { integrationKey: "google_analytics", displayName: "Google Analytics 4", description: "Website traffic analytics and user behavior tracking", secretsRequired: "NEXT_PUBLIC_GA_MEASUREMENT_ID", category: "analytics" },
  { integrationKey: "paystack", displayName: "Paystack", description: "African payment gateway for processing donations and payments", secretsRequired: "PAYSTACK_SECRET_KEY,NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", category: "payments" },
  { integrationKey: "paypal", displayName: "PayPal", description: "Global payment gateway for international donations", secretsRequired: "PAYPAL_CLIENT_ID,PAYPAL_CLIENT_SECRET", category: "payments" },
  { integrationKey: "hcaptcha", displayName: "hCaptcha", description: "Bot protection and spam prevention for website forms", secretsRequired: "HCAPTCHA_SECRET_KEY,NEXT_PUBLIC_HCAPTCHA_SITE_KEY", category: "security" },
  { integrationKey: "sentry", displayName: "Sentry", description: "Application error monitoring and performance tracking", secretsRequired: "SENTRY_DSN,SENTRY_AUTH_TOKEN", category: "monitoring" },
]

async function seedIfEmpty<T extends Record<string, unknown>>(table: Parameters<typeof db.select>[0] extends undefined ? never : never, tableName: string, data: T[]): Promise<number> {
  return 0
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const results: Record<string, number> = {}

    const existingPerms = await db.select({ key: permissions.key }).from(permissions)
    const existingPermKeys = new Set(existingPerms.map(p => p.key))
    const newPerms = DEFAULT_PERMISSIONS.filter(p => !existingPermKeys.has(p.key))
    if (newPerms.length > 0) {
      await db.insert(permissions).values(newPerms)
    }
    results.permissions = newPerms.length

    let [superAdminRole] = await db.select().from(roles).where(eq(roles.name, "Super Admin"))
    if (!superAdminRole) {
      const [newRole] = await db.insert(roles).values({
        name: "Super Admin",
        description: "Full system access with all permissions",
        isSystemRole: true,
      }).returning()
      superAdminRole = newRole
      results.rolesCreated = 1
    } else {
      results.rolesCreated = 0
    }

    const allPerms = await db.select({ key: permissions.key }).from(permissions)
    const existingRolePerms = await db
      .select({ permissionKey: rolePermissions.permissionKey })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, superAdminRole.id))
    const existingRolePermKeys = new Set(existingRolePerms.map(p => p.permissionKey))
    const newRolePerms = allPerms
      .filter(p => !existingRolePermKeys.has(p.key))
      .map(p => ({ roleId: superAdminRole.id, permissionKey: p.key }))
    if (newRolePerms.length > 0) {
      await db.insert(rolePermissions).values(newRolePerms)
    }
    results.rolePermissions = newRolePerms.length

    const existingForms = await db.select({ slug: forms.slug }).from(forms)
    const existingSlugs = new Set(existingForms.map(f => f.slug))
    let formsCreated = 0

    for (const form of BUILT_IN_FORMS) {
      if (!existingSlugs.has(form.slug)) {
        const [newForm] = await db.insert(forms).values(form).returning()
        formsCreated++

        const fields = COMMON_FORM_FIELDS[form.slug]
        if (fields && fields.length > 0) {
          await db.insert(formFields).values(
            fields.map(field => ({
              ...field,
              formId: newForm.id,
            }))
          )
        }
      }
    }
    results.formsCreated = formsCreated

    const existingIntegrations = await db.select({ integrationKey: integrationSettings.integrationKey }).from(integrationSettings)
    const existingIntegrationKeys = new Set(existingIntegrations.map(i => i.integrationKey))
    const newIntegrations = DEFAULT_INTEGRATIONS.filter(i => !existingIntegrationKeys.has(i.integrationKey))
    if (newIntegrations.length > 0) {
      await db.insert(integrationSettings).values(newIntegrations)
    }
    results.integrationsCreated = newIntegrations.length

    const existingPartners = await db.select({ name: partners.name }).from(partners)
    if (existingPartners.length === 0) {
      await db.insert(partners).values(DEFAULT_PARTNERS)
      results.partnersCreated = DEFAULT_PARTNERS.length
    } else {
      results.partnersCreated = 0
    }

    const existingStories = await db.select({ slug: stories.slug }).from(stories)
    const existingStorySlugs = new Set(existingStories.map(s => s.slug))
    const newStories = DEFAULT_STORIES.filter(s => !existingStorySlugs.has(s.slug))
    if (newStories.length > 0) {
      await db.insert(stories).values(newStories)
    }
    results.storiesCreated = newStories.length

    const existingResources = await db.select({ title: resources.title }).from(resources)
    if (existingResources.length === 0) {
      await db.insert(resources).values(DEFAULT_RESOURCES)
      results.resourcesCreated = DEFAULT_RESOURCES.length
    } else {
      results.resourcesCreated = 0
    }

    const existingPrograms = await db.select({ slug: programs.slug }).from(programs)
    const existingProgramSlugs = new Set(existingPrograms.map(p => p.slug))
    const newPrograms = DEFAULT_PROGRAMS.filter(p => !existingProgramSlugs.has(p.slug))
    if (newPrograms.length > 0) {
      await db.insert(programs).values(newPrograms)
    }
    results.programsCreated = newPrograms.length

    const existingTestimonials = await db.select({ name: testimonials.name }).from(testimonials)
    if (existingTestimonials.length === 0) {
      await db.insert(testimonials).values(DEFAULT_TESTIMONIALS)
      results.testimonialsCreated = DEFAULT_TESTIMONIALS.length
    } else {
      results.testimonialsCreated = 0
    }

    const existingMetrics = await db.select({ label: impactMetrics.label }).from(impactMetrics)
    if (existingMetrics.length === 0) {
      await db.insert(impactMetrics).values(DEFAULT_IMPACT_METRICS)
      results.impactMetricsCreated = DEFAULT_IMPACT_METRICS.length
    } else {
      results.impactMetricsCreated = 0
    }

    // Backfill: create CRM contacts for any applications that don't have a matching contact
    const formTypeToLabel: Record<string, string> = {
      contact: 'Contact Form',
      mentor: 'Mentor Application',
      mentee: 'Mentee Application',
      volunteer: 'Volunteer Application',
      partner: 'Partnership Enquiry',
      'campus-ambassador': 'Campus Ambassador Application',
      empowerher: 'EmpowerHer Application',
      'partner-africa': 'Partner Africa Application',
      'stem-workshops': 'STEM Workshops Interest',
      'chembridge-2026': 'ChemBridge 2026 Registration',
    }
    const orphanedApps = await db
      .select()
      .from(applications)
      .where(
        notExists(
          db.select({ id: contacts.id }).from(contacts).where(eq(contacts.email, applications.email))
        )
      )
    const seenEmails = new Set<string>()
    let contactsBackfilled = 0
    for (const app of orphanedApps) {
      if (seenEmails.has(app.email)) continue
      seenEmails.add(app.email)
      await db.insert(contacts).values({
        fullName: app.fullName,
        email: app.email,
        subject: formTypeToLabel[app.type] || app.type,
        message: app.message || `Submitted via ${app.type}`,
        status: 'new',
      })
      contactsBackfilled++
    }
    results.contactsBackfilled = contactsBackfilled

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      results,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Failed to seed database", details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const counts: Record<string, number> = {}
    
    const permRows = await db.select({ count: sql<number>`count(*)` }).from(permissions)
    counts.permissions = Number(permRows[0]?.count || 0)
    
    const roleRows = await db.select({ count: sql<number>`count(*)` }).from(roles)
    counts.roles = Number(roleRows[0]?.count || 0)
    
    const formRows = await db.select({ count: sql<number>`count(*)` }).from(forms)
    counts.forms = Number(formRows[0]?.count || 0)
    
    const partnerRows = await db.select({ count: sql<number>`count(*)` }).from(partners)
    counts.partners = Number(partnerRows[0]?.count || 0)

    const storyRows = await db.select({ count: sql<number>`count(*)` }).from(stories)
    counts.stories = Number(storyRows[0]?.count || 0)

    const resourceRows = await db.select({ count: sql<number>`count(*)` }).from(resources)
    counts.resources = Number(resourceRows[0]?.count || 0)

    const programRows = await db.select({ count: sql<number>`count(*)` }).from(programs)
    counts.programs = Number(programRows[0]?.count || 0)

    const testimonialRows = await db.select({ count: sql<number>`count(*)` }).from(testimonials)
    counts.testimonials = Number(testimonialRows[0]?.count || 0)

    const impactRows = await db.select({ count: sql<number>`count(*)` }).from(impactMetrics)
    counts.impactMetrics = Number(impactRows[0]?.count || 0)

    return NextResponse.json({
      status: "ok",
      counts,
      needsSeeding: counts.permissions === 0 || counts.forms === 0 || counts.partners === 0 || counts.stories === 0,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to check status", details: String(error) }, { status: 500 })
  }
}
