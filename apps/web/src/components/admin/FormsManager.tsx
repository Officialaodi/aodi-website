"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, GripVertical, Copy, ExternalLink, Eye, EyeOff, FileText, AlertCircle, Check } from "lucide-react"

interface FormField {
  id?: number
  fieldKey: string
  label: string
  fieldType: string
  placeholder: string | null
  defaultValue: string | null
  helpText: string | null
  isRequired: boolean
  options: { label: string; value: string }[] | null
  validation: { minLength?: number; maxLength?: number; pattern?: string } | null
  width: string
  section: string | null
  displayOrder: number
  isActive: boolean
}

interface Form {
  id: number
  slug: string
  name: string
  description: string | null
  isEnabled: boolean
  closedMessage: string
  successMessage: string
  submitButtonText: string
  isBuiltIn: boolean
  requiresHcaptcha: boolean
  notifyEmail: string | null
  displayOrder: number
  fields?: FormField[]
}

const fieldTypes = [
  { value: "text", label: "Text Input" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Number" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Buttons" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "url", label: "URL" },
  { value: "country", label: "Country Selector" },
]

export function FormsManager() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [showFieldsDialog, setShowFieldsDialog] = useState(false)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 3000)
  }

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isEnabled: true,
    closedMessage: "This form is currently closed for submissions.",
    successMessage: "Thank you! Your submission has been received.",
    submitButtonText: "Submit",
    requiresHcaptcha: false,
    notifyEmail: "",
    displayOrder: 0,
  })

  const fetchForms = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/forms")
      if (res.ok) {
        const data = await res.json()
        setForms(data)
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  const handleToggleEnabled = async (form: Form) => {
    try {
      const res = await fetch(`/api/admin/forms/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          isEnabled: !form.isEnabled,
        }),
      })
      if (res.ok) {
        setForms(forms.map(f => 
          f.id === form.id ? { ...f, isEnabled: !f.isEnabled } : f
        ))
        showStatus("success", `${form.name} is now ${form.isEnabled ? "closed" : "open"} for submissions.`)
      }
    } catch (error) {
      console.error("Error toggling form:", error)
      showStatus("error", "Failed to update form status.")
    }
  }

  const handleEditForm = (form: Form) => {
    setEditingForm(form)
    setFormData({
      name: form.name,
      slug: form.slug,
      description: form.description || "",
      isEnabled: form.isEnabled,
      closedMessage: form.closedMessage,
      successMessage: form.successMessage,
      submitButtonText: form.submitButtonText,
      requiresHcaptcha: form.requiresHcaptcha,
      notifyEmail: form.notifyEmail || "",
      displayOrder: form.displayOrder,
    })
    setShowFormDialog(true)
  }

  const handleCreateForm = () => {
    setEditingForm(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      isEnabled: true,
      closedMessage: "This form is currently closed for submissions.",
      successMessage: "Thank you! Your submission has been received.",
      submitButtonText: "Submit",
      requiresHcaptcha: false,
      notifyEmail: "",
      displayOrder: forms.length,
    })
    setShowFormDialog(true)
  }

  const handleSaveForm = async () => {
    setSaving(true)
    try {
      const url = editingForm 
        ? `/api/admin/forms/${editingForm.id}` 
        : "/api/admin/forms"
      const method = editingForm ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        showStatus("success", `${formData.name} has been saved.`)
        setShowFormDialog(false)
        fetchForms()
      } else {
        const error = await res.json()
        showStatus("error", error.error || "Failed to save form.")
      }
    } catch (error) {
      console.error("Error saving form:", error)
      showStatus("error", "Failed to save form.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteForm = async (form: Form) => {
    if (form.isBuiltIn) {
      showStatus("error", "Built-in forms cannot be deleted.")
      return
    }

    if (!confirm(`Are you sure you want to delete "${form.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/forms/${form.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        showStatus("success", `${form.name} has been deleted.`)
        fetchForms()
      }
    } catch (error) {
      console.error("Error deleting form:", error)
      showStatus("error", "Failed to delete form.")
    }
  }

  const handleOpenFieldsEditor = async (form: Form) => {
    setSelectedForm(form)
    try {
      const res = await fetch(`/api/admin/forms/${form.id}`)
      if (res.ok) {
        const data = await res.json()
        setFields(data.fields || [])
        setShowFieldsDialog(true)
      }
    } catch (error) {
      console.error("Error fetching form fields:", error)
    }
  }

  const handleAddField = () => {
    const lastSection = fields.length > 0 ? fields[fields.length - 1].section : null
    setFields([
      ...fields,
      {
        fieldKey: `field_${Date.now()}`,
        label: "New Field",
        fieldType: "text",
        placeholder: null,
        defaultValue: null,
        helpText: null,
        isRequired: false,
        options: null,
        validation: null,
        width: "full",
        section: lastSection,
        displayOrder: fields.length,
        isActive: true,
      },
    ])
  }

  const handleUpdateField = (index: number, updates: Partial<FormField>) => {
    setFields(fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ))
  }

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleSaveFields = async () => {
    if (!selectedForm) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/forms/${selectedForm.id}/fields`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      })
      if (res.ok) {
        showStatus("success", "Form fields have been updated.")
        setShowFieldsDialog(false)
      } else {
        const error = await res.json()
        showStatus("error", error.error || "Failed to save fields.")
      }
    } catch (error) {
      console.error("Error saving fields:", error)
      showStatus("error", "Failed to save fields.")
    } finally {
      setSaving(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className={`p-3 rounded-md flex items-center gap-2 ${
          statusMessage.type === "success" 
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {statusMessage.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {statusMessage.text}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Forms Management</h2>
          <p className="text-muted-foreground">
            Enable/disable forms and create new custom forms
          </p>
        </div>
        <Button onClick={handleCreateForm} data-testid="button-create-form">
          <Plus className="w-4 h-4 mr-2" />
          Create New Form
        </Button>
      </div>

      <div className="grid gap-4">
        {forms.map((form) => (
          <Card key={form.id} className={!form.isEnabled ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isEnabled}
                      onCheckedChange={() => handleToggleEnabled(form)}
                      data-testid={`switch-form-${form.slug}`}
                    />
                    {form.isEnabled ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{form.name}</h3>
                      {form.isBuiltIn && (
                        <Badge variant="secondary">Built-in</Badge>
                      )}
                      <Badge variant={form.isEnabled ? "default" : "outline"}>
                        {form.isEnabled ? "Active" : "Closed"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>/{form.isBuiltIn ? `(varies)` : `forms/${form.slug}`}</span>
                      {!form.isEnabled && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="w-3 h-3" />
                          {form.closedMessage?.substring(0, 50)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenFieldsEditor(form)}
                    data-testid={`button-edit-fields-${form.slug}`}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Edit Fields
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/forms/${form.slug}`, "_blank")}
                    title="Preview form"
                    data-testid={`button-preview-${form.slug}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditForm(form)}
                    data-testid={`button-edit-${form.slug}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!form.isBuiltIn && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteForm(form)}
                      data-testid={`button-delete-${form.slug}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingForm ? "Edit Form Settings" : "Create New Form"}
            </DialogTitle>
            <DialogDescription>
              {editingForm 
                ? "Update form settings and closure message"
                : "Create a new custom form that will be available at /forms/[slug]"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Form Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      name: e.target.value,
                      slug: editingForm ? formData.slug : generateSlug(e.target.value)
                    })
                  }}
                  placeholder="Contact Form"
                  data-testid="input-form-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="contact-form"
                  disabled={editingForm?.isBuiltIn}
                  data-testid="input-form-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this form's purpose"
                data-testid="input-form-description"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                  data-testid="switch-form-enabled"
                />
                <Label htmlFor="isEnabled">Form is enabled</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="requiresHcaptcha"
                  checked={formData.requiresHcaptcha}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresHcaptcha: checked })}
                  data-testid="switch-hcaptcha"
                />
                <Label htmlFor="requiresHcaptcha">Require hCaptcha</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closedMessage">Closed Message</Label>
              <Textarea
                id="closedMessage"
                value={formData.closedMessage}
                onChange={(e) => setFormData({ ...formData, closedMessage: e.target.value })}
                placeholder="Message shown when form is disabled"
                data-testid="input-closed-message"
              />
              <p className="text-xs text-muted-foreground">
                This message is shown to visitors when the form is disabled
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="successMessage">Success Message</Label>
              <Textarea
                id="successMessage"
                value={formData.successMessage}
                onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                placeholder="Thank you message after submission"
                data-testid="input-success-message"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submitButtonText">Submit Button Text</Label>
                <Input
                  id="submitButtonText"
                  value={formData.submitButtonText}
                  onChange={(e) => setFormData({ ...formData, submitButtonText: e.target.value })}
                  placeholder="Submit"
                  data-testid="input-submit-button-text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifyEmail">Notification Email</Label>
                <Input
                  id="notifyEmail"
                  type="email"
                  value={formData.notifyEmail}
                  onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.value })}
                  placeholder="admin@example.com"
                  data-testid="input-notify-email"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveForm} disabled={saving || !formData.name || !formData.slug}>
              {saving ? "Saving..." : (editingForm ? "Update Form" : "Create Form")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFieldsDialog} onOpenChange={setShowFieldsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Form Fields: {selectedForm?.name}
            </DialogTitle>
            <DialogDescription>
              Add, remove, and configure form fields. Changes are saved when you click Save.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No fields added yet. Click "Add Field" to create your first field.
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 mt-2 text-muted-foreground cursor-move" />
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Label *</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => handleUpdateField(index, { 
                              label: e.target.value,
                              fieldKey: field.fieldKey.startsWith("field_") 
                                ? generateSlug(e.target.value) || `field_${index}`
                                : field.fieldKey
                            })}
                            placeholder="Field Label"
                            data-testid={`input-field-label-${index}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Field Key</Label>
                          <Input
                            value={field.fieldKey}
                            onChange={(e) => handleUpdateField(index, { fieldKey: e.target.value })}
                            placeholder="field_key"
                            data-testid={`input-field-key-${index}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={field.fieldType}
                            onValueChange={(value) => handleUpdateField(index, { fieldType: value })}
                          >
                            <SelectTrigger data-testid={`select-field-type-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Width</Label>
                          <Select
                            value={field.width}
                            onValueChange={(value) => handleUpdateField(index, { width: value })}
                          >
                            <SelectTrigger data-testid={`select-field-width-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full Width</SelectItem>
                              <SelectItem value="half">Half Width</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label className="text-xs">Section (for grouping)</Label>
                          <Input
                            value={field.section || ""}
                            onChange={(e) => handleUpdateField(index, { section: e.target.value || null })}
                            placeholder="e.g. Personal Information"
                            data-testid={`input-field-section-${index}`}
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label className="text-xs">Placeholder</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) => handleUpdateField(index, { placeholder: e.target.value })}
                            placeholder="Placeholder text"
                            data-testid={`input-field-placeholder-${index}`}
                          />
                        </div>
                        <div className="flex items-center gap-4 col-span-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={field.isRequired}
                              onCheckedChange={(checked) => handleUpdateField(index, { isRequired: checked })}
                              data-testid={`switch-field-required-${index}`}
                            />
                            <Label className="text-xs">Required</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={field.isActive}
                              onCheckedChange={(checked) => handleUpdateField(index, { isActive: checked })}
                              data-testid={`switch-field-active-${index}`}
                            />
                            <Label className="text-xs">Active</Label>
                          </div>
                        </div>
                        {(field.fieldType === "select" || field.fieldType === "radio") && (
                          <div className="col-span-4 space-y-1">
                            <Label className="text-xs">Options (one per line: label|value)</Label>
                            <Textarea
                              value={field.options?.map(o => `${o.label}|${o.value}`).join("\n") || ""}
                              onChange={(e) => {
                                const options = e.target.value.split("\n").filter(Boolean).map(line => {
                                  const [label, value] = line.split("|")
                                  return { label: label?.trim() || "", value: (value?.trim() || label?.trim() || "") }
                                })
                                handleUpdateField(index, { options })
                              }}
                              placeholder="Option 1|option1&#10;Option 2|option2"
                              rows={3}
                              data-testid={`textarea-field-options-${index}`}
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveField(index)}
                        data-testid={`button-remove-field-${index}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Button variant="outline" onClick={handleAddField} className="w-full" data-testid="button-add-field">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFieldsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFields} disabled={saving}>
              {saving ? "Saving..." : "Save Fields"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
