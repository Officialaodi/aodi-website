"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Mail, 
  Plus,
  Edit,
  Trash2,
  X
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    subject: "",
    body: "",
    category: "application",
    variables: ""
  })

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
      variables: template.variables || ""
    })
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData({
      name: "",
      slug: "",
      subject: "",
      body: "",
      category: "application",
      variables: ""
    })
    setShowForm(true)
  }

  const [saveError, setSaveError] = useState("")

  const handleSave = async () => {
    setSaveError("")
    
    if (!formData.name.trim() || !formData.slug.trim() || !formData.subject.trim() || !formData.body.trim()) {
      setSaveError("All fields are required")
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
          variables: formData.variables ? formData.variables.split(",").map(v => v.trim()) : null
        })
      })
      
      if (response.ok) {
        fetchTemplates()
        setShowForm(false)
        setEditingTemplate(null)
      } else {
        const data = await response.json()
        setSaveError(data.error || "Failed to save template")
      }
    } catch (error) {
      console.error("Error saving template:", error)
      setSaveError("Failed to save template. Please try again.")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return
    try {
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchTemplates()
      }
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Email Templates</h2>
        <Button onClick={handleCreate} data-testid="button-create-template">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Loading templates...</p>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No email templates yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id} data-testid={`template-${template.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Category: {template.category} | Slug: {template.slug}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(template)} data-testid={`button-edit-template-${template.id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(template.id)} data-testid={`button-delete-template-${template.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-1">Subject: {template.subject}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{template.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingTemplate ? "Edit Template" : "Create Template"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Template Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Application Accepted"
                  data-testid="input-template-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., application-accepted"
                  data-testid="input-template-slug"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger data-testid="select-template-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Email subject line"
                  data-testid="input-template-subject"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Body</label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Email body content. Use {{name}}, {{applicationType}}, etc. for variables"
                  rows={8}
                  data-testid="input-template-body"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Variables (comma-separated)</label>
                <Input
                  value={formData.variables}
                  onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                  placeholder="e.g., name, applicationType, amount"
                  data-testid="input-template-variables"
                />
              </div>
              {saveError && (
                <p className="text-red-600 text-sm" data-testid="text-save-error">{saveError}</p>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1" data-testid="button-save-template">
                  {editingTemplate ? "Update" : "Create"} Template
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setSaveError(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
