"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  Loader2,
  CheckCircle2,
  Database,
  AlertCircle,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { substituteVariables, SAMPLE_VARIABLES, AVAILABLE_VARIABLES } from "@/lib/email-templates"

interface EmailTemplate {
  id: number
  name: string
  slug: string
  subject: string
  body: string
  category: string
  variables: string | null
  isActive: boolean
  createdAt: string
}

const CATEGORY_LABELS: Record<string, string> = {
  application: "Application",
  notification: "Notification",
  newsletter: "Newsletter",
  system: "System",
  general: "General",
  donation: "Donation",
}

export function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [seedMessage, setSeedMessage] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    subject: "",
    body: "",
    category: "application",
    variables: "",
  })
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/email-templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      slug: template.slug,
      subject: template.subject,
      body: template.body,
      category: template.category,
      variables: template.variables || "",
    })
    setShowForm(true)
    setPreviewTemplate(null)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData({ name: "", slug: "", subject: "", body: "", category: "application", variables: "" })
    setSaveError("")
    setShowForm(true)
    setPreviewTemplate(null)
  }

  const handleSave = async () => {
    setSaveError("")
    if (!formData.name.trim() || !formData.slug.trim() || !formData.subject.trim() || !formData.body.trim()) {
      setSaveError("Name, slug, subject and body are all required.")
      return
    }

    try {
      const url = editingTemplate
        ? `/api/admin/email-templates/${editingTemplate.id}`
        : "/api/admin/email-templates"
      const method = editingTemplate ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variables: formData.variables ? formData.variables.split(",").map(v => v.trim()) : null,
        }),
      })

      if (response.ok) {
        fetchTemplates()
        setShowForm(false)
        setEditingTemplate(null)
      } else {
        const data = await response.json()
        setSaveError(data.error || "Failed to save template.")
      }
    } catch {
      setSaveError("Network error. Please try again.")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template? This cannot be undone.")) return
    try {
      await fetch(`/api/admin/email-templates/${id}`, { method: "DELETE" })
      fetchTemplates()
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  const handleSeedSystemTemplates = async () => {
    setSeedStatus("loading")
    setSeedMessage("")
    try {
      const res = await fetch("/api/admin/email-templates/seed", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setSeedStatus("success")
        setSeedMessage(data.message || "System templates seeded.")
        fetchTemplates()
      } else {
        setSeedStatus("error")
        setSeedMessage(data.error || "Seeding failed.")
      }
    } catch {
      setSeedStatus("error")
      setSeedMessage("Network error during seeding.")
    }
    setTimeout(() => setSeedStatus("idle"), 4000)
  }

  const renderPreview = (template: EmailTemplate) => {
    const subject = substituteVariables(template.subject, SAMPLE_VARIABLES)
    const body = substituteVariables(template.body, SAMPLE_VARIABLES)
    return { subject, body }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Email Templates</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleSeedSystemTemplates}
            disabled={seedStatus === "loading"}
            data-testid="button-seed-templates"
            className="text-green-800 border-green-200 hover:bg-green-50"
          >
            {seedStatus === "loading" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : seedStatus === "success" ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
            ) : seedStatus === "error" ? (
              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            {seedStatus === "loading" ? "Seeding..." : "Seed System Templates"}
          </Button>
          <Button onClick={handleCreate} className="bg-green-800 hover:bg-green-900 text-white" data-testid="button-create-template">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {seedMessage && (
        <div className={`flex items-center gap-2 p-3 rounded-md text-sm ${seedStatus === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {seedStatus === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {seedMessage}
        </div>
      )}

      {/* Available Variables Reference */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm font-medium text-amber-800 mb-2">Available Template Variables</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_VARIABLES.map(v => (
            <code key={v.key} className="text-xs bg-white border border-amber-200 rounded px-1.5 py-0.5 text-amber-700 cursor-help" title={`${v.description} · Example: ${v.example}`}>
              {`{{${v.key}}}`}
            </code>
          ))}
        </div>
        <p className="text-xs text-amber-600 mt-2">Hover over a variable to see its description and example value.</p>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Loading templates...</p>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">No email templates yet.</p>
            <p className="text-sm mt-1">Click <strong>Seed System Templates</strong> to create the built-in set, or create a custom template.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => {
            const isPreviewOpen = previewTemplate?.id === template.id
            const preview = isPreviewOpen ? renderPreview(template) : null

            return (
              <Card key={template.id} data-testid={`template-${template.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {CATEGORY_LABELS[template.category] || template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">slug: {template.slug}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewTemplate(isPreviewOpen ? null : template)}
                        data-testid={`button-preview-template-${template.id}`}
                        title="Preview with sample variables"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(template)} data-testid={`button-edit-template-${template.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(template.id)} data-testid={`button-delete-template-${template.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Subject: {template.subject}</p>
                  {template.variables && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.split(",").map(v => v.trim()).filter(Boolean).map(v => (
                        <code key={v} className="text-xs bg-gray-100 rounded px-1.5 py-0.5 text-gray-600">{`{{${v}}}`}</code>
                      ))}
                    </div>
                  )}

                  {/* Preview pane */}
                  {isPreviewOpen && preview && (
                    <div className="mt-3 border rounded-lg overflow-hidden" data-testid={`preview-pane-${template.id}`}>
                      <div className="bg-gray-100 px-3 py-2 border-b flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Preview (with sample variables)</span>
                        <span className="text-xs text-gray-400">Subject: {preview.subject}</span>
                      </div>
                      <div className="p-4 bg-white max-h-60 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{preview.body}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold">
                {editingTemplate ? "Edit Template" : "Create Template"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setSaveError("") }}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Tabs defaultValue="edit" className="p-6">
              <TabsList className="mb-4">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview" disabled={!formData.body}>Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Template Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Application Accepted"
                    data-testid="input-template-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Slug *</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                    placeholder="e.g., application-accepted"
                    data-testid="input-template-slug"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category *</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="select-template-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="donation">Donation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Subject *</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Email subject line — supports {{variables}}"
                    data-testid="input-template-subject"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Body *</label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Email body. Use {{name}}, {{firstName}}, {{applicationType}}, etc."
                    rows={10}
                    data-testid="input-template-body"
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Variables used (comma-separated keys)</label>
                  <Input
                    value={formData.variables}
                    onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                    placeholder="e.g., name, applicationType, date"
                    data-testid="input-template-variables"
                  />
                  <p className="text-xs text-gray-400 mt-1">List the variable keys this template uses — for documentation only.</p>
                </div>
                {saveError && (
                  <p className="text-red-600 text-sm" data-testid="text-save-error">{saveError}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} className="flex-1 bg-green-800 hover:bg-green-900 text-white" data-testid="button-save-template">
                    {editingTemplate ? "Update Template" : "Create Template"}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowForm(false); setSaveError("") }}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                {formData.body ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded border">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Subject (rendered)</p>
                      <p className="text-sm font-medium">{substituteVariables(formData.subject, SAMPLE_VARIABLES)}</p>
                    </div>
                    <div className="p-3 bg-white rounded border max-h-96 overflow-y-auto">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Body (rendered with sample data)</p>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {substituteVariables(formData.body, SAMPLE_VARIABLES)}
                      </pre>
                    </div>
                    <p className="text-xs text-gray-400">Showing with sample values. Actual emails will use real recipient data.</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-8 text-center">Write a template body first to see the preview.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}
