"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Send, Mail, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { substituteVariables } from "@/lib/email-templates"

interface EmailTemplate {
  id: number
  name: string
  slug: string
  subject: string
  body: string
  category: string
}

interface RecipientSuggestion {
  email: string
  name: string
  source: "contact" | "application"
  id: number
}

interface EmailComposerProps {
  open: boolean
  onClose: () => void
  recipientEmail?: string
  recipientName?: string
  applicationId?: number
  contactId?: number
  syncedEmailId?: number
  defaultSubject?: string
  defaultBody?: string
  templateCategory?: string
  onSent?: () => void
}

export function EmailComposer({
  open,
  onClose,
  recipientEmail = "",
  recipientName = "",
  applicationId,
  contactId,
  syncedEmailId,
  defaultSubject = "",
  defaultBody = "",
  templateCategory,
  onSent,
}: EmailComposerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(defaultBody)
  const [toEmail, setToEmail] = useState(recipientEmail)
  const [toName, setToName] = useState(recipientName)
  const [ccEmail, setCcEmail] = useState("")
  const [bccEmail, setBccEmail] = useState("")
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Recipient search/autocomplete
  const [suggestions, setSuggestions] = useState<RecipientSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setToEmail(recipientEmail)
      setToName(recipientName)
      setSubject(defaultSubject)
      setBody(defaultBody)
      setSelectedTemplate("")
      setCcEmail("")
      setBccEmail("")
      setShowCcBcc(false)
      setStatus("idle")
      setSuggestions([])
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
    return substituteVariables(text, {
      name: toName || "",
      firstName: toName ? toName.split(" ")[0] : "",
      email: toEmail || "",
      recipientName: toName || "",
    })
  }

  async function searchRecipients(query: string) {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    try {
      const res = await fetch(`/api/admin/contacts?search=${encodeURIComponent(query)}&limit=5`)
      const contactSuggestions: RecipientSuggestion[] = []
      if (res.ok) {
        const data = await res.json()
        const contacts = data.contacts || data || []
        for (const c of contacts) {
          if (c.email) {
            contactSuggestions.push({ email: c.email, name: c.fullName || c.name || c.email, source: "contact", id: c.id })
          }
        }
      }

      const res2 = await fetch(`/api/admin/applications?search=${encodeURIComponent(query)}&limit=5`)
      const appSuggestions: RecipientSuggestion[] = []
      if (res2.ok) {
        const data2 = await res2.json()
        const apps = data2.applications || data2 || []
        for (const a of apps) {
          if (a.email) {
            appSuggestions.push({ email: a.email, name: a.fullName || a.name || a.email, source: "application", id: a.id })
          }
        }
      }

      const combined = [...contactSuggestions, ...appSuggestions].slice(0, 8)
      setSuggestions(combined)
      setShowSuggestions(combined.length > 0)
    } catch {}
  }

  function handleToEmailChange(value: string) {
    setToEmail(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const t = setTimeout(() => searchRecipients(value), 300)
    setSearchTimeout(t)
  }

  function selectSuggestion(s: RecipientSuggestion) {
    setToEmail(s.email)
    setToName(s.name)
    setSuggestions([])
    setShowSuggestions(false)
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
          ccEmail: ccEmail || undefined,
          bccEmail: bccEmail || undefined,
          subject: applyVariables(subject),
          body: applyVariables(body),
          applicationId,
          contactId,
          syncedEmailId,
          templateId: selectedTemplate ? parseInt(selectedTemplate) : undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setStatus("success")
        onSent?.()
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

        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* To */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 relative">
                <Label htmlFor="ec-to-email">To (Email) *</Label>
                <Input
                  id="ec-to-email"
                  type="email"
                  value={toEmail}
                  onChange={e => handleToEmailChange(e.target.value)}
                  onFocus={() => toEmail.length >= 2 && setShowSuggestions(suggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="recipient@example.com"
                  data-testid="input-composer-email"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 z-50 bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto"
                    data-testid="recipient-suggestions"
                  >
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between gap-2 border-b last:border-0"
                        onMouseDown={() => selectSuggestion(s)}
                      >
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {s.source === "contact" ? "Contact" : "Applicant"}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
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

            {/* CC / BCC toggle */}
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              onClick={() => setShowCcBcc(!showCcBcc)}
              data-testid="button-toggle-ccbcc"
            >
              {showCcBcc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showCcBcc ? "Hide CC / BCC" : "Add CC / BCC"}
            </button>

            {showCcBcc && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ec-cc">CC</Label>
                  <Input
                    id="ec-cc"
                    type="email"
                    value={ccEmail}
                    onChange={e => setCcEmail(e.target.value)}
                    placeholder="cc@example.com"
                    data-testid="input-composer-cc"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ec-bcc">BCC</Label>
                  <Input
                    id="ec-bcc"
                    type="email"
                    value={bccEmail}
                    onChange={e => setBccEmail(e.target.value)}
                    placeholder="bcc@example.com"
                    data-testid="input-composer-bcc"
                  />
                </div>
              </div>
            )}
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
              <span className="text-xs text-gray-400">Variables: {"{{name}}"}, {"{{firstName}}"}, {"{{email}}"}</span>
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
