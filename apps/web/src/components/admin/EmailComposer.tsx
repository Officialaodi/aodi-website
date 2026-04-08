"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Send, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface EmailTemplate {
  id: number
  name: string
  slug: string
  subject: string
  body: string
  category: string
}

interface EmailComposerProps {
  open: boolean
  onClose: () => void
  recipientEmail?: string
  recipientName?: string
  applicationId?: number
  contactId?: number
  defaultSubject?: string
  defaultBody?: string
  templateCategory?: string
}

export function EmailComposer({
  open,
  onClose,
  recipientEmail = "",
  recipientName = "",
  applicationId,
  contactId,
  defaultSubject = "",
  defaultBody = "",
  templateCategory,
}: EmailComposerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(defaultBody)
  const [toEmail, setToEmail] = useState(recipientEmail)
  const [toName, setToName] = useState(recipientName)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (open) {
      setToEmail(recipientEmail)
      setToName(recipientName)
      setSubject(defaultSubject)
      setBody(defaultBody)
      setSelectedTemplate("")
      setStatus("idle")
      fetchTemplates()
    }
  }, [open, recipientEmail, recipientName, defaultSubject, defaultBody])

  async function fetchTemplates() {
    try {
      const url = templateCategory
        ? `/api/admin/email-templates?category=${templateCategory}`
        : "/api/admin/email-templates"
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || data || [])
      }
    } catch {}
  }

  function handleTemplateSelect(value: string) {
    setSelectedTemplate(value)
    const template = templates.find(t => t.id.toString() === value)
    if (template) {
      setSubject(template.subject)
      setBody(template.body)
    }
  }

  function applyVariables(text: string): string {
    return text
      .replace(/\{\{name\}\}/gi, toName || "")
      .replace(/\{\{email\}\}/gi, toEmail || "")
      .replace(/\{\{recipientName\}\}/gi, toName || "")
  }

  async function handleSend() {
    if (!toEmail || !subject || !body) {
      setStatus("error")
      setErrorMessage("Recipient email, subject and body are required.")
      return
    }

    setSending(true)
    setStatus("idle")

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: toEmail,
          recipientName: toName,
          subject: applyVariables(subject),
          body: applyVariables(body),
          applicationId,
          contactId,
          templateId: selectedTemplate ? parseInt(selectedTemplate) : undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setStatus("success")
        setTimeout(() => { onClose(); setStatus("idle") }, 2000)
      } else {
        setStatus("error")
        setErrorMessage(data.error || "Failed to send email.")
      }
    } catch {
      setStatus("error")
      setErrorMessage("Network error. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl" data-testid="email-composer-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-800" />
            Compose Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* To */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ec-to-email">To (Email) *</Label>
              <Input
                id="ec-to-email"
                type="email"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder="recipient@example.com"
                data-testid="input-composer-email"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ec-to-name">Name</Label>
              <Input
                id="ec-to-name"
                value={toName}
                onChange={e => setToName(e.target.value)}
                placeholder="Recipient name"
                data-testid="input-composer-name"
              />
            </div>
          </div>

          {/* Template picker */}
          {templates.length > 0 && (
            <div className="space-y-1">
              <Label>Template (optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger data-testid="select-composer-template">
                  <SelectValue placeholder="Select a template to pre-fill..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      <span className="flex items-center gap-2">
                        {t.name}
                        <Badge variant="outline" className="text-xs ml-1">{t.category}</Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-1">
            <Label htmlFor="ec-subject">Subject *</Label>
            <Input
              id="ec-subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Email subject"
              data-testid="input-composer-subject"
            />
          </div>

          {/* Body */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="ec-body">Message *</Label>
              <span className="text-xs text-gray-400">Supports: {"{{name}}"}, {"{{email}}"}</span>
            </div>
            <Textarea
              id="ec-body"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              placeholder="Write your email message here..."
              data-testid="textarea-composer-body"
              className="resize-none font-mono text-sm"
            />
          </div>

          {/* Status feedback */}
          {status === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Email sent successfully!</span>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending} data-testid="button-composer-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || status === "success"}
            className="bg-green-800 hover:bg-green-900 text-white"
            data-testid="button-composer-send"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
