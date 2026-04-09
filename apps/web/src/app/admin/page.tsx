"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, GraduationCap, Handshake, LogOut, RefreshCw, Download, X, Plus, Trash2, Edit, Shield, BarChart3, BookOpen, Building2, Quote, FileText, BookMarked, Calendar, Heart, MessageCircle, Mail, CheckSquare, List, LayoutGrid, GripVertical, Inbox, Settings, Activity, Linkedin, Zap, AlertCircle, CheckCircle2, ExternalLink, Menu, PanelLeftClose, PanelLeft, Copy, Search, Filter, SlidersHorizontal, ChevronDown, ChevronUp, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApplicationCRMPanel } from "@/components/admin/ApplicationCRMPanel"
import { EmailTemplatesManager } from "@/components/admin/EmailTemplatesManager"
import { EmailAccountsManager } from "@/components/admin/EmailAccountsManager"
import { CRMInbox } from "@/components/admin/CRMInbox"
import { EmailComposer } from "@/components/admin/EmailComposer"
import { BulkEmailDialog } from "@/components/admin/BulkEmailDialog"
import { EmailLogsViewer } from "@/components/admin/EmailLogsViewer"
import { RoleManager } from "@/components/admin/RoleManager"
import { UserManager } from "@/components/admin/UserManager"
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard"
import { ActivityLogDashboard } from "@/components/admin/ActivityLogDashboard"
import { SiteSettingsManager } from "@/components/admin/SiteSettingsManager"
import { FormsManager } from "@/components/admin/FormsManager"
import { MediaLibraryManager } from "@/components/admin/MediaLibraryManager"
import { NewsletterManager } from "@/components/admin/NewsletterManager"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { SwitchableChart, DonutChart } from "@/components/ui/charts"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Application {
  id: number
  type: string
  fullName: string
  email: string
  organization: string | null
  message: string
  payload: string
  status: string
  createdAt: string
}

interface Trustee {
  id: number
  name: string
  role: string
  bio: string
  photoUrl: string | null
  linkedinUrl: string | null
  displayOrder: number
  isActive: boolean
}

interface ExecutiveDirectorProfile {
  id: number
  name: string
  title: string
  bio: string
  photoUrl: string | null
  linkedinUrl: string | null
  isActive: boolean
}

interface ImpactMetric {
  id: number
  category: string
  label: string
  value: string
  unit: string | null
  period: string
  description: string | null
  displayOrder: number
  isActive: boolean
  showOnHomepage: boolean
}

interface Program {
  id: number
  title: string
  slug: string
  summary: string
  description: string | null
  primaryCluster: string | null
  isFeatured: boolean
  ctaText: string
  accentColor: string
  borderColor: string
  steps: { title: string; description: string }[] | null
  benefits: string[] | null
  eligibility: string[] | null
  faqs: { question: string; answer: string }[] | null
  ctaLink: string | null
  displayOrder: number
  isActive: boolean
}

interface EventObjective {
  icon: string
  title: string
  description: string
}

interface Event {
  id: number
  title: string
  slug: string
  subtitle: string | null
  startDate: string
  endDate: string | null
  location: string | null
  mode: string
  summary: string
  body: string | null
  registrationLabel: string
  registrationUrl: string | null
  status: string
  isFeatured: boolean
  heroImage: string | null
  gallery: string | null
  pageTemplate: string
  overviewTitle: string
  objectives: EventObjective[] | null
  eligibilityCriteria: string[] | null
  eligibilityTitle: string
  eligibilityIntro: string | null
  deliveryTitle: string
  deliveryDescription: string | null
  duration: string | null
  certificate: string | null
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string
  displayOrder: number
  isActive: boolean
}

const programClusters = [
  "Leadership & Mentorship",
  "Campus & Youth Engagement",
  "Skills, Gender & Economic Empowerment",
  "STEM Education & Research Capacity",
  "Foundational Education Access"
] as const

interface Partner {
  id: number
  name: string
  type: string
  logoUrl: string | null
  url: string | null
  description: string | null
  displayOrder: number
  isActive: boolean
}

interface Testimonial {
  id: number
  name: string
  role: string
  country: string
  quote: string
  programSlug: string | null
  photoUrl: string | null
  displayOrder: number
  isActive: boolean
}

interface Story {
  id: number
  slug: string
  title: string
  excerpt: string
  body: string
  category: string
  featuredImage: string | null
  tags: string | null
  publishDate: string
  isFeatured: boolean
  isActive: boolean
}

interface Resource {
  id: number
  title: string
  description: string
  category: string
  fileUrl: string | null
  externalUrl: string | null
  fileType: string | null
  displayOrder: number
  isActive: boolean
}

interface Donation {
  id: number
  donorName: string
  donorEmail: string
  amount: string
  currency: string
  paymentMethod: string
  paymentReference: string | null
  donationType: string
  programSlug: string | null
  message: string | null
  isAnonymous: boolean
  status: string
  createdAt: string
}

interface Contact {
  id: number
  fullName: string
  email: string
  subject: string | null
  message: string
  status: string
  createdAt: string
}

interface IntegrationSetting {
  id: number
  integrationKey: string
  displayName: string
  description: string | null
  isEnabled: boolean
  secretsRequired: string | null
  secretsConfigured: boolean
  configValue: string | null
  category: string
  updatedAt: string
}

const typeLabels: Record<string, string> = {
  partner: "Partner Inquiry",
  "partner-africa": "Partner Africa",
  mentor: "Mentor Application",
  mentee: "Mentee Application",
  volunteer: "Volunteer Application",
  "campus-ambassador": "Campus Ambassador",
  empowerher: "EmpowerHer Initiative",
  "stem-workshops": "STEM Workshops"
}

const typeIcons: Record<string, typeof Users> = {
  partner: Handshake,
  "partner-africa": Handshake,
  mentor: UserCheck,
  mentee: GraduationCap,
  volunteer: Users,
  "campus-ambassador": Users,
  empowerher: Users,
  "stem-workshops": Users
}

const typeColors: Record<string, string> = {
  partner: "bg-blue-100 text-blue-800",
  "partner-africa": "bg-blue-100 text-blue-800",
  mentor: "bg-green-100 text-green-800",
  mentee: "bg-purple-100 text-purple-800",
  volunteer: "bg-orange-100 text-orange-800",
  "campus-ambassador": "bg-teal-100 text-teal-800",
  empowerher: "bg-pink-100 text-pink-800",
  "stem-workshops": "bg-indigo-100 text-indigo-800"
}

const statusColors: Record<string, string> = {
  new: "bg-yellow-100 text-yellow-800",
  in_review: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
}

