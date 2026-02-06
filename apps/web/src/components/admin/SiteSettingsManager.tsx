"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { ImageUpload } from "@/components/ui/image-upload"
import { RefreshCw, Save, Globe, Home, Mail, Share2, Info, Handshake, Users, BarChart3, Heart, Shield, GraduationCap, Calendar, BookOpen } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface SiteSetting {
  id: number
  key: string
  value: string
  category: string
  label: string | null
  description: string | null
  fieldType: string | null
  updatedAt: string
}

type SettingsGroup = Record<string, SiteSetting[]>

const categoryIcons: Record<string, typeof Globe> = {
  homepage: Home,
  about: Info,
  getinvolved: Users,
  programs: GraduationCap,
  events: Calendar,
  resources: BookOpen,
  partners: Handshake,
  impact: BarChart3,
  support: Heart,
  governance: Shield,
  footer: Mail,
  social: Share2,
  general: Globe,
}

const categoryLabels: Record<string, string> = {
  homepage: "Homepage",
  about: "About Page",
  getinvolved: "Get Involved Page",
  programs: "Programs Page",
  events: "Events Page",
  resources: "Resources Page",
  partners: "Partners Page",
  impact: "Impact Page",
  support: "Support / Donations Page",
  governance: "Governance Page",
  footer: "Footer & Contact",
  social: "Social Media",
  general: "General",
}

const categoryOrder = ["homepage", "about", "getinvolved", "programs", "events", "resources", "partners", "impact", "support", "governance", "footer", "social", "general"]

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SettingsGroup>({})
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/site-settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        const initial: Record<string, string> = {}
        for (const category of Object.values(data) as SiteSetting[][]) {
          for (const setting of category) {
            initial[setting.key] = setting.value
          }
        }
        setEditedValues(initial)
        setHasChanges(false)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = Object.entries(editedValues).map(([key, value]) => ({ key, value }))
      const response = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })
      if (response.ok) {
        setHasChanges(false)
        fetchSettings()
      }
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const renderField = (setting: SiteSetting) => {
    const value = editedValues[setting.key] ?? setting.value

    switch (setting.fieldType) {
      case "richtext":
        return (
          <RichTextEditor
            value={value}
            onChange={(newValue) => handleChange(setting.key, newValue)}
            placeholder={setting.description || "Enter content..."}
            minHeight="150px"
          />
        )
      case "image":
        return (
          <ImageUpload
            value={value}
            onChange={(newValue) => handleChange(setting.key, newValue)}
            placeholder="Upload an image"
          />
        )
      case "json":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            placeholder={setting.description || "Enter JSON..."}
            rows={6}
            className="font-mono text-xs"
            data-testid={`json-${setting.key}`}
          />
        )
      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            placeholder={setting.description || "Enter text..."}
            rows={4}
            data-testid={`textarea-${setting.key}`}
          />
        )
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            placeholder={setting.description || "Enter value..."}
            data-testid={`input-${setting.key}`}
          />
        )
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">Loading settings...</p>
        </CardContent>
      </Card>
    )
  }

  const categories = [...Object.keys(settings)].sort((a, b) => {
    const ai = categoryOrder.indexOf(a)
    const bi = categoryOrder.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle>Site Settings</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSettings} data-testid="button-refresh-settings">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              data-testid="button-save-settings"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasChanges && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              You have unsaved changes. Click &quot;Save All Changes&quot; to apply them.
            </div>
          )}

          <Tabs defaultValue={categories[0] || "homepage"}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {categories.map((category) => {
                const Icon = categoryIcons[category] || Globe
                return (
                  <TabsTrigger key={category} value={category} data-testid={`tab-${category}`}>
                    <Icon className="w-4 h-4 mr-2" />
                    {categoryLabels[category] || category}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="space-y-6">
                  {settings[category]?.map((setting) => (
                    <div key={setting.key} className="space-y-2" data-testid={`setting-${setting.key}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            {setting.label || setting.key}
                          </label>
                          {setting.description && (
                            <p className="text-xs text-gray-500">{setting.description}</p>
                          )}
                        </div>
                      </div>
                      {renderField(setting)}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
