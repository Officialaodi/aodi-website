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
  Zap,
  Info,
  RotateCcw,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { substituteVariables, SAMPLE_VARIABLES, AVAILABLE_VARIABLES, TRANSACTIONAL_TEMPLATES } from "@/lib/email-templates"

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
  transactional: "Transactional",
  application: "Application",
  notification: "Notification",
  newsletter: "Newsletter",
  system: "System",
  general: "General",
  donation: "Donation",
}

// Descriptions for each transactional template slug so admin knows when it fires
const TRANSACTIONAL_DESCRIPTIONS: Record<string, string> = {}
TRANSACTIONAL_TEMPLATES.forEach(t => {
  if (t.description) TRANSACTIONAL_DESCRIPTIONS[t.slug] = t.description
})

// Slugs that are considered "transactional" even if stored with old category
const TRANSACTIONAL_SLUGS = new Set(TRANSACTIONAL_TEMPLATES.map(t => t.slug))

export function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [seedMessage, setSeedMessage] = useState("")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    subject: "",
    body: "",
    category: "transactional",
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

  const handleCreate = (defaultCategory = "general") => {
    setEditingTemplate(null)
    setFormData({ name: "", slug: "", subject: "", body: "", category: defaultCategory, variables: "" })
    setSaveError("")
    setShowForm(true)
    setPreviewTemplate(null)
  }

  const handleSave = async () => {
    setSaveError("")
    setSaveStatus("saving")
    if (!formData.name.trim() || !formData.slug.trim() || !formData.subject.trim() || !formData.body.trim()) {
      setSaveError("Name, slug, subject and body are all required.")
      setSaveStatus("idle")
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
          // Always send variables as comma-separated string
          variables: formData.variables ? formData.variables.split(",").map(v => v.trim()).filter(Boolean).join(",") : "",
        }),
      })

      if (response.ok) {
        setSaveStatus("saved")
        fetchTemplates()
        setTimeout(() => {
          setShowForm(false)
          setEditingTemplate(null)
          setSaveStatus("idle")
        }, 900)
      } else {
        const data = await response.json()
        setSaveError(data.error || "Failed to save template.")
        setSaveStatus("error")
      }
    } catch {
      setSaveError("Network error. Please try again.")
      setSaveStatus("error")
    }
  }

  const handleResetToDefault = () => {
    if (!editingTemplate) return
    const defaultTmpl = TRANSACTIONAL_TEMPLATES.find(t => t.slug === editingTemplate.slug)
    if (!defaultTmpl) return
    if (!confirm("Reset this template to the built-in default? Your edits will be lost.")) return
    setFormData(prev => ({
      ...prev,
      subject: defaultTmpl.subject,
      body: defaultTmpl.body,
      variables: defaultTmpl.variables.join(", "),
    }))
    setSaveError("")
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
    setTimeout(() => setSeedStatus("idle"), 5000)
  }

  const renderPreview = (template: EmailTemplate) => {
    const subject = substituteVariables(template.subject, SAMPLE_VARIABLES)
    const body = substituteVariables(template.body, SAMPLE_VARIABLES)
    return { subject, body }
  }

  // Separate templates into transactional vs other
  const transactionalTemplates = templates.filter(
    t => t.category === "transactional" || TRANSACTIONAL_SLUGS.has(t.slug)
  )
  const otherTemplates = templates.filter(
    t => t.category !== "transactional" && !TRANSACTIONAL_SLUGS.has(t.slug)
  )

  // Count how many transactional templates are missing from DB
  const missingCount = TRANSACTIONAL_TEMPLATES.filter(
    st => !templates.some(t => t.slug === st.slug)
  ).length

  const renderTemplateCard = (template: EmailTemplate, showTriggerBadge = false) => {
    const isPreviewOpen = previewTemplate?.id === template.id
    const preview = isPreviewOpen ? renderPreview(template) : null
    const description = TRANSACTIONAL_DESCRIPTIONS[template.slug]

    return (
      <Card key={template.id} data-testid={`template-${template.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={`text-xs ${template.category === "transactional" || TRANSACTIONAL_SLUGS.has(template.slug) ? "bg-amber-50 border-amber-200 text-amber-700" : ""}`}
                >
                  {CATEGORY_LABELS[template.category] || template.category}
                </Badge>
                {!template.isActive && (
                  <Badge variant="outline" className="text-xs bg-red-50 border-red-200 text-red-600">Inactive</Badge>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">slug: {template.slug}</p>
              {description && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  {description}
                </p>
              )}
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
            {missingCount > 0 && seedStatus === "idle" && (
              <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs rounded-full px-1.5 py-0.5">{missingCount}</span>
            )}
          </Button>
          <Button onClick={() => handleCreate("general")} className="bg-green-800 hover:bg-green-900 text-white" data-testid="button-create-template">
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
      ) : (
        <Tabs defaultValue="transactional">
          <TabsList className="mb-4">
            <TabsTrigger value="transactional" data-testid="tab-transactional">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Transactional
              <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs rounded-full px-1.5 py-0.5">{transactionalTemplates.length}</span>
            </TabsTrigger>
            <TabsTrigger value="other" data-testid="tab-other">
              Other
              <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs rounded-full px-1.5 py-0.5">{otherTemplates.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactional" className="space-y-4">
            {/* Explanation banner */}
            <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Platform Transactional Emails</p>
                <p>These emails are sent automatically by the platform (e.g. when someone applies or submits a form). Edit the subject and body here and the platform will use your version instantly. If a template is deleted, the platform falls back to a built-in default.</p>
                {missingCount > 0 && (
                  <p className="mt-2 font-medium text-amber-700">
                    {missingCount} template{missingCount > 1 ? "s are" : " is"} not yet in the database — click <strong>Seed System Templates</strong> above to add them.
                  </p>
                )}
              </div>
            </div>

            {transactionalTemplates.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No transactional templates in database yet.</p>
                  <p className="text-sm mt-1">Click <strong>Seed System Templates</strong> above to load all 12 platform email templates.</p>
                  <Button
                    onClick={handleSeedSystemTemplates}
                    disabled={seedStatus === "loading"}
                    className="mt-4 bg-green-800 hover:bg-green-900 text-white"
                    data-testid="button-seed-transactional-empty"
                  >
                    {seedStatus === "loading" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                    Seed Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {transactionalTemplates.map(template => renderTemplateCard(template, true))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => handleCreate("newsletter")} size="sm" variant="outline" data-testid="button-create-other-template">
                <Plus className="w-4 h-4 mr-1.5" />
                New Template
              </Button>
            </div>
            {otherTemplates.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No other templates yet.</p>
                  <p className="text-sm mt-1">Use the <strong>New Template</strong> button to create newsletter or custom templates.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {otherTemplates.map(template => renderTemplateCard(template))}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
                    placeholder="e.g., ack-mentor"
                    disabled={!!editingTemplate && TRANSACTIONAL_SLUGS.has(editingTemplate.slug)}
                    className={editingTemplate && TRANSACTIONAL_SLUGS.has(editingTemplate.slug) ? "bg-gray-50 text-gray-500" : ""}
                    data-testid="input-template-slug"
                  />
                  {editingTemplate && TRANSACTIONAL_SLUGS.has(editingTemplate.slug) && (
                    <p className="text-xs text-amber-600 mt-1">Slug is locked — the platform uses this exact slug to find the template.</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category *</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="select-template-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactional">Transactional (auto-sent by platform)</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
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
                    placeholder="Email subject — supports {{variables}}"
                    data-testid="input-template-subject"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Body *</label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Email body. Use {{firstName}}, {{name}}, {{applicationType}}, {{websiteUrl}}, {{contactEmail}}, {{resetUrl}}, etc."
                    rows={12}
                    data-testid="input-template-body"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Use double blank lines between paragraphs. HTML tags like &lt;strong&gt;, &lt;a href=&quot;…&quot;&gt; are supported.</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Variables used (comma-separated keys)</label>
                  <Input
                    value={formData.variables}
                    onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                    placeholder="e.g., firstName, name, applicationType, resetUrl"
                    data-testid="input-template-variables"
                  />
                  <p className="text-xs text-gray-400 mt-1">For documentation only — helps you remember which variables this template uses.</p>
                </div>
                {saveError && (
                  <p className="text-red-600 text-sm flex items-center gap-1.5" data-testid="text-save-error">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {saveError}
                  </p>
                )}
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button
                    onClick={handleSave}
                    disabled={saveStatus === "saving" || saveStatus === "saved"}
                    className={`flex-1 text-white ${saveStatus === "saved" ? "bg-green-600 hover:bg-green-600" : "bg-green-800 hover:bg-green-900"}`}
                    data-testid="button-save-template"
                  >
                    {saveStatus === "saving" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                    ) : saveStatus === "saved" ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved!</>
                    ) : (
                      editingTemplate ? "Update Template" : "Create Template"
                    )}
                  </Button>
                  {editingTemplate && TRANSACTIONAL_SLUGS.has(editingTemplate.slug) && TRANSACTIONAL_TEMPLATES.find(t => t.slug === editingTemplate.slug) && (
                    <Button
                      variant="outline"
                      onClick={handleResetToDefault}
                      title="Reset subject and body to the built-in default"
                      data-testid="button-reset-template"
                      className="text-amber-700 border-amber-200 hover:bg-amber-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-1.5" />
                      Reset to Default
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { setShowForm(false); setSaveError(""); setSaveStatus("idle") }}>
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