const statusLabels: Record<string, string> = {
  new: "New",
  in_review: "In Review",
  contacted: "Contacted",
  accepted: "Accepted",
  rejected: "Rejected"
}

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [filter, setFilter] = useState("applications")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [activeTab, setActiveTab] = useState("applications")
  
  // Advanced filtering
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [payloadFilter, setPayloadFilter] = useState<{ field: string; value: string }>({ field: "", value: "" })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  
  // Custom chart builder
  const [customChartType, setCustomChartType] = useState("all")
  const [customChartField, setCustomChartField] = useState("")
  const [customChartDisplay, setCustomChartDisplay] = useState("bar")
  
  const [trustees, setTrustees] = useState<Trustee[]>([])
  const [governanceContent, setGovernanceContent] = useState<Record<string, string>>({})
  const [trusteesLoading, setTrusteesLoading] = useState(false)
  const [editingTrustee, setEditingTrustee] = useState<Trustee | null>(null)
  const [showTrusteeForm, setShowTrusteeForm] = useState(false)
  const [editingContent, setEditingContent] = useState<string | null>(null)
  const [execDirector, setExecDirector] = useState<ExecutiveDirectorProfile | null>(null)
  const [showExecDirectorForm, setShowExecDirectorForm] = useState(false)
  
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([])
  const [impactLoading, setImpactLoading] = useState(false)
  const [editingMetric, setEditingMetric] = useState<ImpactMetric | null>(null)
  const [showMetricForm, setShowMetricForm] = useState(false)
  const [newMetricData, setNewMetricData] = useState({ category: "Beneficiaries & Reach", label: "", value: "", unit: "", period: "Since inception", description: "", showOnHomepage: false, isActive: true })
  
  const [programsList, setProgramsList] = useState<Program[]>([])
  const [programsLoading, setProgramsLoading] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [showProgramForm, setShowProgramForm] = useState(false)
  
  const [partnersList, setPartnersList] = useState<Partner[]>([])
  const [partnersLoading, setPartnersLoading] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [showPartnerForm, setShowPartnerForm] = useState(false)
  
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [showTestimonialForm, setShowTestimonialForm] = useState(false)
  
  const [storiesList, setStoriesList] = useState<Story[]>([])
  const [storiesLoading, setStoriesLoading] = useState(false)
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [showStoryForm, setShowStoryForm] = useState(false)
  
  const [resourcesList, setResourcesList] = useState<Resource[]>([])
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [showResourceForm, setShowResourceForm] = useState(false)
  
  const [eventsList, setEventsList] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  
  const [donationsList, setDonationsList] = useState<Donation[]>([])
  const [donationsStats, setDonationsStats] = useState<{ total: number; totalAmount: string | null }>({ total: 0, totalAmount: null })
  const [donationsLoading, setDonationsLoading] = useState(false)
  
  const [contactsList, setContactsList] = useState<Contact[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactsSearch, setContactsSearch] = useState("")
  const [contactsStatusFilter, setContactsStatusFilter] = useState("all")
  const [expandedContactId, setExpandedContactId] = useState<number | null>(null)
  const [contactHistory, setContactHistory] = useState<Record<number, Application[]>>({})
  const [contactHistoryLoading, setContactHistoryLoading] = useState<number | null>(null)
  const [donorEmailOpen, setDonorEmailOpen] = useState(false)
  const [donorEmailTarget, setDonorEmailTarget] = useState<{ email: string; name: string } | null>(null)
  
  const [integrations, setIntegrations] = useState<IntegrationSetting[]>([])
  const [integrationsLoading, setIntegrationsLoading] = useState(false)
  
  const [selectedAppIds, setSelectedAppIds] = useState<number[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [bulkEmailDialogOpen, setBulkEmailDialogOpen] = useState(false)
  const [bulkEmailRecipients, setBulkEmailRecipients] = useState<{ email: string; name: string; id: number }[]>([])
  const [contactReplyOpen, setContactReplyOpen] = useState(false)
  const [contactReplyTarget, setContactReplyTarget] = useState<{ email: string; name: string } | null>(null)
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const [currentUser, setCurrentUser] = useState<{
    id: number
    email: string
    fullName: string
    roleId: number
    roleName: string | null
    permissions: string[]
  } | null>(null)
  
  const router = useRouter()
  
  const hasPermission = (permission: string) => {
    return currentUser?.permissions?.includes(permission) ?? false
  }

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchAllApplications()
    }
  }, [authenticated])

  useEffect(() => {
    if (authenticated && activeTab === "governance") {
      fetchGovernanceData()
    } else if (authenticated && activeTab === "impact") {
      fetchImpactData()
    } else if (authenticated && activeTab === "programs") {
      fetchProgramsData()
    } else if (authenticated && activeTab === "partners") {
      fetchPartnersData()
    } else if (authenticated && activeTab === "testimonials") {
      fetchTestimonialsData()
    } else if (authenticated && activeTab === "stories") {
      fetchStoriesData()
    } else if (authenticated && activeTab === "resources") {
      fetchResourcesData()
    } else if (authenticated && activeTab === "events") {
      fetchEventsData()
    } else if (authenticated && activeTab === "donations") {
      fetchDonationsData()
    } else if (authenticated && activeTab === "contacts") {
      fetchContactsData()
    } else if (authenticated && activeTab === "integrations") {
      fetchIntegrations()
    }
  }, [authenticated, activeTab])

  useEffect(() => {
    if (filter === "all") {
      setApplications(allApplications)
    } else if (filter === "applications") {
      setApplications(allApplications.filter(a => a.type !== "contact"))
    } else {
      setApplications(allApplications.filter(a => a.type === filter))
    }
  }, [filter, allApplications])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, statusFilter, searchQuery, dateFrom, dateTo, payloadFilter, itemsPerPage])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/check")
      if (response.ok) {
        const data = await response.json()
        setAuthenticated(true)
        if (data.user) {
          setCurrentUser(data.user)
        }
      } else {
        router.push("/admin/login")
      }
    } catch {
      router.push("/admin/login")
    }
  }

  const fetchAllApplications = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/applications?type=all")
      if (response.ok) {
        const data = await response.json()
        setAllApplications(data)
        if (filter === "all") {
          setApplications(data)
        } else if (filter === "applications") {
          setApplications(data.filter((a: Application) => a.type !== "contact"))
        } else {
          setApplications(data.filter((a: Application) => a.type === filter))
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGovernanceData = async () => {
    setTrusteesLoading(true)
    try {
      const response = await fetch("/api/admin/governance")
      if (response.ok) {
        const data = await response.json()
        setTrustees(data.trustees || [])
        setGovernanceContent(data.content || {})
        setExecDirector(data.executiveDirector || null)
      }
    } catch (error) {
      console.error("Error fetching governance data:", error)
    } finally {
      setTrusteesLoading(false)
    }
  }

  const fetchImpactData = async () => {
    setImpactLoading(true)
    try {
      const response = await fetch("/api/admin/impact-metrics")
      if (response.ok) {
        const data = await response.json()
        setImpactMetrics(data.metrics || [])
      }
    } catch (error) {
      console.error("Error fetching impact metrics:", error)
    } finally {
      setImpactLoading(false)
    }
  }

  const fetchProgramsData = async () => {
    setProgramsLoading(true)
    try {
      const response = await fetch("/api/admin/programs")
      if (response.ok) {
        const data = await response.json()
        setProgramsList(data || [])
      }
    } catch (error) {
      console.error("Error fetching programs:", error)
    } finally {
      setProgramsLoading(false)
    }
  }

  const fetchPartnersData = async () => {
    setPartnersLoading(true)
    try {
      const response = await fetch("/api/admin/partners")
      if (response.ok) {
        const data = await response.json()
        setPartnersList(data || [])
      }
    } catch (error) {
      console.error("Error fetching partners:", error)
    } finally {
      setPartnersLoading(false)
    }
  }

  const fetchTestimonialsData = async () => {
    setTestimonialsLoading(true)
    try {
      const response = await fetch("/api/admin/testimonials")
      if (response.ok) {
        const data = await response.json()
        setTestimonialsList(data || [])
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setTestimonialsLoading(false)
    }
  }

  const fetchStoriesData = async () => {
    setStoriesLoading(true)
    try {
      const response = await fetch("/api/admin/stories")
      if (response.ok) {
        const data = await response.json()
        setStoriesList(data || [])
      }
    } catch (error) {
      console.error("Error fetching stories:", error)
    } finally {
      setStoriesLoading(false)
    }
  }

  const fetchResourcesData = async () => {
    setResourcesLoading(true)
    try {
      const response = await fetch("/api/admin/resources")
      if (response.ok) {
        const data = await response.json()
        setResourcesList(data || [])
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
    } finally {
      setResourcesLoading(false)
    }
  }

  const fetchEventsData = async () => {
    setEventsLoading(true)
    try {
      const response = await fetch("/api/admin/events")
      if (response.ok) {
        const data = await response.json()
        setEventsList(data || [])
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setEventsLoading(false)
    }
  }

  const fetchDonationsData = async () => {
    setDonationsLoading(true)
    try {
      const response = await fetch("/api/admin/donations")
      if (response.ok) {
        const data = await response.json()
        setDonationsList(data.donations || [])
        setDonationsStats(data.stats || { total: 0, totalAmount: null })
      }
    } catch (error) {
      console.error("Error fetching donations:", error)
    } finally {
      setDonationsLoading(false)
    }
  }

  const fetchContactsData = async () => {
    setContactsLoading(true)
    try {
      const response = await fetch("/api/admin/contacts")
      if (response.ok) {
        const data = await response.json()
        setContactsList(data || [])
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setContactsLoading(false)
    }
  }

  const fetchContactHistory = async (contactId: number) => {
    if (contactHistory[contactId]) {
      setExpandedContactId(prev => prev === contactId ? null : contactId)
      return
    }
    setContactHistoryLoading(contactId)
    setExpandedContactId(contactId)
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}/history`)
      if (res.ok) {
        const data = await res.json()
        setContactHistory(prev => ({ ...prev, [contactId]: data.submissions || [] }))
      }
    } catch (err) {
      console.error("Error fetching contact history:", err)
    } finally {
      setContactHistoryLoading(null)
    }
  }

  const handleContactStatusChange = async (contactId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        setContactsList(prev => prev.map(c => c.id === contactId ? { ...c, status: newStatus } : c))
      }
    } catch (error) {
      console.error("Error updating contact status:", error)
    }
  }

  const fetchIntegrations = async () => {
    setIntegrationsLoading(true)
    try {
      const response = await fetch("/api/admin/integrations")
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data || [])
      }
    } catch (error) {
      console.error("Error fetching integrations:", error)
    } finally {
      setIntegrationsLoading(false)
    }
  }

  const updateIntegration = async (integrationKey: string, updates: { isEnabled?: boolean; configValue?: string }) => {
    try {
      const response = await fetch("/api/admin/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationKey, ...updates })
      })
      if (response.ok) {
        const updated = await response.json()
        setIntegrations(prev => prev.map(i => i.integrationKey === integrationKey ? updated : i))
      }
    } catch (error) {
      console.error("Error updating integration:", error)
    }
  }

  const handleSelectApp = (appId: number, selected: boolean) => {
    if (selected) {
      setSelectedAppIds(prev => [...prev, appId])
    } else {
      setSelectedAppIds(prev => prev.filter(id => id !== appId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedAppIds(filteredApplications.map(a => a.id))
    } else {
      setSelectedAppIds([])
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedAppIds.length === 0) return
    if (!confirm(`Update ${selectedAppIds.length} applications to ${newStatus}?`)) return
    
    setBulkActionLoading(true)
    try {
      const response = await fetch("/api/admin/applications/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedAppIds, status: newStatus })
      })
      if (response.ok) {
        fetchAllApplications()
        setSelectedAppIds([])
      }
    } catch (error) {
      console.error("Error bulk updating:", error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedAppIds.length === 0) return
    if (!confirm(`Delete ${selectedAppIds.length} applications? This cannot be undone.`)) return
    
    setBulkActionLoading(true)
    try {
      const response = await fetch("/api/admin/applications/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedAppIds })
      })
      if (response.ok) {
        fetchAllApplications()
        setSelectedAppIds([])
      }
    } catch (error) {
      console.error("Error bulk deleting:", error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkEmail = () => {
    const selectedApps = applications.filter(a => selectedAppIds.includes(a.id) && a.email)
    if (selectedApps.length === 0) return
    const recipients = selectedApps.map(a => ({ email: a.email!, name: a.fullName || a.email!, id: a.id }))
    setBulkEmailRecipients(recipients)
    setBulkEmailDialogOpen(true)
  }

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    try {
      if (editingEvent?.id) {
        const response = await fetch(`/api/admin/events/${editingEvent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData)
        })
        if (response.ok) {
          fetchEventsData()
        }
      } else {
        const response = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData)
        })
        if (response.ok) {
          fetchEventsData()
        }
      }
      setShowEventForm(false)
      setEditingEvent(null)
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchEventsData()
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  const handleDuplicateEvent = async (event: Event) => {
    const newSlug = `${event.slug}-copy-${Date.now().toString(36)}`
    const duplicateData = {
      ...event,
      id: undefined,
      title: `${event.title} (Copy)`,
      slug: newSlug,
      isActive: false,
      createdAt: undefined,
      updatedAt: undefined,
    }
    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicateData)
      })
      if (response.ok) {
        const newEvent = await response.json()
        fetchEventsData()
        setEditingEvent(newEvent)
        setShowEventForm(true)
      }
    } catch (error) {
      console.error("Error duplicating event:", error)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  const handleStatusChange = async (appId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        setAllApplications(prev => 
          prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
        )
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp({ ...selectedApp, status: newStatus })
        }
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const exportCSV = () => {
    const isDefaultView = (filter === "all" || filter === "applications") && statusFilter === "all"
    const dataToExport = isDefaultView ? (filter === "all" ? allApplications : allApplications.filter(a => a.type !== CONTACT_TYPE)) : filteredApplications

    const SYSTEM_KEYS = new Set(["formId", "formName", "submittedAt", "captchaToken", "agreedToPolicy"])

    const payloadMaps: Record<string, unknown>[] = dataToExport.map(app => {
      if (!app.payload) return {}
      try {
        const parsed = JSON.parse(app.payload as string)
        const clean: Record<string, unknown> = {}
        Object.entries(parsed).forEach(([k, v]) => {
          if (!SYSTEM_KEYS.has(k)) clean[k] = v
        })
        return clean
      } catch { return {} }
    })

    const payloadKeys = Array.from(
      payloadMaps.reduce((set, obj) => {
        Object.keys(obj).forEach(k => set.add(k))
        return set
      }, new Set<string>())
    )

    const baseHeaders = ["ID", "Type", "Full Name", "Email", "Organization", "Status", "Submitted At"]
    const payloadHeaders = payloadKeys.map(k =>
      k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2")
        .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    )
    const headers = [...baseHeaders, ...payloadHeaders]

    const escapeCell = (val: unknown): string => {
      const str = val == null ? "" : String(val)
      return str.replace(/"/g, '""')
    }

    const csvData = dataToExport.map((app, i) => {
      const payload = payloadMaps[i]
      const baseRow = [
        app.id,
        app.type,
        app.fullName,
        app.email,
        app.organization || "",
        app.status,
        new Date(app.createdAt).toISOString(),
      ]
      const payloadRow = payloadKeys.map(k => escapeCell(payload[k]))
      return [...baseRow.map(escapeCell), ...payloadRow]
    })

    const csvContent = [
      headers.map(h => `"${h}"`).join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `aodi-applications-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const parsePayload = (payload: string) => {
    try {
      return JSON.parse(payload)
    } catch {
      return {}
    }
  }

  const handleSaveTrustee = async (trusteeData: Partial<Trustee>) => {
    try {
      if (editingTrustee?.id) {
        const response = await fetch(`/api/admin/trustees/${editingTrustee.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trusteeData)
        })
        if (response.ok) {
          fetchGovernanceData()
        }
      } else {
        const response = await fetch("/api/admin/trustees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trusteeData)
        })
        if (response.ok) {
          fetchGovernanceData()
        }
      }
      setShowTrusteeForm(false)
      setEditingTrustee(null)
    } catch (error) {
      console.error("Error saving trustee:", error)
    }
  }

  const handleDeleteTrustee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this trustee?")) return
    try {
      const response = await fetch(`/api/admin/trustees/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchGovernanceData()
      }
    } catch (error) {
      console.error("Error deleting trustee:", error)
    }
  }

  const handleSaveExecDirector = async (data: Partial<ExecutiveDirectorProfile>) => {
    try {
      const response = await fetch("/api/admin/executive-director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        fetchGovernanceData()
        setShowExecDirectorForm(false)
      }
    } catch (error) {
      console.error("Error saving executive director:", error)
    }
  }

  const handleSaveContent = async (key: string, value: string) => {
    try {
      const response = await fetch("/api/admin/governance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      })
      if (response.ok) {
        setGovernanceContent(prev => ({ ...prev, [key]: value }))
        setEditingContent(null)
      }
    } catch (error) {
      console.error("Error saving content:", error)
    }
  }

  const handleUpdateMetric = async (id: number, updates: Partial<ImpactMetric>) => {
    try {
      const response = await fetch(`/api/admin/impact-metrics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        setImpactMetrics(prev => 
          prev.map(m => m.id === id ? { ...m, ...updates } : m)
        )
        setEditingMetric(null)
      }
    } catch (error) {
      console.error("Error updating metric:", error)
    }
  }

  const handleCreateMetric = async () => {
    try {
      const response = await fetch("/api/admin/impact-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMetricData, displayOrder: impactMetrics.length + 1 })
      })
      if (response.ok) {
        setShowMetricForm(false)
        setNewMetricData({ category: "Beneficiaries & Reach", label: "", value: "", unit: "", period: "Since inception", description: "", showOnHomepage: false, isActive: true })
        await fetchImpactData()
      }
    } catch (error) {
      console.error("Error creating metric:", error)
    }
  }

  const handleDeleteMetric = async (id: number) => {
    if (!confirm("Are you sure you want to delete this impact metric?")) return
    try {
      const response = await fetch(`/api/admin/impact-metrics/${id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchImpactData()
      }
    } catch (error) {
      console.error("Error deleting metric:", error)
    }
  }

  const handleSaveProgram = async (programData: Partial<Program>) => {
    try {
      if (editingProgram?.id) {
        const response = await fetch(`/api/admin/programs/${editingProgram.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(programData)
        })
        if (response.ok) {
          fetchProgramsData()
        }
      } else {
        const response = await fetch("/api/admin/programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(programData)
        })
        if (response.ok) {
          fetchProgramsData()
        }
      }
      setShowProgramForm(false)
      setEditingProgram(null)
    } catch (error) {
      console.error("Error saving program:", error)
    }
  }

  const handleDeleteProgram = async (id: number) => {
    if (!confirm("Are you sure you want to delete this program?")) return
    try {
      const response = await fetch(`/api/admin/programs/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchProgramsData()
      }
    } catch (error) {
      console.error("Error deleting program:", error)
    }
  }

  const handleToggleProgramActive = async (program: Program) => {
    try {
      const response = await fetch(`/api/admin/programs/${program.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !program.isActive })
      })
      if (response.ok) {
        setProgramsList(prev => 
          prev.map(p => p.id === program.id ? { ...p, isActive: !p.isActive } : p)
        )
      }
    } catch (error) {
      console.error("Error toggling program status:", error)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Base application types with icons
  const baseTypeConfig: Record<string, { label: string; icon: typeof Users }> = {
    partner: { label: "Partners", icon: Handshake },
    "partner-africa": { label: "Partners Africa", icon: Handshake },
    mentor: { label: "Mentors", icon: UserCheck },
    mentee: { label: "Mentees", icon: GraduationCap },
    volunteer: { label: "Volunteers", icon: Users },
    "campus-ambassador": { label: "Campus Ambassadors", icon: Users },
    empowerher: { label: "EmpowerHer", icon: Users },
    "stem-workshops": { label: "STEM Workshops", icon: Users },
    "chembridge-2026": { label: "ChemBridge 2026", icon: GraduationCap },
    contact: { label: "Contact", icon: MessageCircle },
  }

  // Dynamically generate application types from actual data — exclude 'contact' from program applications
  const CONTACT_TYPE = "contact"
  const uniqueTypes = [...new Set(allApplications.map(a => a.type))]
  const applicationTypes = uniqueTypes
    .filter(key => key !== CONTACT_TYPE)
    .map(key => ({
      key,
      label: baseTypeConfig[key]?.label || key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      icon: baseTypeConfig[key]?.icon || Users,
    }))

  const statusOptions = [
    { key: "all", label: "All Stages" },
    { key: "new", label: "New" },
    { key: "in_review", label: "In Review" },
    { key: "contacted", label: "Contacted" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
  ]

  const stats: Record<string, number> = {
    applications: allApplications.filter(a => a.type !== CONTACT_TYPE).length,
    messages: allApplications.filter(a => a.type === CONTACT_TYPE).length,
  }
  applicationTypes.forEach(t => {
    stats[t.key] = allApplications.filter(a => a.type === t.key).length
  })

  const filteredApplications = applications.filter(app => {
    let typeMatch: boolean
    if (filter === "all") {
      typeMatch = true
    } else if (filter === "applications") {
      typeMatch = app.type !== CONTACT_TYPE
    } else if (filter === "contact") {
      typeMatch = app.type === CONTACT_TYPE
    } else {
      typeMatch = app.type === filter
    }
    const statusMatch = statusFilter === "all" || app.status === statusFilter
    
    // Search filter (name or email)
    const searchMatch = !searchQuery || 
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Date range filter
    const appDate = new Date(app.createdAt)
    const dateFromMatch = !dateFrom || appDate >= new Date(dateFrom)
    const dateToMatch = !dateTo || appDate <= new Date(dateTo + 'T23:59:59')
    
    // Payload field filter
    let payloadMatch = true
    if (payloadFilter.field && payloadFilter.value) {
      try {
        const payload = JSON.parse(app.payload || '{}')
        const fieldValue = payload[payloadFilter.field]
        payloadMatch = fieldValue && String(fieldValue).toLowerCase().includes(payloadFilter.value.toLowerCase())
      } catch {
        payloadMatch = true
      }
    }
    
    return typeMatch && statusMatch && searchMatch && dateFromMatch && dateToMatch && payloadMatch
  })
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  
  // Data for charts - should reflect type filter but show all statuses
  const chartApplications =
    filter === "all" ? allApplications :
    filter === "applications" ? allApplications.filter(a => a.type !== CONTACT_TYPE) :
    filter === "contact" ? allApplications.filter(a => a.type === CONTACT_TYPE) :
    allApplications.filter(a => a.type === filter)
  
  // Extract unique payload fields for filtering
  const payloadFields = [...new Set(
    allApplications.flatMap(app => {
      try {
        const payload = JSON.parse(app.payload || '{}')
        return Object.keys(payload)
      } catch {
        return []
      }
    })
  )].sort()
  
  // Clear all filters function
  const clearAllFilters = () => {
    setFilter("applications")
    setStatusFilter("all")
    setSearchQuery("")
    setDateFrom("")
    setDateTo("")
    setPayloadFilter({ field: "", value: "" })
  }
  
  const hasActiveFilters = (filter !== "all" && filter !== "applications") || statusFilter !== "all" || searchQuery || dateFrom || dateTo || payloadFilter.field
  
  // Custom chart builder computed values
  const customChartApps = customChartType === "all" 
    ? allApplications 
    : allApplications.filter(a => a.type === customChartType)
  
  const customChartPayloadFields = [...new Set(
    customChartApps.flatMap(app => {
      try {
        const payload = JSON.parse(app.payload || '{}')
        return Object.keys(payload)
      } catch {
        return []
      }
    })
  )].sort()
  
  const customChartData = customChartField ? (() => {
    const valueCounts: Record<string, number> = {}
    customChartApps.forEach(app => {
      try {
        const payload = JSON.parse(app.payload || '{}')
        const fieldValue = payload[customChartField]
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          const strValue = String(fieldValue)
          valueCounts[strValue] = (valueCounts[strValue] || 0) + 1
        }
      } catch {
        // Skip invalid JSON
      }
    })
    return Object.entries(valueCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  })() : []

  const getSectionTitle = (section: string) => {
    const titles: Record<string, string> = {
      applications: "Applications",
      analytics: "Analytics",
      governance: "Governance",
      impact: "Impact Metrics",
      programs: "Programs",
      partners: "Partners",
      testimonials: "Testimonials",
      stories: "Stories",
      resources: "Resources",
      events: "Events",
      donations: "Donations",
      contacts: "Contacts",
      "email-templates": "Email Templates",
      inbox: "Inbox",
      "email-settings": "Email Settings",
      "email-logs": "Email Logs",
      newsletter: "Newsletter",
      "site-settings": "Site Settings",
      forms: "Forms",
      "media-library": "Media Library",
      integrations: "Integrations",
      users: "Users",
      roles: "Roles",
      "activity-log": "Activity Log",
    }
    return titles[section] || section
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        activeSection={activeTab}
        onSectionChange={setActiveTab}
        permissions={currentUser?.permissions || []}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b py-3 px-6 flex justify-between items-center gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              data-testid="button-toggle-sidebar"
            >
              {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </Button>
            <h1 className="text-lg font-semibold text-[#0F3D2E]">{getSectionTitle(activeTab)}</h1>
          </div>
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="text-sm text-right hidden sm:block">
                <div className="font-medium text-gray-900">{currentUser.fullName}</div>
                <div className="text-gray-500 text-xs">{currentUser.roleName}</div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="button-admin-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className={activeTab === "applications" ? "block" : "hidden"}>
            {/* Applications content */}
            {/* Type Filter Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              <Card className={`cursor-pointer ${filter === "applications" ? "ring-2 ring-[#0F3D2E]" : ""}`} onClick={() => setFilter("applications")} data-testid="card-stat-all">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">All Applications</p>
                      <p className="text-2xl font-bold text-[#0F3D2E]">{stats.applications}</p>
                    </div>
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              
              {applicationTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card key={type.key} className={`cursor-pointer ${filter === type.key ? "ring-2 ring-[#0F3D2E]" : ""}`} onClick={() => setFilter(type.key)} data-testid={`card-stat-${type.key}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600">{type.label}</p>
                          <p className="text-2xl font-bold text-[#0F3D2E]">{stats[type.key] || 0}</p>
                        </div>
                        <Icon className="w-8 h-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              <Card className={`cursor-pointer border-blue-200 ${filter === "contact" ? "ring-2 ring-blue-600" : ""}`} onClick={() => setFilter("contact")} data-testid="card-stat-contact">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Contact Messages</p>
                      <p className="text-2xl font-bold text-blue-700">{stats.messages}</p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-blue-300" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status/Pipeline Filter */}
            <div className="flex flex-wrap items-center gap-2 mb-4" data-testid="status-filter-bar">
              {statusOptions.map((status) => (
                <Button
                  key={status.key}
                  variant={statusFilter === status.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status.key)}
                  data-testid={`button-status-${status.key}`}
                >
                  {status.label}
                  {status.key !== "all" && (
                    <span className="ml-2 text-xs opacity-70">
                      ({allApplications.filter(a => {
                        const typeOk = filter === "all" ? true : filter === "applications" ? a.type !== CONTACT_TYPE : filter === "contact" ? a.type === CONTACT_TYPE : a.type === filter
                        return a.status === status.key && typeOk
                      }).length})
                    </span>
                  )}
                </Button>
              ))}
              <div className="flex-1" />
              <Button
                variant={showAdvancedFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                data-testid="button-advanced-filters"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced Filters
                {hasActiveFilters && <span className="ml-2 px-1.5 py-0.5 text-xs bg-white text-[#0F3D2E] rounded-full">{[searchQuery, dateFrom, dateTo, payloadFilter.field].filter(Boolean).length + (filter !== "all" && filter !== "applications" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}</span>}
              </Button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <Card className="mb-6 bg-gray-50 border-dashed" data-testid="advanced-filters-panel">
                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 bg-white"
                          data-testid="input-search"
                        />
                      </div>
                    </div>
                    
                    {/* Date From */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1.5 block">From Date</Label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-white"
                        data-testid="input-date-from"
                      />
                    </div>
                    
                    {/* Date To */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1.5 block">To Date</Label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-white"
                        data-testid="input-date-to"
                      />
                    </div>
                    
                    {/* Payload Field Filter */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Form Field Filter</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={payloadFilter.field || "none"} 
                          onValueChange={(v) => setPayloadFilter({ ...payloadFilter, field: v === "none" ? "" : v })}
                        >
                          <SelectTrigger className="w-[120px] bg-white" data-testid="select-payload-field">
                            <SelectValue placeholder="Field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select Field</SelectItem>
                            {payloadFields.map(field => (
                              <SelectItem key={field} value={field}>{field}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Contains..."
                          value={payloadFilter.value}
                          onChange={(e) => setPayloadFilter({ ...payloadFilter, value: e.target.value })}
                          className="flex-1 bg-white"
                          disabled={!payloadFilter.field}
                          data-testid="input-payload-value"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        data-testid="button-clear-filters"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Application Analytics Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {filter === "contact" ? "Contact Messages" : "Applications by Type"}
                    {filter !== "all" && filter !== "applications" && filter !== "contact" && (
                      <span className="text-sm font-normal text-gray-500 ml-2">(Filtered: {baseTypeConfig[filter]?.label || filter})</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chartApplications.length > 0 ? (
                    <SwitchableChart
                      data={applicationTypes.map(type => ({
                        name: type.label,
                        value: chartApplications.filter(a => a.type === type.key).length,
                      })).filter(d => d.value > 0)}
                      config={{
                        dataKey: "value",
                        nameKey: "name",
                        color: "#0F3D2E",
                        allowedTypes: ["bar", "pie", "radar", "funnel"],
                        height: 250,
                      }}
                      defaultType="pie"
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">No applications yet</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {filter === "contact" ? "Messages by Status" : "Applications by Status"}
                    {filter !== "all" && filter !== "applications" && filter !== "contact" && (
                      <span className="text-sm font-normal text-gray-500 ml-2">(Filtered: {baseTypeConfig[filter]?.label || filter})</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chartApplications.length > 0 ? (
                    <SwitchableChart
                      data={statusOptions.slice(1).map(status => ({
                        name: status.label,
                        value: chartApplications.filter(a => a.status === status.key).length,
                      })).filter(d => d.value > 0)}
                      config={{
                        dataKey: "value",
                        nameKey: "name",
                        colors: ["#EAB308", "#3B82F6", "#8B5CF6", "#22C55E", "#EF4444"],
                        allowedTypes: ["bar", "pie", "line", "area", "funnel"],
                        height: 250,
                      }}
                      defaultType="bar"
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">No applications yet</div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Custom Chart Builder */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Custom Chart Builder
                  <span className="text-sm font-normal text-gray-500">- Plot form field data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Form Type</Label>
                    <Select 
                      value={customChartType} 
                      onValueChange={(v) => {
                        setCustomChartType(v)
                        setCustomChartField("")
                      }}
                    >
                      <SelectTrigger className="bg-white" data-testid="select-custom-chart-type">
                        <SelectValue placeholder="Select form type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {applicationTypes.map(type => (
                          <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Field to Analyze</Label>
                    <Select 
                      value={customChartField} 
                      onValueChange={setCustomChartField}
                    >
                      <SelectTrigger className="bg-white" data-testid="select-custom-chart-field">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {customChartPayloadFields.map(field => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Chart Type</Label>
                    <Select 
                      value={customChartDisplay} 
                      onValueChange={setCustomChartDisplay}
                    >
                      <SelectTrigger className="bg-white" data-testid="select-custom-chart-display">
                        <SelectValue placeholder="Chart type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                        <SelectItem value="radar">Radar Chart</SelectItem>
                        <SelectItem value="funnel">Funnel Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {customChartField && customChartData.length > 0 ? (
                  <SwitchableChart
                    data={customChartData}
                    config={{
                      dataKey: "value",
                      nameKey: "name",
                      color: "#0F3D2E",
                      allowedTypes: ["bar", "pie", "line", "area", "radar", "funnel"],
                      height: 300,
                    }}
                    defaultType={customChartDisplay as "bar" | "pie" | "line" | "area" | "radar" | "funnel"}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-12 border-2 border-dashed rounded-lg">
                    {customChartField ? "No data available for this field" : "Select a form type and field to visualize data"}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <CardTitle>
                  {filter === "all" ? "All Submissions" : filter === "applications" ? "All Applications" : filter === "contact" ? "Contact Messages" : applicationTypes.find(t => t.key === filter)?.label || "Applications"}
                  {statusFilter !== "all" && ` - ${statusOptions.find(s => s.key === statusFilter)?.label}`}
                  <span className="ml-2 text-sm font-normal text-gray-500">({filteredApplications.length})</span>
                </CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="flex border rounded-md overflow-hidden">
                    <Button 
                      variant={viewMode === "list" ? "default" : "ghost"} 
                      size="sm" 
                      className="rounded-none"
                      onClick={() => setViewMode("list")}
                      data-testid="button-view-list"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant={viewMode === "kanban" ? "default" : "ghost"} 
                      size="sm" 
                      className="rounded-none"
                      onClick={() => setViewMode("kanban")}
                      data-testid="button-view-kanban"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportCSV} data-testid="button-export">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchAllApplications} data-testid="button-refresh">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedAppIds.length > 0 && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-100 rounded-lg" data-testid="bulk-actions-bar">
                    <span className="text-sm font-medium">{selectedAppIds.length} selected</span>
                    <Select onValueChange={handleBulkStatusChange} disabled={bulkActionLoading}>
                      <SelectTrigger className="w-40" data-testid="select-bulk-status">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Set New</SelectItem>
                        <SelectItem value="in_review">Set In Review</SelectItem>
                        <SelectItem value="contacted">Set Contacted</SelectItem>
                        <SelectItem value="accepted">Set Accepted</SelectItem>
                        <SelectItem value="rejected">Set Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={handleBulkEmail} disabled={bulkActionLoading} className="text-green-700 border-green-200" data-testid="button-bulk-email">
                      <Mail className="w-4 h-4 mr-1" />
                      Send Email
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkDelete} disabled={bulkActionLoading} className="text-red-600" data-testid="button-bulk-delete">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAppIds([])} data-testid="button-clear-selection">
                      Clear
                    </Button>
                  </div>
                )}
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Loading applications...</p>
                ) : viewMode === "list" ? (
                  applications.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No applications found.</p>
                  ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b flex-wrap">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedAppIds.length === paginatedApplications.length && paginatedApplications.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAppIds(paginatedApplications.map(a => a.id))
                            } else {
                              setSelectedAppIds([])
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                          data-testid="checkbox-select-all"
                        />
                        <span className="text-sm text-gray-500">Select page ({paginatedApplications.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Show:</span>
                        <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
                          <SelectTrigger className="w-20 h-8" data-testid="select-items-per-page">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-500">of {filteredApplications.length} total</span>
                      </div>
                    </div>
                    {paginatedApplications.map((app) => (
                      <div
                        key={app.id}
                        className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${selectedAppIds.includes(app.id) ? "ring-2 ring-[#0F3D2E]" : ""}`}
                        data-testid={`application-${app.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedAppIds.includes(app.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleSelectApp(app.id, e.target.checked)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-300 mt-1"
                            data-testid={`checkbox-app-${app.id}`}
                          />
                          <div className="flex-1" onClick={() => setSelectedApp(app)}>
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[app.type]}`}>
                                  {typeLabels[app.type]}
                                </span>
                                <span className="text-sm text-gray-500">{formatDate(app.createdAt)}</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || statusColors.new}`}>
                                {statusLabels[app.status] || app.status}
                              </span>
                            </div>
                            <h3 className="font-semibold text-[#1F2933]" data-testid={`text-name-${app.id}`}>
                              {app.fullName}
                            </h3>
                            <p className="text-sm text-gray-600" data-testid={`text-email-${app.id}`}>
                              {app.email}
                            </p>
                            {app.organization && (
                              <p className="text-sm text-gray-500">{app.organization}</p>
                            )}
                            <p className="mt-2 text-sm text-gray-700 line-clamp-2">{app.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <div className="text-sm text-gray-500">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of {filteredApplications.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            data-testid="button-page-first"
                          >
                            First
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            data-testid="button-page-prev"
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum: number
                              if (totalPages <= 5) {
                                pageNum = i + 1
                              } else if (currentPage <= 3) {
                                pageNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                              } else {
                                pageNum = currentPage - 2 + i
                              }
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className="w-8 h-8 p-0"
                                  data-testid={`button-page-${pageNum}`}
                                >
                                  {pageNum}
                                </Button>
                              )
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            data-testid="button-page-next"
                          >
                            Next
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            data-testid="button-page-last"
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  )
                ) : (
                  /* Kanban View */
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4" data-testid="kanban-board">
                    {[
                      { key: "new", label: "New", color: "bg-yellow-100 border-yellow-300" },
                      { key: "in_review", label: "In Review", color: "bg-blue-100 border-blue-300" },
                      { key: "contacted", label: "Contacted", color: "bg-purple-100 border-purple-300" },
                      { key: "accepted", label: "Accepted", color: "bg-green-100 border-green-300" },
                      { key: "rejected", label: "Rejected", color: "bg-red-100 border-red-300" },
                    ].map((stage) => {
                      const stageApps = (filter === "all" ? allApplications : filter === "applications" ? allApplications.filter(a => a.type !== CONTACT_TYPE) : filter === "contact" ? allApplications.filter(a => a.type === CONTACT_TYPE) : allApplications.filter(a => a.type === filter))
                        .filter(app => app.status === stage.key)
                      return (
                        <div 
                          key={stage.key} 
                          className={`rounded-lg border-2 ${stage.color} min-h-[400px]`}
                          data-testid={`kanban-column-${stage.key}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault()
                            const appId = parseInt(e.dataTransfer.getData("applicationId"))
                            if (appId) {
                              try {
                                const response = await fetch(`/api/admin/applications/${appId}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: stage.key })
                                })
                                if (response.ok) {
                                  fetchAllApplications()
                                }
                              } catch (error) {
                                console.error("Error updating status:", error)
                              }
                            }
                          }}
                        >
                          <div className="p-3 border-b-2 border-inherit">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-800">{stage.label}</h4>
                              <span className="text-xs px-2 py-1 bg-white rounded-full font-medium">
                                {stageApps.length}
                              </span>
                            </div>
                          </div>
                          <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                            {stageApps.map((app) => (
                              <div
                                key={app.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("applicationId", app.id.toString())
                                }}
                                onClick={() => setSelectedApp(app)}
                                className="bg-white rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                                data-testid={`kanban-card-${app.id}`}
                              >
                                <div className="flex items-start gap-2">
                                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${typeColors[app.type] || "bg-gray-100 text-gray-800"}`}>
                                      {typeLabels[app.type] || app.type}
                                    </span>
                                    <h5 className="font-medium text-sm text-gray-900 truncate">
                                      {app.fullName}
                                    </h5>
                                    <p className="text-xs text-gray-500 truncate">{app.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatDate(app.createdAt)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {stageApps.length === 0 && (
                              <p className="text-center text-gray-400 text-sm py-4">
                                Drop applications here
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "analytics" ? "block" : "hidden"}>
            <AnalyticsDashboard />
          </div>

          <div className={activeTab === "governance" ? "block" : "hidden"}>
            <div className="space-y-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                  <CardTitle>Governance Content</CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchGovernanceData} data-testid="button-refresh-governance">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <GovernanceTextField
                      label="Page Introduction"
                      contentKey="intro"
                      value={governanceContent.intro || ""}
                      isEditing={editingContent === "intro"}
                      onEdit={() => setEditingContent("intro")}
                      onSave={(value) => handleSaveContent("intro", value)}
                      onCancel={() => setEditingContent(null)}
                      defaultValue="Africa of Our Dream Education Initiative (AODI) is governed by an independent Board of Trustees responsible for the organisation's strategic oversight, accountability, and long-term stewardship.\n\nThe Board ensures that AODI operates in line with its mission, upholds strong governance and safeguarding standards, and maintains financial and operational integrity as the organisation delivers leadership and talent development programs across Africa."
                    />
                    
                    <GovernanceTextField
                      label="Board Description"
                      contentKey="boardDescription"
                      value={governanceContent.boardDescription || ""}
                      isEditing={editingContent === "boardDescription"}
                      onEdit={() => setEditingContent("boardDescription")}
                      onSave={(value) => handleSaveContent("boardDescription", value)}
                      onCancel={() => setEditingContent(null)}
                      defaultValue="The Board comprises six Trustees, including designated officers responsible for key governance functions. Trustees bring diverse experience across education, leadership development, finance, policy, and international engagement."
                    />

                    <GovernanceTextField
                      label="Board Responsibilities"
                      contentKey="responsibilities"
                      value={governanceContent.responsibilities || ""}
                      isEditing={editingContent === "responsibilities"}
                      onEdit={() => setEditingContent("responsibilities")}
                      onSave={(value) => handleSaveContent("responsibilities", value)}
                      onCancel={() => setEditingContent(null)}
                      defaultValue="Setting and reviewing AODI's strategic direction\nEnsuring compliance with legal, regulatory, and ethical standards\nApproving budgets and overseeing financial management\nAppointing and supporting executive leadership\nSafeguarding beneficiaries, partners, and stakeholders\nMonitoring impact, performance, and organisational risk"
                    />

                    <GovernanceTextField
                      label="Executive Director Description"
                      contentKey="executiveDirector"
                      value={governanceContent.executiveDirector || ""}
                      isEditing={editingContent === "executiveDirector"}
                      onEdit={() => setEditingContent("executiveDirector")}
                      onSave={(value) => handleSaveContent("executiveDirector", value)}
                      onCancel={() => setEditingContent(null)}
                      defaultValue="The Executive Director leads AODI's operations and program delivery, working under the oversight of the Board of Trustees to translate strategy into measurable outcomes."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                  <CardTitle>Board of Trustees</CardTitle>
                  <Button 
                    onClick={() => { setEditingTrustee(null); setShowTrusteeForm(true) }}
                    data-testid="button-add-trustee"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Trustee
                  </Button>
                </CardHeader>
                <CardContent>
                  {trusteesLoading ? (
                    <p className="text-center py-8 text-gray-500">Loading trustees...</p>
                  ) : trustees.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No trustees added yet. Click &quot;Add Trustee&quot; to get started.</p>
                  ) : (
                    <div className="space-y-4">
                      {trustees.map((trustee) => (
                        <div
                          key={trustee.id}
                          className="border rounded-lg p-4 flex items-start gap-4"
                          data-testid={`trustee-${trustee.id}`}
                        >
                          {trustee.photoUrl ? (
                            <img 
                              src={trustee.photoUrl} 
                              alt={trustee.name}
                              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <Users className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-[#1F2933]">{trustee.name}</h3>
                                <p className="text-sm text-[#C9A24D] font-medium">{trustee.role}</p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => { setEditingTrustee(trustee); setShowTrusteeForm(true) }}
                                  data-testid={`button-edit-trustee-${trustee.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteTrustee(trustee.id)}
                                  data-testid={`button-delete-trustee-${trustee.id}`}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{trustee.bio}</p>
                            {!trustee.isActive && (
                              <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Executive Director Section */}
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Executive Director</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage the Executive Director profile displayed on the governance page.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowExecDirectorForm(true)}
                    data-testid="button-edit-exec-director"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {execDirector ? "Edit Profile" : "Add Profile"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {execDirector ? (
                    <div className="flex items-start gap-6 p-4 border rounded-lg">
                      {execDirector.photoUrl ? (
                        <img 
                          src={execDirector.photoUrl} 
                          alt={execDirector.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-[#1F2933]">{execDirector.name}</h3>
                        <p className="text-sm text-[#B87D3A] font-medium">{execDirector.title}</p>
                        <p className="text-sm text-gray-600 mt-2">{execDirector.bio}</p>
                        {execDirector.linkedinUrl && (
                          <a 
                            href={execDirector.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[#0077B5] hover:underline mt-2"
                          >
                            <Linkedin className="w-4 h-4" />
                            LinkedIn Profile
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      No Executive Director profile added yet. Click &quot;Add Profile&quot; to get started.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className={activeTab === "impact" ? "block" : "hidden"}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Impact Metrics</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage AODI&apos;s impact metrics displayed on the website. These numbers appear on the homepage and impact page.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchImpactData} data-testid="button-refresh-metrics">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => setShowMetricForm(true)} data-testid="button-add-metric">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Metric
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showMetricForm && (
                  <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                    <h3 className="font-semibold text-[#0F3D2E] mb-4">Add New Impact Metric</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                          <select
                            value={newMetricData.category}
                            onChange={(e) => setNewMetricData({ ...newMetricData, category: e.target.value })}
                            className="w-full p-2 border rounded"
                            data-testid="select-new-metric-category"
                          >
                            <option value="Beneficiaries & Reach">Beneficiaries &amp; Reach</option>
                            <option value="Education & Capacity Building">Education &amp; Capacity Building</option>
                            <option value="Mentorship & Career Advancement">Mentorship &amp; Career Advancement</option>
                            <option value="Programs & Partnerships">Programs &amp; Partnerships</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Value</label>
                          <input
                            type="text"
                            value={newMetricData.value}
                            onChange={(e) => setNewMetricData({ ...newMetricData, value: e.target.value })}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., 27,000+"
                            data-testid="input-new-metric-value"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Label</label>
                          <input
                            type="text"
                            value={newMetricData.label}
                            onChange={(e) => setNewMetricData({ ...newMetricData, label: e.target.value })}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., Young People Reached"
                            data-testid="input-new-metric-label"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Unit</label>
                          <input
                            type="text"
                            value={newMetricData.unit}
                            onChange={(e) => setNewMetricData({ ...newMetricData, unit: e.target.value })}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., beneficiaries, students"
                            data-testid="input-new-metric-unit"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Period</label>
                        <input
                          type="text"
                          value={newMetricData.period}
                          onChange={(e) => setNewMetricData({ ...newMetricData, period: e.target.value })}
                          className="w-full p-2 border rounded"
                          placeholder="e.g., Since inception"
                          data-testid="input-new-metric-period"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                        <textarea
                          value={newMetricData.description}
                          onChange={(e) => setNewMetricData({ ...newMetricData, description: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="Brief description of this metric"
                          rows={2}
                          data-testid="textarea-new-metric-desc"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newMetricData.showOnHomepage}
                            onChange={(e) => setNewMetricData({ ...newMetricData, showOnHomepage: e.target.checked })}
                            data-testid="checkbox-new-metric-homepage"
                          />
                          Show on Homepage
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newMetricData.isActive}
                            onChange={(e) => setNewMetricData({ ...newMetricData, isActive: e.target.checked })}
                            data-testid="checkbox-new-metric-active"
                          />
                          Active
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreateMetric} disabled={!newMetricData.label || !newMetricData.value} data-testid="button-save-new-metric">
                          Create Metric
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowMetricForm(false)} data-testid="button-cancel-new-metric">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {impactLoading ? (
                  <p className="text-center py-8 text-gray-500">Loading metrics...</p>
                ) : impactMetrics.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No impact metrics found. Click &quot;Add Metric&quot; to create one.</p>
                ) : (
                  <div className="space-y-6">
                    {["Beneficiaries & Reach", "Education & Capacity Building", "Mentorship & Career Advancement", "Programs & Partnerships"].map((category) => {
                      const categoryMetrics = impactMetrics.filter(m => m.category === category)
                      if (categoryMetrics.length === 0) return null
                      return (
                        <div key={category} className="border rounded-lg p-4">
                          <h3 className="font-semibold text-[#0F3D2E] mb-4">{category}</h3>
                          <div className="space-y-3">
                            {categoryMetrics.map((metric) => (
                              <div
                                key={metric.id}
                                className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg"
                                data-testid={`metric-row-${metric.id}`}
                              >
                                {editingMetric?.id === metric.id ? (
                                  <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        value={editingMetric.value}
                                        onChange={(e) => setEditingMetric({ ...editingMetric, value: e.target.value })}
                                        className="p-2 border rounded"
                                        placeholder="Value (e.g. 27,000+)"
                                        data-testid={`input-metric-value-${metric.id}`}
                                      />
                                      <input
                                        type="text"
                                        value={editingMetric.label}
                                        onChange={(e) => setEditingMetric({ ...editingMetric, label: e.target.value })}
                                        className="p-2 border rounded"
                                        placeholder="Label"
                                        data-testid={`input-metric-label-${metric.id}`}
                                      />
                                    </div>
                                    <textarea
                                      value={editingMetric.description || ""}
                                      onChange={(e) => setEditingMetric({ ...editingMetric, description: e.target.value })}
                                      className="w-full p-2 border rounded text-sm"
                                      placeholder="Description"
                                      rows={2}
                                      data-testid={`textarea-metric-desc-${metric.id}`}
                                    />
                                    <div className="flex items-center gap-4">
                                      <label className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={editingMetric.showOnHomepage}
                                          onChange={(e) => setEditingMetric({ ...editingMetric, showOnHomepage: e.target.checked })}
                                          data-testid={`checkbox-homepage-${metric.id}`}
                                        />
                                        Show on Homepage
                                      </label>
                                      <label className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={editingMetric.isActive}
                                          onChange={(e) => setEditingMetric({ ...editingMetric, isActive: e.target.checked })}
                                          data-testid={`checkbox-active-${metric.id}`}
                                        />
                                        Active
                                      </label>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateMetric(metric.id, editingMetric)}
                                        data-testid={`button-save-metric-${metric.id}`}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingMetric(null)}
                                        data-testid={`button-cancel-metric-${metric.id}`}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl font-bold text-[#0F3D2E]">{metric.value}</span>
                                        <span className="text-gray-600">{metric.label}</span>
                                      </div>
                                      {metric.description && (
                                        <p className="text-sm text-gray-500">{metric.description}</p>
                                      )}
                                      <div className="flex gap-2 mt-2">
                                        {metric.showOnHomepage && (
                                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Homepage</span>
                                        )}
                                        {!metric.isActive && (
                                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Inactive</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingMetric(metric)}
                                        data-testid={`button-edit-metric-${metric.id}`}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteMetric(metric.id)}
                                        className="text-red-600"
                                        data-testid={`button-delete-metric-${metric.id}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "programs" ? "block" : "hidden"}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Programs Management</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage AODI&apos;s programs displayed on the website.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchProgramsData} data-testid="button-refresh-programs">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => { setEditingProgram(null); setShowProgramForm(true) }} data-testid="button-add-program">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Program
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {programsLoading ? (
                  <p className="text-center py-8 text-gray-500">Loading programs...</p>
                ) : programsList.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No programs found. Click &quot;Add Program&quot; to get started.</p>
                ) : (
                  <div className="space-y-4">
                    {programsList.map((program) => (
                      <div
                        key={program.id}
                        className={`border rounded-lg p-4 ${!program.isActive ? 'bg-gray-50 opacity-60' : ''}`}
                        data-testid={`program-${program.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[#1F2933]">{program.title}</h3>
                              {program.isFeatured && (
                                <span className="text-xs bg-aodi-gold/20 text-aodi-green px-2 py-0.5 rounded">Featured</span>
                              )}
                              {!program.isActive && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Inactive</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">/programs/{program.slug}</p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{program.summary}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`w-4 h-4 rounded ${program.accentColor}`} title="Accent Color"></span>
                              <span className="text-xs text-gray-500">Order: {program.displayOrder}</span>
                              <span className="text-xs text-gray-500">CTA: {program.ctaText}</span>
                              {program.primaryCluster && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{program.primaryCluster}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleProgramActive(program)}
                              data-testid={`button-toggle-program-${program.id}`}
                              title={program.isActive ? "Deactivate" : "Activate"}
                            >
                              {program.isActive ? "Hide" : "Show"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setEditingProgram(program); setShowProgramForm(true) }}
                              data-testid={`button-edit-program-${program.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProgram(program.id)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-program-${program.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "partners" ? "block" : "hidden"}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Partners</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchPartnersData} data-testid="button-refresh-partners">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={() => { setEditingPartner(null); setShowPartnerForm(true); }} data-testid="button-add-partner">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Partner
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {partnersLoading ? (
                  <p className="text-center py-8 text-gray-500">Loading partners...</p>
                ) : partnersList.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No partners found</p>
                ) : (
                  <div className="space-y-4">
                    {partnersList.map((partner) => (
                      <div key={partner.id} className="border rounded-lg p-4 flex items-center justify-between" data-testid={`card-partner-${partner.id}`}>
                        <div className="flex items-center gap-4">
                          {partner.logoUrl && (
                            <img src={partner.logoUrl} alt={partner.name} className="w-12 h-12 object-contain" />
                          )}
                          <div>
                            <h4 className="font-semibold text-[#1F2933]">{partner.name}</h4>
                            <p className="text-sm text-gray-500">{partner.type} {!partner.isActive && "(Hidden)"}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditingPartner(partner); setShowPartnerForm(true); }} data-testid={`button-edit-partner-${partner.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            if (confirm("Delete this partner?")) {
                              await fetch(`/api/admin/partners/${partner.id}`, { method: "DELETE" })
                              fetchPartnersData()
                            }
                          }} data-testid={`button-delete-partner-${partner.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "testimonials" ? "block" : "hidden"}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Testimonials</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchTestimonialsData} data-testid="button-refresh-testimonials">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={() => { setEditingTestimonial(null); setShowTestimonialForm(true); }} data-testid="button-add-testimonial">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Testimonial
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {testimonialsLoading ? (
                  <p className="text-center py-8 text-gray-500">Loading testimonials...</p>
                ) : testimonialsList.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No testimonials found</p>
                ) : (
                  <div className="space-y-4">
                    {testimonialsList.map((testimonial) => (
                      <div key={testimonial.id} className="border rounded-lg p-4" data-testid={`card-testimonial-${testimonial.id}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[#1F2933]">{testimonial.name}</h4>
                            <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.country} {!testimonial.isActive && "(Hidden)"}</p>
                            <p className="mt-2 text-gray-600 italic">"{testimonial.quote.slice(0, 100)}..."</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingTestimonial(testimonial); setShowTestimonialForm(true); }} data-testid={`button-edit-testimonial-${testimonial.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={async () => {
                              if (confirm("Delete this testimonial?")) {
                                await fetch(`/api/admin/testimonials/${testimonial.id}`, { method: "DELETE" })
                                fetchTestimonialsData()
                              }
                            }} data-testid={`button-delete-testimonial-${testimonial.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "stories" ? "block" : "hidden"}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Stories</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchStoriesData} data-testid="button-refresh-stories">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={() => { setEditingStory(null); setShowStoryForm(true); }} data-testid="button-add-story">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Story
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {storiesLoading ? (
                  <p className="text-center py-8 text-gray-500">Loading stories...</p>
                ) : storiesList.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No stories found</p>
                ) : (
                  <div className="space-y-4">
                    {storiesList.map((story) => (
                      <div key={story.id} className="border rounded-lg p-4" data-testid={`card-story-${story.id}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[#1F2933]">{story.title}</h4>
                            <p className="text-sm text-gray-500">{story.category} - {new Date(story.publishDate).toLocaleDateString()} {!story.isActive && "(Hidden)"}</p>
                            <p className="mt-2 text-gray-600">{story.excerpt.slice(0, 100)}...</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingStory(story); setShowStoryForm(true); }} data-testid={`button-edit-story-${story.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={async () => {
                              if (confirm("Delete this story?")) {
                                await fetch(`/api/admin/stories/${story.id}`, { method: "DELETE" })
                                fetchStoriesData()
                              }
                            }} data-testid={`button-delete-story-${story.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "resources" ? "block" : "hidden"}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resources</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchResourcesData} data-testid="button-refresh-resources">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={() => { setEditingResource(null); setShowResourceForm(true); }} data-testid="button-add-resource">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {resourcesLoading ? (
                  <p className="text-center py-8 text-gray-500">Loading resources...</p>
                ) : resourcesList.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No resources found</p>
                ) : (
                  <div className="space-y-4">
                    {resourcesList.map((resource) => (
                      <div key={resource.id} className="border rounded-lg p-4" data-testid={`card-resource-${resource.id}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[#1F2933]">{resource.title}</h4>
                            <p className="text-sm text-gray-500">{resource.category} {resource.fileType && `- ${resource.fileType.toUpperCase()}`} {!resource.isActive && "(Hidden)"}</p>
                            <p className="mt-2 text-gray-600">{resource.description.slice(0, 100)}...</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingResource(resource); setShowResourceForm(true); }} data-testid={`button-edit-resource-${resource.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={async () => {
                              if (confirm("Delete this resource?")) {
                                await fetch(`/api/admin/resources/${resource.id}`, { method: "DELETE" })
                                fetchResourcesData()
                              }
                            }} data-testid={`button-delete-resource-${resource.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "events" ? "block" : "hidden"}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Events & Convenings</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage AODI events and convenings.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchEventsData} data-testid="button-refresh-events">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => { setEditingEvent(null); setShowEventForm(true) }} data-testid="button-add-event">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <p className="text-center py-8 text-gray-500">Loading events...</p>
                ) : eventsList.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No events found. Click &quot;Add Event&quot; to get started.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="table-events">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-sm font-medium text-gray-600">Title</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-600">Date</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-600">Mode</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-600">Featured</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventsList.map((event) => (
                          <tr key={event.id} className={`border-b ${!event.isActive ? 'opacity-50' : ''}`} data-testid={`row-event-${event.id}`}>
                            <td className="p-3">
                              <div className="font-medium text-[#1F2933]">{event.title}</div>
                              <div className="text-xs text-gray-500">/events/{event.slug}</div>
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {new Date(event.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="p-3">
                              <span className={`text-xs px-2 py-1 rounded ${event.status === "Upcoming" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                {event.status}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-600">{event.mode}</td>
                            <td className="p-3">
                              {event.isFeatured && (
                                <span className="text-xs bg-aodi-gold/20 text-aodi-green px-2 py-0.5 rounded">Featured</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => { setEditingEvent(event); setShowEventForm(true) }}
                                  title="Edit event"
                                  data-testid={`button-edit-event-${event.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDuplicateEvent(event)}
                                  title="Duplicate event"
                                  data-testid={`button-duplicate-event-${event.id}`}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete event"
                                  data-testid={`button-delete-event-${event.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "donations" ? "block" : "hidden"}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Donations</p>
                      <p className="text-3xl font-bold text-[#0F3D2E]">{donationsStats.total}</p>
                    </div>
                    <Heart className="w-10 h-10 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-3xl font-bold text-[#0F3D2E]">
                        {donationsStats.totalAmount ? `$${parseFloat(donationsStats.totalAmount).toLocaleString()}` : "$0"}
                      </p>
                    </div>
                    <Heart className="w-10 h-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <CardTitle>Donations</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchDonationsData} data-testid="button-refresh-donations">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {donationsLoading ? (
                  <p className="text-center py-8 text-gray-500">Loading donations...</p>
                ) : donationsList.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No donations yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Donor</th>
                          <th className="text-left py-3 px-2">Amount</th>
                          <th className="text-left py-3 px-2">Method</th>
                          <th className="text-left py-3 px-2">Type</th>
                          <th className="text-left py-3 px-2">Status</th>
                          <th className="text-left py-3 px-2">Date</th>
                          <th className="py-3 px-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {donationsList.map((donation) => (
                          <tr key={donation.id} className="border-b hover:bg-gray-50" data-testid={`donation-${donation.id}`}>
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-medium">{donation.isAnonymous ? "Anonymous" : donation.donorName}</p>
                                {!donation.isAnonymous && <p className="text-xs text-gray-500">{donation.donorEmail}</p>}
                              </div>
                            </td>
                            <td className="py-3 px-2 font-medium">{donation.currency} {donation.amount}</td>
                            <td className="py-3 px-2 capitalize">{donation.paymentMethod}</td>
                            <td className="py-3 px-2 capitalize">{donation.donationType}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                donation.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {donation.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-gray-500">{formatDate(donation.createdAt)}</td>
                            <td className="py-3 px-2">
                              {!donation.isAnonymous && donation.donorEmail && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-800 border-green-200 hover:bg-green-50"
                                  onClick={() => { setDonorEmailTarget({ email: donation.donorEmail, name: donation.donorName }); setDonorEmailOpen(true) }}
                                  data-testid={`button-thank-donor-${donation.id}`}
                                >
                                  <Mail className="w-3 h-3 mr-1" />
                                  Thank
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "contacts" ? "block" : "hidden"}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CardTitle>Contact Submissions</CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchContactsData} data-testid="button-refresh-contacts">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={contactsSearch}
                        onChange={e => setContactsSearch(e.target.value)}
                        placeholder="Search by name, email or message..."
                        className="pl-9"
                        data-testid="input-contacts-search"
                      />
                    </div>
                    <Select value={contactsStatusFilter} onValueChange={setContactsStatusFilter}>
                      <SelectTrigger className="w-36" data-testid="select-contacts-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <p className="text-center py-8 text-gray-500">Loading contacts...</p>
                ) : contactsList.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No contact submissions yet.</p>
                ) : (
                  <div className="space-y-4">
                    {contactsList
                      .filter(c => {
                        const q = contactsSearch.toLowerCase()
                        const matchesSearch = !q || (c.fullName || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q) || (c.message || "").toLowerCase().includes(q) || (c.subject || "").toLowerCase().includes(q)
                        const matchesStatus = contactsStatusFilter === "all" || c.status === contactsStatusFilter
                        return matchesSearch && matchesStatus
                      })
                      .map((contact) => {
                        const isExpanded = expandedContactId === contact.id
                        const history = contactHistory[contact.id]
                        const isLoadingHistory = contactHistoryLoading === contact.id
                        return (
                          <div
                            key={contact.id}
                            className="border rounded-lg overflow-hidden"
                            data-testid={`contact-${contact.id}`}
                          >
                            <div className="p-4 hover:bg-gray-50">
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                <span className="text-sm text-gray-500">{formatDate(contact.createdAt)}</span>
                                <div className="flex items-center gap-2">
                                  <Select value={contact.status} onValueChange={(value) => handleContactStatusChange(contact.id, value)}>
                                    <SelectTrigger className="w-32" data-testid={`select-contact-status-${contact.id}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">New</SelectItem>
                                      <SelectItem value="replied">Replied</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-[#1F2933]">{contact.fullName}</h3>
                                  <p className="text-sm text-gray-600">{contact.email}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {contact.email && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-800 border-green-200 hover:bg-green-50"
                                      onClick={() => { setContactReplyTarget({ email: contact.email, name: contact.fullName }); setContactReplyOpen(true) }}
                                      data-testid={`button-reply-contact-${contact.id}`}
                                    >
                                      <Mail className="w-3 h-3 mr-1" />
                                      Reply
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-600 hover:bg-gray-100"
                                    onClick={() => fetchContactHistory(contact.id)}
                                    data-testid={`button-history-contact-${contact.id}`}
                                  >
                                    {isLoadingHistory ? (
                                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                    ) : isExpanded ? (
                                      <ChevronUp className="w-3 h-3 mr-1" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3 mr-1" />
                                    )}
                                    Submissions
                                  </Button>
                                </div>
                              </div>
                              {contact.subject && (
                                <p className="text-sm font-medium mt-2">Subject: {contact.subject}</p>
                              )}
                              <p className="mt-2 text-sm text-gray-700">{contact.message}</p>
                            </div>

                            {isExpanded && (
                              <div className="border-t bg-gray-50 px-4 py-3">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Submission History
                                </h4>
                                {isLoadingHistory ? (
                                  <p className="text-sm text-gray-500 py-2">Loading history...</p>
                                ) : !history || history.length === 0 ? (
                                  <p className="text-sm text-gray-500 py-2">No form submissions on record for this email.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {history.map((sub) => {
                                      let payload: Record<string, unknown> = {}
                                      try { payload = sub.payload ? JSON.parse(sub.payload as string) : {} } catch { /* ignore */ }
                                      const SKIP = new Set(["formId", "formName", "submittedAt", "captchaToken", "agreedToPolicy"])
                                      const fields = Object.entries(payload).filter(([k]) => !SKIP.has(k)).slice(0, 4)
                                      return (
                                        <div key={sub.id} className="bg-white border rounded-md p-3 text-sm">
                                          <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="font-medium text-[#0F3D2E] capitalize">{sub.type.replace(/-/g, " ")}</span>
                                            <span className="text-xs text-gray-400">{formatDate(sub.createdAt)}</span>
                                          </div>
                                          {fields.length > 0 && (
                                            <div className="text-gray-600 space-y-0.5">
                                              {fields.map(([k, v]) => (
                                                <div key={k} className="flex gap-1 text-xs">
                                                  <span className="text-gray-400 capitalize">{k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2")}:</span>
                                                  <span className="truncate max-w-[240px]">{String(v)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          <div className="mt-1.5">
                                            <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                              sub.status === "new" ? "bg-blue-100 text-blue-700" :
                                              sub.status === "approved" ? "bg-green-100 text-green-700" :
                                              sub.status === "rejected" ? "bg-red-100 text-red-700" :
                                              "bg-gray-100 text-gray-600"
                                            }`}>{sub.status}</span>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "email-templates" ? "block" : "hidden"}>
            <EmailTemplatesManager />
          </div>

          <div className={activeTab === "inbox" ? "block" : "hidden"}>
            <Card>
              <CardHeader>
                <CardTitle>CRM Inbox</CardTitle>
              </CardHeader>
              <CardContent>
                <CRMInbox />
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "email-settings" ? "block" : "hidden"}>
            <Card>
              <CardHeader>
                <CardTitle>Email Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailAccountsManager />
              </CardContent>
            </Card>
          </div>

          <div className={activeTab === "newsletter" ? "block" : "hidden"}>
            <NewsletterManager />
          </div>

          <div className={activeTab === "email-logs" ? "block" : "hidden"}>
            <EmailLogsViewer />
          </div>

          <div className={activeTab === "site-settings" ? "block" : "hidden"}>
            <SiteSettingsManager />
          </div>

          <div className={activeTab === "forms" ? "block" : "hidden"}>
            <FormsManager />
          </div>

          <div className={activeTab === "media-library" ? "block" : "hidden"}>
            <MediaLibraryManager />
          </div>

          <div className={activeTab === "integrations" ? "block" : "hidden"}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-aodi-gold" />
                  Integrations Management
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure and manage third-party service integrations. Enable/disable services and check configuration status.
                </p>
              </CardHeader>
              <CardContent>
                {integrationsLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-aodi-teal" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {["email", "analytics", "payments", "security", "monitoring"].map(category => {
                      const categoryIntegrations = integrations.filter(i => i.category === category)
                      if (categoryIntegrations.length === 0) return null
                      
                      const categoryLabels: Record<string, string> = {
                        email: "Email Services",
                        analytics: "Analytics & Tracking",
                        payments: "Payment Processing",
                        security: "Security & Protection",
                        monitoring: "Error Monitoring"
                      }
                      
                      return (
                        <div key={category} className="space-y-4">
                          <h3 className="text-lg font-semibold text-charcoal border-b pb-2">{categoryLabels[category] || category}</h3>
                          <div className="grid gap-4">
                            {categoryIntegrations.map(integration => (
                              <div key={integration.id} className="border rounded-lg p-4 bg-white">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-semibold text-charcoal">{integration.displayName}</h4>
                                      {integration.secretsConfigured ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Configured
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                                          <AlertCircle className="w-3 h-3" />
                                          Needs Setup
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate mb-3">{integration.description}</p>
                                    
                                    {integration.secretsRequired && (
                                      <div className="bg-gray-50 rounded p-3 mb-3">
                                        <p className="text-xs font-medium text-slate mb-1">Required secrets:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {integration.secretsRequired.split(",").map(secret => (
                                            <code key={secret} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                              {secret.trim()}
                                            </code>
                                          ))}
                                        </div>
                                        {!integration.secretsConfigured && (
                                          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Add these secrets in the Replit Secrets panel to activate this integration
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {integration.integrationKey === "google_analytics" && (
                                      <div className="mt-3">
                                        <label className="block text-sm font-medium text-charcoal mb-1">
                                          GA Measurement ID (e.g., G-XXXXXXXXXX)
                                        </label>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            placeholder="G-XXXXXXXXXX"
                                            defaultValue={integration.configValue || ""}
                                            className="flex-1 px-3 py-2 border rounded-md text-sm"
                                            data-testid="input-ga-measurement-id"
                                            onBlur={(e) => {
                                              if (e.target.value !== integration.configValue) {
                                                updateIntegration(integration.integrationKey, { configValue: e.target.value })
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={integration.isEnabled}
                                        onChange={(e) => updateIntegration(integration.integrationKey, { isEnabled: e.target.checked })}
                                        className="sr-only peer"
                                        disabled={!integration.secretsConfigured}
                                        data-testid={`toggle-${integration.integrationKey}`}
                                      />
                                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${integration.isEnabled ? 'bg-aodi-teal' : 'bg-gray-300'} ${!integration.secretsConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                                    </label>
                                    <span className={`text-sm font-medium ${integration.isEnabled ? 'text-aodi-teal' : 'text-slate'}`}>
                                      {integration.isEnabled ? "Enabled" : "Disabled"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                        <ExternalLink className="w-4 h-4" />
                        How to Configure Secrets
                      </h4>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Click on the &ldquo;Secrets&rdquo; tab in the Replit sidebar (or press Ctrl+Shift+K)</li>
                        <li>Add each required secret key with its value from the service provider</li>
                        <li>Return here and refresh to see updated configuration status</li>
                        <li>Enable the integration using the toggle switch</li>
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {hasPermission("users.view") && (
            <div className={activeTab === "users" ? "block" : "hidden"}>
              <Card>
                <CardContent className="pt-6">
                  {currentUser && (
                    <UserManager 
                      userPermissions={currentUser.permissions} 
                      currentUserId={currentUser.id} 
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {hasPermission("roles.view") && (
            <div className={activeTab === "roles" ? "block" : "hidden"}>
              <Card>
                <CardContent className="pt-6">
                  {currentUser && (
                    <RoleManager userPermissions={currentUser.permissions} />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {hasPermission("users.view") && (
            <div className={activeTab === "activity-log" ? "block" : "hidden"}>
              <ActivityLogDashboard />
            </div>
          )}
        </main>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedApp(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#1F2933]">Application Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedApp(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[selectedApp.type]}`}>
                  {typeLabels[selectedApp.type]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <Select value={selectedApp.status} onValueChange={(value) => handleStatusChange(selectedApp.id, value)}>
                    <SelectTrigger className="w-36" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{selectedApp.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedApp.email}</p>
                </div>
                {selectedApp.organization && (
                  <div>
                    <p className="text-sm text-gray-500">Organization</p>
                    <p className="font-medium">{selectedApp.organization}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-medium">{formatDate(selectedApp.createdAt)}</p>
                </div>
              </div>

              {selectedApp.message && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Message</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApp.message}</p>
                </div>
              )}

              {selectedApp.payload && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">All Form Data</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(parsePayload(selectedApp.payload)).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="text-sm text-gray-500 w-40 flex-shrink-0 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm text-gray-700">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ApplicationCRMPanel
                applicationId={selectedApp.id}
                applicantName={selectedApp.fullName}
                applicantEmail={selectedApp.email}
                applicationType={typeLabels[selectedApp.type] || selectedApp.type}
              />
            </div>
          </div>
        </div>
      )}

      {showTrusteeForm && (
        <TrusteeFormModal
          trustee={editingTrustee}
          onSave={handleSaveTrustee}
          onClose={() => { setShowTrusteeForm(false); setEditingTrustee(null) }}
        />
      )}

      {showExecDirectorForm && (
        <ExecDirectorFormModal
          execDirector={execDirector}
          onSave={handleSaveExecDirector}
          onClose={() => setShowExecDirectorForm(false)}
        />
      )}

      {showProgramForm && (
        <ProgramFormModal
          program={editingProgram}
          onSave={handleSaveProgram}
          onClose={() => { setShowProgramForm(false); setEditingProgram(null) }}
        />
      )}

      {showPartnerForm && (
        <PartnerFormModal
          partner={editingPartner}
          onSave={async (data) => {
            const url = editingPartner ? `/api/admin/partners/${editingPartner.id}` : "/api/admin/partners"
            const method = editingPartner ? "PATCH" : "POST"
            await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
            setShowPartnerForm(false)
            setEditingPartner(null)
            fetchPartnersData()
          }}
          onClose={() => { setShowPartnerForm(false); setEditingPartner(null) }}
        />
      )}

      {showTestimonialForm && (
        <TestimonialFormModal
          testimonial={editingTestimonial}
          onSave={async (data) => {
            const url = editingTestimonial ? `/api/admin/testimonials/${editingTestimonial.id}` : "/api/admin/testimonials"
            const method = editingTestimonial ? "PATCH" : "POST"
            await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
            setShowTestimonialForm(false)
            setEditingTestimonial(null)
            fetchTestimonialsData()
          }}
          onClose={() => { setShowTestimonialForm(false); setEditingTestimonial(null) }}
        />
      )}

      {showStoryForm && (
        <StoryFormModal
          story={editingStory}
          onSave={async (data) => {
            const url = editingStory ? `/api/admin/stories/${editingStory.id}` : "/api/admin/stories"
            const method = editingStory ? "PATCH" : "POST"
            await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
            setShowStoryForm(false)
            setEditingStory(null)
            fetchStoriesData()
          }}
          onClose={() => { setShowStoryForm(false); setEditingStory(null) }}
        />
      )}

      {showEventForm && (
        <EventFormModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={() => { setShowEventForm(false); setEditingEvent(null) }}
        />
      )}

      {showResourceForm && (
        <ResourceFormModal
          resource={editingResource}
          onSave={async (data) => {
            const url = editingResource ? `/api/admin/resources/${editingResource.id}` : "/api/admin/resources"
            const method = editingResource ? "PATCH" : "POST"
            await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
            setShowResourceForm(false)
            setEditingResource(null)
            fetchResourcesData()
          }}
          onClose={() => { setShowResourceForm(false); setEditingResource(null) }}
        />
      )}

      {/* Bulk Email Dialog — compose once, send to all selected applicants */}
      <BulkEmailDialog
        open={bulkEmailDialogOpen}
        onClose={() => { setBulkEmailDialogOpen(false); setBulkEmailRecipients([]) }}
        recipients={bulkEmailRecipients}
        applicationIds={bulkEmailRecipients.map(r => r.id)}
      />

      {/* Contact submission reply composer */}
      {contactReplyOpen && contactReplyTarget && (
        <EmailComposer
          open={contactReplyOpen}
          onClose={() => { setContactReplyOpen(false); setContactReplyTarget(null) }}
          recipientEmail={contactReplyTarget.email}
          recipientName={contactReplyTarget.name}
          templateCategory="general"
        />
      )}

      {/* Donor thank-you email composer */}
      {donorEmailOpen && donorEmailTarget && (
        <EmailComposer
          open={donorEmailOpen}
          onClose={() => { setDonorEmailOpen(false); setDonorEmailTarget(null) }}
          recipientEmail={donorEmailTarget.email}
          recipientName={donorEmailTarget.name}
          defaultSubject={`Thank you for your generous donation to AODI`}
          defaultBody={`Dear {{firstName}},\n\nThank you so much for your generous donation to the Africa of Our Dream Education Initiative. Your support makes a real difference to the young people we serve across Africa.\n\nWith gratitude,\nThe AODI Team`}
          templateCategory="donation"
        />
      )}
    </div>
  )
}

function GovernanceTextField({ 
  label, 
  contentKey, 
  value, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel,
  defaultValue 
}: {
  label: string
  contentKey: string
  value: string
  isEditing: boolean
  onEdit: () => void
  onSave: (value: string) => void
  onCancel: () => void
  defaultValue: string
}) {
  const [editValue, setEditValue] = useState(value || defaultValue)

  useEffect(() => {
    setEditValue(value || defaultValue)
  }, [value, defaultValue])

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full min-h-[120px] p-3 border rounded-lg text-sm resize-y"
          data-testid={`textarea-${contentKey}`}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(editValue)} data-testid={`button-save-${contentKey}`}>
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel} data-testid={`button-cancel-${contentKey}`}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <Button variant="ghost" size="sm" onClick={onEdit} data-testid={`button-edit-${contentKey}`}>
          <Edit className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
        {value || defaultValue}
      </p>
    </div>
  )
}

function TrusteeFormModal({ 
  trustee, 
  onSave, 
  onClose 
}: {
  trustee: Trustee | null
  onSave: (data: Partial<Trustee>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: trustee?.name || "",
    role: trustee?.role || "",
    bio: trustee?.bio || "",
    photoUrl: trustee?.photoUrl || "",
    linkedinUrl: trustee?.linkedinUrl || "",
    displayOrder: trustee?.displayOrder || 0,
    isActive: trustee?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1F2933]">
            {trustee ? "Edit Trustee" : "Add Trustee"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
              data-testid="input-trustee-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
              data-testid="select-trustee-role"
            >
              <option value="">Select a role...</option>
              <option value="Founder & Board Chair">Founder & Board Chair</option>
              <option value="Board Chair">Board Chair</option>
              <option value="Trustee & Secretary">Trustee & Secretary</option>
              <option value="Trustee & Chief Financial Secretary">Trustee & Chief Financial Secretary</option>
              <option value="Trustee & Chief Development Officer">Trustee & Chief Development Officer</option>
              <option value="Trustee & Executive Director">Trustee & Executive Director</option>
              <option value="Trustee">Trustee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio (2-line max) *</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-2 border rounded-lg min-h-[80px]"
              placeholder="Brief description of experience and background..."
              required
              data-testid="textarea-trustee-bio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <ImageUpload
              value={formData.photoUrl}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              placeholder="Upload trustee photo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="https://www.linkedin.com/in/username"
              data-testid="input-trustee-linkedin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border rounded-lg"
              min="0"
              data-testid="input-trustee-order"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (0 = Chair, 1 = Secretary, etc.)</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
              data-testid="checkbox-trustee-active"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible on website)</label>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" data-testid="button-save-trustee">
              {trustee ? "Update Trustee" : "Add Trustee"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ExecDirectorFormModal({ 
  execDirector, 
  onSave, 
  onClose 
}: {
  execDirector: ExecutiveDirectorProfile | null
  onSave: (data: Partial<ExecutiveDirectorProfile>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: execDirector?.name || "",
    title: execDirector?.title || "Executive Director",
    bio: execDirector?.bio || "",
    photoUrl: execDirector?.photoUrl || "",
    linkedinUrl: execDirector?.linkedinUrl || ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1F2933]">
            {execDirector ? "Edit Executive Director" : "Add Executive Director"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
              data-testid="input-exec-director-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Executive Director"
              data-testid="input-exec-director-title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio *</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-2 border rounded-lg min-h-[120px]"
              placeholder="Brief description of experience and background..."
              required
              data-testid="textarea-exec-director-bio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <ImageUpload
              value={formData.photoUrl}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              placeholder="Upload executive director photo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="https://www.linkedin.com/in/username"
              data-testid="input-exec-director-linkedin"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" data-testid="button-save-exec-director">
              {execDirector ? "Update Profile" : "Add Profile"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProgramFormModal({ 
  program, 
  onSave, 
  onClose 
}: {
  program: Program | null
  onSave: (data: Partial<Program>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    title: program?.title || "",
    slug: program?.slug || "",
    summary: program?.summary || "",
    description: program?.description || "",
    primaryCluster: program?.primaryCluster || "",
    isFeatured: program?.isFeatured ?? false,
    ctaText: program?.ctaText || "Learn More",
    accentColor: program?.accentColor || "bg-aodi-teal",
    borderColor: program?.borderColor || "border-aodi-teal",
    ctaLink: program?.ctaLink || "",
    displayOrder: program?.displayOrder || 0,
    isActive: program?.isActive ?? true,
    benefitsText: program?.benefits?.join("\n") || "",
    eligibilityText: program?.eligibility?.join("\n") || "",
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData: Partial<Program> = {
      title: formData.title,
      slug: formData.slug,
      summary: formData.summary,
      description: formData.description || null,
      primaryCluster: formData.primaryCluster || null,
      isFeatured: formData.isFeatured,
      ctaText: formData.ctaText,
      accentColor: formData.accentColor,
      borderColor: formData.borderColor,
      ctaLink: formData.ctaLink || null,
      displayOrder: formData.displayOrder,
      isActive: formData.isActive,
      benefits: formData.benefitsText ? formData.benefitsText.split("\n").filter(Boolean) : null,
      eligibility: formData.eligibilityText ? formData.eligibilityText.split("\n").filter(Boolean) : null,
    }
    onSave(submitData)
  }

  const colorOptions = [
    { value: "bg-aodi-teal", label: "Teal", borderValue: "border-aodi-teal" },
    { value: "bg-aodi-gold", label: "Gold", borderValue: "border-aodi-gold" },
    { value: "bg-aodi-green", label: "Green", borderValue: "border-aodi-green" },
    { value: "bg-[#8B5CF6]", label: "Purple", borderValue: "border-[#8B5CF6]" },
    { value: "bg-[#F59E0B]", label: "Amber", borderValue: "border-[#F59E0B]" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1F2933]">
            {program ? "Edit Program" : "Add Program"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
                data-testid="input-program-title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
                placeholder="e.g., global-mentorship"
                data-testid="input-program-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full p-2 border rounded-lg min-h-[60px]"
              required
              placeholder="Brief description for program cards"
              data-testid="textarea-program-summary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Full description for program detail page with formatting..."
              minHeight="150px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Cluster</label>
            <select
              value={formData.primaryCluster}
              onChange={(e) => setFormData({ ...formData, primaryCluster: e.target.value })}
              className="w-full p-2 border rounded-lg"
              data-testid="select-program-cluster"
            >
              <option value="">Select a cluster...</option>
              {programClusters.map(cluster => (
                <option key={cluster} value={cluster}>{cluster}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="Learn More"
                data-testid="input-program-cta-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="/get-involved/mentee"
                data-testid="input-program-cta-link"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <select
                value={formData.accentColor}
                onChange={(e) => {
                  const option = colorOptions.find(o => o.value === e.target.value)
                  setFormData({ 
                    ...formData, 
                    accentColor: e.target.value,
                    borderColor: option?.borderValue || "border-aodi-teal"
                  })
                }}
                className="w-full p-2 border rounded-lg"
                data-testid="select-program-color"
              >
                {colorOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border rounded-lg"
                min="0"
                data-testid="input-program-order"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (one per line)</label>
            <textarea
              value={formData.benefitsText}
              onChange={(e) => setFormData({ ...formData, benefitsText: e.target.value })}
              className="w-full p-2 border rounded-lg min-h-[80px]"
              placeholder="Career clarity and strategic direction&#10;Academic and scholarship guidance&#10;Leadership mindset and professional confidence"
              data-testid="textarea-program-benefits"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility (one per line)</label>
            <textarea
              value={formData.eligibilityText}
              onChange={(e) => setFormData({ ...formData, eligibilityText: e.target.value })}
              className="w-full p-2 border rounded-lg min-h-[80px]"
              placeholder="Secondary school students, university students&#10;Strong motivation to grow&#10;Commitment to program expectations"
              data-testid="textarea-program-eligibility"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4"
                data-testid="checkbox-program-featured"
              />
              Featured program
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
                data-testid="checkbox-program-active"
              />
              Active (visible on website)
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" data-testid="button-save-program">
              {program ? "Update Program" : "Add Program"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PartnerFormModal({ 
  partner, 
  onSave, 
  onClose 
}: { 
  partner: Partner | null
  onSave: (data: Partial<Partner>) => Promise<void>
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    name: partner?.name || "",
    type: partner?.type || "implementation",
    logoUrl: partner?.logoUrl || "",
    url: partner?.url || "",
    description: partner?.description || "",
    displayOrder: partner?.displayOrder || 0,
    isActive: partner?.isActive ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">{partner ? "Edit Partner" : "Add Partner"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="input-partner-name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="select-partner-type">
              <option value="implementation">Implementation Partner</option>
              <option value="academic">Academic Partner</option>
              <option value="funding">Funding Partner</option>
              <option value="strategic">Strategic Partner</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo</label>
            <ImageUpload
              value={formData.logoUrl}
              onChange={(url) => setFormData({ ...formData, logoUrl: url })}
              placeholder="Upload partner logo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website URL</label>
            <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="input-partner-url" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-lg min-h-[80px]" data-testid="textarea-partner-description" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} data-testid="checkbox-partner-active" />
            Active (visible on website)
          </label>
          <div className="flex gap-2 pt-4">
            <Button type="submit" data-testid="button-save-partner">{partner ? "Update" : "Add"} Partner</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TestimonialFormModal({ 
  testimonial, 
  onSave, 
  onClose 
}: { 
  testimonial: Testimonial | null
  onSave: (data: Partial<Testimonial>) => Promise<void>
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    name: testimonial?.name || "",
    role: testimonial?.role || "",
    country: testimonial?.country || "",
    quote: testimonial?.quote || "",
    programSlug: testimonial?.programSlug || "",
    photoUrl: testimonial?.photoUrl || "",
    displayOrder: testimonial?.displayOrder || 0,
    isActive: testimonial?.isActive ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">{testimonial ? "Edit Testimonial" : "Add Testimonial"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="input-testimonial-name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <input type="text" required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="Mentee, Cohort 2024" data-testid="input-testimonial-role" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country *</label>
            <input type="text" required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="input-testimonial-country" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quote *</label>
            <textarea required value={formData.quote} onChange={(e) => setFormData({ ...formData, quote: e.target.value })} className="w-full p-2 border rounded-lg min-h-[100px]" data-testid="textarea-testimonial-quote" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Program Slug</label>
            <input type="text" value={formData.programSlug} onChange={(e) => setFormData({ ...formData, programSlug: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="global-mentorship-leadership" data-testid="input-testimonial-program" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Photo</label>
            <ImageUpload
              value={formData.photoUrl}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              placeholder="Upload person photo"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} data-testid="checkbox-testimonial-active" />
            Active (visible on website)
          </label>
          <div className="flex gap-2 pt-4">
            <Button type="submit" data-testid="button-save-testimonial">{testimonial ? "Update" : "Add"} Testimonial</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StoryFormModal({ 
  story, 
  onSave, 
  onClose 
}: { 
  story: Story | null
  onSave: (data: Partial<Story>) => Promise<void>
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    title: story?.title || "",
    slug: story?.slug || "",
    excerpt: story?.excerpt || "",
    body: story?.body || "",
    category: story?.category || "Success Story",
    featuredImage: story?.featuredImage || "",
    tags: story?.tags || "",
    publishDate: story?.publishDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    isFeatured: story?.isFeatured ?? false,
    isActive: story?.isActive ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">{story ? "Edit Story" : "Add Story"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="input-story-title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug *</label>
            <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="my-story-title" data-testid="input-story-slug" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="select-story-category">
              <option value="Success Story">Success Story</option>
              <option value="Mentor Spotlight">Mentor Spotlight</option>
              <option value="Partner Story">Partner Story</option>
              <option value="Program Update">Program Update</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt *</label>
            <textarea required value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="w-full p-2 border rounded-lg min-h-[60px]" placeholder="Brief summary for cards" data-testid="textarea-story-excerpt" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Body *</label>
            <RichTextEditor
              value={formData.body}
              onChange={(value) => setFormData({ ...formData, body: value })}
              placeholder="Full story content with formatting..."
              minHeight="200px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Featured Image</label>
            <ImageUpload
              value={formData.featuredImage}
              onChange={(url) => setFormData({ ...formData, featuredImage: url })}
              placeholder="Upload featured image"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="leadership, mentorship, success" data-testid="input-story-tags" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Publish Date</label>
            <input type="date" value={formData.publishDate} onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="input-story-date" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} data-testid="checkbox-story-featured" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} data-testid="checkbox-story-active" />
              Active (visible on website)
            </label>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" data-testid="button-save-story">{story ? "Update" : "Add"} Story</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ResourceFormModal({ 
  resource, 
  onSave, 
  onClose 
}: { 
  resource: Resource | null
  onSave: (data: Partial<Resource>) => Promise<void>
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    title: resource?.title || "",
    description: resource?.description || "",
    category: resource?.category || "Annual Reports",
    fileUrl: resource?.fileUrl || "",
    externalUrl: resource?.externalUrl || "",
    fileType: resource?.fileType || "pdf",
    displayOrder: resource?.displayOrder || 0,
    isActive: resource?.isActive ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">{resource ? "Edit Resource" : "Add Resource"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="input-resource-title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-lg min-h-[80px]" data-testid="textarea-resource-description" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="select-resource-category">
              <option value="Annual Reports">Annual Reports</option>
              <option value="Policy Documents">Policy Documents</option>
              <option value="Research Papers">Research Papers</option>
              <option value="Program Guides">Program Guides</option>
              <option value="Templates">Templates</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">File URL</label>
            <input type="url" value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="Link to downloadable file" data-testid="input-resource-file" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">External URL</label>
            <input type="url" value={formData.externalUrl} onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="Link to external resource" data-testid="input-resource-external" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">File Type</label>
            <select value={formData.fileType} onChange={(e) => setFormData({ ...formData, fileType: e.target.value })} className="w-full p-2 border rounded-lg" data-testid="select-resource-filetype">
              <option value="pdf">PDF</option>
              <option value="doc">DOC</option>
              <option value="xlsx">Excel</option>
              <option value="video">Video</option>
              <option value="link">External Link</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} data-testid="checkbox-resource-active" />
            Active (visible on website)
          </label>
          <div className="flex gap-2 pt-4">
            <Button type="submit" data-testid="button-save-resource">{resource ? "Update" : "Add"} Resource</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const availableIcons = [
  "Beaker", "Target", "Network", "Users", "Lightbulb", "GraduationCap", 
  "Award", "Globe", "Microscope", "BookOpen", "Heart", "Star", "Zap", "Shield"
]

function EventFormModal({ 
  event, 
  onSave, 
  onClose 
}: { 
  event: Event | null
  onSave: (data: Partial<Event>) => void
  onClose: () => void 
}) {
  const [activeSection, setActiveSection] = useState<"basic" | "content" | "eligibility" | "cta">("basic")
  const [formData, setFormData] = useState({
    title: event?.title || "",
    slug: event?.slug || "",
    subtitle: event?.subtitle || "",
    startDate: event?.startDate?.split("T")[0] || "",
    endDate: event?.endDate?.split("T")[0] || "",
    location: event?.location || "",
    mode: event?.mode || "Virtual",
    summary: event?.summary || "",
    body: event?.body || "",
    registrationLabel: event?.registrationLabel || "Register",
    registrationUrl: event?.registrationUrl || "",
    status: event?.status || "Upcoming",
    isFeatured: event?.isFeatured ?? false,
    heroImage: event?.heroImage || "",
    displayOrder: event?.displayOrder || 0,
    isActive: event?.isActive ?? true,
    pageTemplate: event?.pageTemplate || "standard",
    overviewTitle: event?.overviewTitle || "Overview",
    objectives: event?.objectives || [],
    eligibilityCriteria: event?.eligibilityCriteria || [],
    eligibilityTitle: event?.eligibilityTitle || "Who Should Apply",
    eligibilityIntro: event?.eligibilityIntro || "",
    deliveryTitle: event?.deliveryTitle || "Delivery Mode",
    deliveryDescription: event?.deliveryDescription || "",
    duration: event?.duration || "",
    certificate: event?.certificate || "",
    ctaTitle: event?.ctaTitle || "",
    ctaDescription: event?.ctaDescription || "",
    ctaButtonText: event?.ctaButtonText || "Submit Your Application",
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }))
  }

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, { icon: "Target", title: "", description: "" }]
    }))
  }

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }))
  }

  const updateObjective = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => 
        i === index ? { ...obj, [field]: value } : obj
      )
    }))
  }

  const addCriteria = () => {
    setFormData(prev => ({
      ...prev,
      eligibilityCriteria: [...prev.eligibilityCriteria, ""]
    }))
  }

  const removeCriteria = (index: number) => {
    setFormData(prev => ({
      ...prev,
      eligibilityCriteria: prev.eligibilityCriteria.filter((_, i) => i !== index)
    }))
  }

  const updateCriteria = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      eligibilityCriteria: prev.eligibilityCriteria.map((c, i) => i === index ? value : c)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData: Partial<Event> = {
      title: formData.title,
      slug: formData.slug,
      subtitle: formData.subtitle || null,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      location: formData.location || null,
      mode: formData.mode,
      summary: formData.summary,
      body: formData.body || null,
      registrationLabel: formData.registrationLabel,
      registrationUrl: formData.registrationUrl || null,
      status: formData.status,
      isFeatured: formData.isFeatured,
      heroImage: formData.heroImage || null,
      displayOrder: formData.displayOrder,
      isActive: formData.isActive,
      pageTemplate: formData.pageTemplate,
      overviewTitle: formData.overviewTitle,
      objectives: formData.objectives.length > 0 ? formData.objectives : null,
      eligibilityCriteria: formData.eligibilityCriteria.length > 0 ? formData.eligibilityCriteria : null,
      eligibilityTitle: formData.eligibilityTitle,
      eligibilityIntro: formData.eligibilityIntro || null,
      deliveryTitle: formData.deliveryTitle,
      deliveryDescription: formData.deliveryDescription || null,
      duration: formData.duration || null,
      certificate: formData.certificate || null,
      ctaTitle: formData.ctaTitle || null,
      ctaDescription: formData.ctaDescription || null,
      ctaButtonText: formData.ctaButtonText,
    }
    onSave(submitData)
  }

  const sectionTabs = [
    { id: "basic", label: "Basic Info" },
    { id: "content", label: "Page Content" },
    { id: "eligibility", label: "Eligibility & Delivery" },
    { id: "cta", label: "Call to Action" },
  ] as const

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-[#1F2933]">
            {event ? "Edit Event" : "Add Event"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="border-b px-6">
          <div className="flex gap-1">
            {sectionTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeSection === tab.id 
                    ? "border-[#0F3D2E] text-[#0F3D2E]" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeSection === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                    data-testid="input-event-title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                    placeholder="e.g., annual-mentorship-summit"
                    data-testid="input-event-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Advancing Equity and Excellence in African Chemical Sciences"
                  data-testid="input-event-subtitle"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                    data-testid="input-event-start-date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    data-testid="input-event-end-date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="e.g., Nairobi, Kenya"
                    data-testid="input-event-location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    data-testid="select-event-mode"
                  >
                    <option value="Virtual">Virtual</option>
                    <option value="In-person">In-person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Template</label>
                  <select
                    value={formData.pageTemplate}
                    onChange={(e) => setFormData({ ...formData, pageTemplate: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    data-testid="select-event-template"
                  >
                    <option value="standard">Standard</option>
                    <option value="featured-program">Featured Program (like ChemBridge)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    data-testid="select-event-status"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Past">Past</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full p-2 border rounded-lg min-h-[80px]"
                  required
                  placeholder="Brief description for event cards"
                  data-testid="textarea-event-summary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image (Poster)</label>
                <p className="text-xs text-gray-500 mb-2">Upload a landscape event poster or banner image</p>
                <ImageUpload
                  value={formData.heroImage}
                  onChange={(url) => setFormData({ ...formData, heroImage: url })}
                  placeholder="Upload event poster image"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Label</label>
                  <input
                    type="text"
                    value={formData.registrationLabel}
                    onChange={(e) => setFormData({ ...formData, registrationLabel: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Register"
                    data-testid="input-event-reg-label"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration URL</label>
                  <input
                    type="text"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="https://... or /events/your-event/register"
                    data-testid="input-event-reg-url"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-lg"
                    min="0"
                    data-testid="input-event-order"
                  />
                </div>
                <div className="flex items-end gap-4 pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4"
                      data-testid="checkbox-event-featured"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                      data-testid="checkbox-event-active"
                    />
                    Active
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === "content" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overview Title</label>
                <input
                  type="text"
                  value={formData.overviewTitle}
                  onChange={(e) => setFormData({ ...formData, overviewTitle: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Overview"
                  data-testid="input-event-overview-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description (Body)</label>
                <RichTextEditor
                  value={formData.body}
                  onChange={(value) => setFormData({ ...formData, body: value })}
                  placeholder="Full event description and details..."
                  minHeight="180px"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Programme Objectives</label>
                  <Button type="button" size="sm" variant="outline" onClick={addObjective}>
                    <Plus className="w-4 h-4 mr-1" /> Add Objective
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mb-3">Add objectives that will appear with icons on the event page</p>
                
                {formData.objectives.map((obj, index) => (
                  <div key={index} className="border rounded-lg p-3 mb-3 bg-gray-50">
                    <div className="flex gap-3 mb-2">
                      <div className="w-32">
                        <label className="block text-xs text-gray-500 mb-1">Icon</label>
                        <select
                          value={obj.icon}
                          onChange={(e) => updateObjective(index, "icon", e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                        >
                          {availableIcons.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Title</label>
                        <input
                          type="text"
                          value={obj.title}
                          onChange={(e) => updateObjective(index, "title", e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="e.g., Technical Excellence"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeObjective(index)}
                        className="self-end text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <textarea
                        value={obj.description}
                        onChange={(e) => updateObjective(index, "description", e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        rows={2}
                        placeholder="Describe this objective..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "eligibility" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Section Title</label>
                <input
                  type="text"
                  value={formData.eligibilityTitle}
                  onChange={(e) => setFormData({ ...formData, eligibilityTitle: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Who Should Apply"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Introduction</label>
                <input
                  type="text"
                  value={formData.eligibilityIntro}
                  onChange={(e) => setFormData({ ...formData, eligibilityIntro: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., This programme is open to:"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Eligibility Criteria</label>
                  <Button type="button" size="sm" variant="outline" onClick={addCriteria}>
                    <Plus className="w-4 h-4 mr-1" /> Add Criterion
                  </Button>
                </div>
                
                {formData.eligibilityCriteria.map((criteria, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={criteria}
                      onChange={(e) => updateCriteria(index, e.target.value)}
                      className="flex-1 p-2 border rounded-lg text-sm"
                      placeholder="e.g., Undergraduate students in chemistry..."
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeCriteria(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Section Title</label>
                  <input
                    type="text"
                    value={formData.deliveryTitle}
                    onChange={(e) => setFormData({ ...formData, deliveryTitle: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Delivery Mode"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Description</label>
                  <input
                    type="text"
                    value={formData.deliveryDescription}
                    onChange={(e) => setFormData({ ...formData, deliveryDescription: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="e.g., Pan-African (Virtual with limited in-person sessions)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., Multi-day Programme"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
                    <input
                      type="text"
                      value={formData.certificate}
                      onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., Awarded upon completion"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "cta" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Configure the call-to-action section at the bottom of the event page</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Title</label>
                <input
                  type="text"
                  value={formData.ctaTitle}
                  onChange={(e) => setFormData({ ...formData, ctaTitle: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Ready to Advance Your Career?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Description</label>
                <textarea
                  value={formData.ctaDescription}
                  onChange={(e) => setFormData({ ...formData, ctaDescription: e.target.value })}
                  className="w-full p-2 border rounded-lg min-h-[80px]"
                  placeholder="Encouraging text to motivate visitors to apply..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={formData.ctaButtonText}
                  onChange={(e) => setFormData({ ...formData, ctaButtonText: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Submit Your Application"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" data-testid="button-save-event">
              {event ? "Update Event" : "Add Event"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
