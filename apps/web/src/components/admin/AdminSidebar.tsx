"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Users,
  BarChart3,
  Shield,
  BookOpen,
  Building2,
  Quote,
  BookMarked,
  FileText,
  Calendar,
  Heart,
  MessageCircle,
  Mail,
  Settings,
  Activity,
  Zap,
  ChevronDown,
  ChevronRight,
  Inbox,
  List,
  UserCog,
  KeyRound,
  LayoutDashboard,
  FolderOpen,
  type LucideIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavItem {
  label: string
  value: string
  icon: LucideIcon
}

interface NavGroup {
  label: string
  icon: LucideIcon
  items: NavItem[]
  defaultOpen?: boolean
}

const navGroups: NavGroup[] = [
  {
    label: "CRM & Communications",
    icon: Users,
    defaultOpen: true,
    items: [
      { label: "Applications", value: "applications", icon: Users },
      { label: "Contacts", value: "contacts", icon: MessageCircle },
      { label: "Inbox", value: "inbox", icon: Inbox },
      { label: "Email Templates", value: "email-templates", icon: Mail },
      { label: "Email Settings", value: "email-settings", icon: Settings },
    ],
  },
  {
    label: "Content",
    icon: BookOpen,
    defaultOpen: true,
    items: [
      { label: "Programs", value: "programs", icon: BookOpen },
      { label: "Stories", value: "stories", icon: BookMarked },
      { label: "Resources", value: "resources", icon: FileText },
      { label: "Events", value: "events", icon: Calendar },
      { label: "Testimonials", value: "testimonials", icon: Quote },
      { label: "Partners", value: "partners", icon: Building2 },
    ],
  },
  {
    label: "Organization",
    icon: Shield,
    items: [
      { label: "Governance", value: "governance", icon: Shield },
      { label: "Impact Metrics", value: "impact", icon: BarChart3 },
      { label: "Donations", value: "donations", icon: Heart },
    ],
  },
  {
    label: "Analytics & Reports",
    icon: BarChart3,
    items: [
      { label: "Analytics", value: "analytics", icon: BarChart3 },
      { label: "Activity Log", value: "activity-log", icon: Activity },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    defaultOpen: true,
    items: [
      { label: "Site Settings", value: "site-settings", icon: Settings },
      { label: "Forms", value: "forms", icon: List },
      { label: "Media Library", value: "media-library", icon: FolderOpen },
      { label: "Integrations", value: "integrations", icon: Zap },
      { label: "Users", value: "users", icon: UserCog },
      { label: "Roles", value: "roles", icon: KeyRound },
    ],
  },
]

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  permissions: string[]
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function AdminSidebar({
  activeSection,
  onSectionChange,
  permissions,
  isCollapsed = false,
}: AdminSidebarProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navGroups.forEach((group) => {
      initial[group.label] = group.defaultOpen ?? false
    })
    return initial
  })

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const hasPermission = (itemValue: string): boolean => {
    if (itemValue === "users" || itemValue === "roles" || itemValue === "activity-log") {
      return permissions.includes("users.manage") || permissions.includes("*")
    }
    return true
  }

  const getFilteredGroups = () => {
    return navGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(item.value)),
    })).filter((group) => group.items.length > 0)
  }

  const filteredGroups = getFilteredGroups()

  if (isCollapsed) {
    return (
      <div className="w-16 bg-[#0F3D2E] h-screen sticky top-0 self-start flex flex-col items-center py-4 gap-1 overflow-y-auto">
        {filteredGroups.map((group) => (
          <div key={group.label} className="flex flex-col items-center gap-1">
            {group.items.map((item) => (
              <Button
                key={item.value}
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white/70 hover:text-white hover:bg-white/10",
                  activeSection === item.value && "bg-white/20 text-white"
                )}
                title={item.label}
                onClick={() => onSectionChange(item.value)}
                data-testid={`sidebar-item-${item.value}-collapsed`}
              >
                <item.icon className="w-5 h-5" />
              </Button>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-64 bg-[#0F3D2E] h-screen sticky top-0 self-start flex flex-col">
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-white" />
          <h2 className="text-lg font-semibold text-white">Admin Portal</h2>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {filteredGroups.map((group) => (
          <Collapsible
            key={group.label}
            open={openGroups[group.label]}
            onOpenChange={() => toggleGroup(group.label)}
            className="mb-1"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 h-auto"
                )}
                data-testid={`sidebar-group-${group.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center gap-2">
                  <group.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{group.label}</span>
                </div>
                {openGroups[group.label] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {group.items.map((item) => (
                <Button
                  key={item.value}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sm h-9 px-3",
                    activeSection === item.value
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  onClick={() => onSectionChange(item.value)}
                  data-testid={`sidebar-item-${item.value}`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>
    </div>
  )
}
