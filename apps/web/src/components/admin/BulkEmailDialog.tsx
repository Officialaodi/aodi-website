"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Send, Loader2, CheckCircle2, AlertCircle, Users, Mail } from "lucide-react"
import { substituteVariables } from "@/lib/email-templates"

interface EmailTemplate {
  id: number
  name: string
  slug: string
  subject: string
  body: string
  category: string
}

interface Recipient {
  id: number
  email: string
  name: string
}

interface BulkEmailDialogProps {
  open: boolean
  onClose: () => void
  recipients: Recipient[]
  applicationIds: number[]
}

export function BulkEmailDialog({ open, onClose, recipients, applicationIds }: BulkEmailDialogProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; errors: string[] } | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setSelectedTemplate("")
      setSubject("")
      setBody("")
      setResult(null)
      setError("")
      fetchTemplates()
    }
  }, [open])

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/admin/email-templates?category=application")
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

  // Preview subject/body with placeholder variables
  function previewText(text: string) {
    return substituteVariables(text, {
      name: recipients[0]?.name || "Recipient",
      firstName: recipients[0]?.name?.split(" ")[0] || "Recipient",
      email: recipients[0]?.email || "",
      recipientName: recipients[0]?.name || "Recipient",
    })
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setError("Subject and message body are required.")
      return
    }
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/admin/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds, subject, body }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ sent: data.sent, failed: data.failed, errors: data.errors || [] })
      } else {
        setError(data.error || "Failed to send bulk email.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const recipientsWithEmail = recipients.filter(r => r.email)

  return (
    <Dialog open={open} onOpenChange={v => !v && !sending && onClose()}>
      <DialogContent className="max-w-2xl" data-testid="bulk-email-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-800" />
            Send Bulk Email
          </DialogTitle>
        </DialogHeader>

        {result ? (
          // Result view
          <div className="py-6 space-y-4">
            <div className={`flex items-center gap-3 p-4 rounded-lg ${result.failed === 0 ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
              <CheckCircle2 className={`w-6 h-6 flex-shrink-0 ${result.failed === 0 ? "text-green-600" : "text-amber-600"}`} />
              <div>
                <p className="font-semibold text-gray-800">{result.sent} email{result.sent !== 1 ? "s" : ""} sent successfully</p>
                {result.failed > 0 && <p className="text-sm text-amber-700">{result.failed} failed to send</p>}
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-semibold text-gray-600 uppercase">Failed recipients</p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 font-mono">{e}</p>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Compose view
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            {/* Recipients summary */}
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Users className="w-4 h-4 text-green-700 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Sending to {recipientsWithEmail.length} applicant{recipientsWithEmail.length !== 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto">
                  {recipientsWithEmail.slice(0, 12).map(r => (
                    <Badge key={r.id} variant="outline" className="text-xs bg-white">
                      {r.name || r.email}
                    </Badge>
                  ))}
                  {recipientsWithEmail.length > 12 && (
                    <Badge variant="outline" className="text-xs bg-white">
                      +{recipientsWithEmail.length - 12} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Template picker */}
            {templates.length > 0 && (
              <div className="space-y-1">
                <Label>Template (optional)</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger data-testid="select-bulk-template">
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
              <Label htmlFor="bulk-subject">Subject *</Label>
              <Input
                id="bulk-subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject"
                data-testid="input-bulk-subject"
              />
              {subject && (
                <p className="text-xs text-gray-400 mt-0.5 italic">Preview: {previewText(subject)}</p>
              )}
            </div>

            {/* Body */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="bulk-body">Message *</Label>
                <span className="text-xs text-gray-400">Use {"{{name}}"}, {"{{firstName}}"}, {"{{email}}"} for personalisation</span>
              </div>
              <Textarea
                id="bulk-body"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={10}
                placeholder="Write your email message here. Use {{name}} and {{firstName}} for personalised greetings."
                data-testid="textarea-bulk-body"
                className="resize-none font-mono text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <p className="text-xs text-gray-400">
              Each recipient receives their own personalised copy. Variables like {"{{name}}"} are substituted per-recipient. All sends are logged in the email log.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={sending}
            data-testid="button-bulk-email-cancel"
          >
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !body.trim()}
              className="bg-green-800 hover:bg-green-900 text-white"
              data-testid="button-bulk-email-send"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending to {recipientsWithEmail.length} recipients...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {recipientsWithEmail.length} Recipient{recipientsWithEmail.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
