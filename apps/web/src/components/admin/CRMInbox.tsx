"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SafeHtml } from "@/components/ui/safe-html"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search, RefreshCw, Mail, Paperclip, User, X, ExternalLink, Clock,
  Reply, MailOpen, MailX, Link2, Link2Off, Layers
} from "lucide-react"
import { EmailComposer } from "./EmailComposer"

interface SyncedEmail {
  id: number
  messageId: string
  accountId: number
  fromEmail: string
  fromName: string | null
  toEmail: string
  subject: string
  body?: string
  htmlBody?: string | null
  receivedAt: string
  isRead: boolean
  hasAttachments: boolean
  linkedEntityType: string | null
  linkedEntityId: number | null
  accountName: string | null
  accountEmail: string | null
}

interface EmailAccount {
  id: number
  name: string
  email: string
}

export function CRMInbox() {
  const [emails, setEmails] = useState<SyncedEmail[]>([])
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<SyncedEmail | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState("all")
  const [linkedOnly, setLinkedOnly] = useState(false)
  const [threadView, setThreadView] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [replyOpen, setReplyOpen] = useState(false)

  // Link/unlink state
  const [linkEntityType, setLinkEntityType] = useState<string>("application")
  const [linkEntityId, setLinkEntityId] = useState("")
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkStatus, setLinkStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    fetchAccounts()
    fetchEmails()
  }, [selectedAccountId, linkedOnly])

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/admin/email-accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (err) {
      console.error("Error fetching accounts:", err)
    }
  }

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedAccountId !== "all") params.append("accountId", selectedAccountId)
      if (linkedOnly) params.append("linkedOnly", "true")
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/admin/inbox?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEmails(data)
      }
    } catch (err) {
      console.error("Error fetching emails:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEmails()
  }

  const openEmailDetail = async (email: SyncedEmail) => {
    try {
      const response = await fetch(`/api/admin/inbox/${email.id}`)
      if (response.ok) {
        const fullEmail = await response.json()
        setSelectedEmail(fullEmail)
        setEmails(emails.map(e => e.id === email.id ? { ...e, isRead: true } : e))
        setLinkEntityType(fullEmail.linkedEntityType || "application")
        setLinkEntityId(fullEmail.linkedEntityId ? String(fullEmail.linkedEntityId) : "")
        setLinkStatus("idle")
      }
    } catch (err) {
      console.error("Error fetching email details:", err)
    }
  }

  const handleToggleRead = async (email: SyncedEmail) => {
    const newIsRead = !email.isRead
    try {
      await fetch(`/api/admin/inbox/${email.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: newIsRead }),
      })
      setEmails(emails.map(e => e.id === email.id ? { ...e, isRead: newIsRead } : e))
      if (selectedEmail?.id === email.id) {
        setSelectedEmail({ ...selectedEmail, isRead: newIsRead })
      }
    } catch (err) {
      console.error("Error toggling read status:", err)
    }
  }

  const handleLinkEntity = async () => {
    if (!selectedEmail || !linkEntityId.trim()) return
    setLinkLoading(true)
    setLinkStatus("idle")
    try {
      const res = await fetch(`/api/admin/inbox/${selectedEmail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedEntityType: linkEntityType,
          linkedEntityId: parseInt(linkEntityId),
        }),
      })
      if (res.ok) {
        const updated = { ...selectedEmail, linkedEntityType: linkEntityType, linkedEntityId: parseInt(linkEntityId) }
        setSelectedEmail(updated)
        setEmails(emails.map(e => e.id === selectedEmail.id ? { ...e, linkedEntityType: linkEntityType, linkedEntityId: parseInt(linkEntityId) } : e))
        setLinkStatus("success")
      } else {
        setLinkStatus("error")
      }
    } catch {
      setLinkStatus("error")
    } finally {
      setLinkLoading(false)
    }
  }

  const handleUnlinkEntity = async () => {
    if (!selectedEmail) return
    setLinkLoading(true)
    try {
      await fetch(`/api/admin/inbox/${selectedEmail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedEntityType: null, linkedEntityId: null }),
      })
      const updated = { ...selectedEmail, linkedEntityType: null, linkedEntityId: null }
      setSelectedEmail(updated)
      setEmails(emails.map(e => e.id === selectedEmail.id ? { ...e, linkedEntityType: null, linkedEntityId: null } : e))
      setLinkEntityId("")
      setLinkStatus("idle")
    } catch (err) {
      console.error("Error unlinking:", err)
    } finally {
      setLinkLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" })
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  // Thread view: group emails by sender
  const groupedEmails = threadView
    ? emails.reduce<Record<string, SyncedEmail[]>>((acc, email) => {
        const key = email.fromEmail
        if (!acc[key]) acc[key] = []
        acc[key].push(email)
        return acc
      }, {})
    : null

  return (
    <div className="flex h-[650px] gap-4">
      {/* Email List */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex gap-2 mb-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emails..."
                className="pl-9"
                data-testid="input-search-emails"
              />
            </div>
            <Button type="submit" variant="outline" size="icon" data-testid="button-search">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[160px]" data-testid="select-account-filter">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={linkedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setLinkedOnly(!linkedOnly)}
            data-testid="button-linked-only"
            title="Show only CRM-linked emails"
          >
            <User className="w-4 h-4 mr-1" />
            CRM
          </Button>

          <Button
            variant={threadView ? "default" : "outline"}
            size="sm"
            onClick={() => setThreadView(!threadView)}
            data-testid="button-thread-view"
            title="Group by sender (thread view)"
          >
            <Layers className="w-4 h-4 mr-1" />
            Thread
          </Button>

          <Button variant="outline" size="icon" onClick={fetchEmails} data-testid="button-refresh-inbox">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Loading emails...
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mail className="w-12 h-12 text-gray-300 mb-4" />
              <p>No emails found</p>
              <p className="text-sm text-gray-400">Sync your email accounts to see messages here</p>
            </div>
          ) : threadView && groupedEmails ? (
            // Thread view — grouped by sender
            <div>
              {Object.entries(groupedEmails).map(([senderEmail, threadEmails]) => (
                <div key={senderEmail} className="border-b last:border-0">
                  <div className="px-3 py-2 bg-gray-50 flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600">{senderEmail}</span>
                    <Badge variant="outline" className="text-xs ml-auto">{threadEmails.length}</Badge>
                  </div>
                  {threadEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => openEmailDetail(email)}
                      className={`flex items-start gap-3 px-3 py-2 border-b cursor-pointer hover:bg-gray-50 ${!email.isRead ? "bg-blue-50" : ""} ${selectedEmail?.id === email.id ? "bg-gray-100" : ""}`}
                      data-testid={`email-row-${email.id}`}
                    >
                      <div className="flex-1 min-w-0 pl-3">
                        <p className={`text-sm truncate ${!email.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {email.subject}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(email.receivedAt)}</span>
                          {email.hasAttachments && <Paperclip className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            // Flat list view
            <div>
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => openEmailDetail(email)}
                  className={`flex items-start gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 ${!email.isRead ? "bg-blue-50" : ""} ${selectedEmail?.id === email.id ? "bg-gray-100" : ""}`}
                  data-testid={`email-row-${email.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium truncate text-sm ${!email.isRead ? "text-gray-900" : "text-gray-700"}`}>
                        {email.fromName || email.fromEmail}
                      </span>
                      {email.linkedEntityType && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded flex-shrink-0">
                          {email.linkedEntityType === "application" ? "Applicant" : "Contact"}
                        </span>
                      )}
                      {email.hasAttachments && <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                    </div>
                    <p className={`text-sm truncate ${!email.isRead ? "font-medium" : ""}`}>
                      {email.subject}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span className="truncate">{email.accountName || email.accountEmail}</span>
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="flex-shrink-0">{formatDate(email.receivedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedEmail && (
        <EmailComposer
          open={replyOpen}
          onClose={() => setReplyOpen(false)}
          recipientEmail={selectedEmail.fromEmail}
          recipientName={selectedEmail.fromName || undefined}
          defaultSubject={`Re: ${selectedEmail.subject}`}
        />
      )}

      {/* Email Detail */}
      {selectedEmail && (
        <Card className="w-[480px] flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-hidden p-4 flex flex-col gap-3">
            {/* Header */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight">{selectedEmail.subject}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  From: {selectedEmail.fromName ? `${selectedEmail.fromName} <${selectedEmail.fromEmail}>` : selectedEmail.fromEmail}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(selectedEmail.receivedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyOpen(true)}
                  data-testid="button-reply-email"
                  className="text-green-800 border-green-200 hover:bg-green-50"
                  title="Reply"
                >
                  <Reply className="w-4 h-4 mr-1" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleRead(selectedEmail)}
                  data-testid="button-toggle-read"
                  title={selectedEmail.isRead ? "Mark as unread" : "Mark as read"}
                >
                  {selectedEmail.isRead ? <MailX className="w-4 h-4 text-gray-500" /> : <MailOpen className="w-4 h-4 text-blue-500" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedEmail(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Link / Unlink section */}
            <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                  <Link2 className="w-3 h-3" /> CRM Link
                </span>
                {selectedEmail.linkedEntityType && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    Linked to {selectedEmail.linkedEntityType === "application" ? "Applicant" : "Contact"} #{selectedEmail.linkedEntityId}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Select value={linkEntityType} onValueChange={setLinkEntityType}>
                  <SelectTrigger className="w-[130px] h-8 text-xs" data-testid="select-link-entity-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="ID #"
                  value={linkEntityId}
                  onChange={e => setLinkEntityId(e.target.value)}
                  className="w-20 h-8 text-xs"
                  type="number"
                  data-testid="input-link-entity-id"
                />
                <Button
                  size="sm"
                  className="h-8 text-xs bg-green-800 hover:bg-green-900 text-white"
                  onClick={handleLinkEntity}
                  disabled={linkLoading || !linkEntityId.trim()}
                  data-testid="button-link-entity"
                >
                  <Link2 className="w-3 h-3 mr-1" />
                  Link
                </Button>
                {selectedEmail.linkedEntityType && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleUnlinkEntity}
                    disabled={linkLoading}
                    data-testid="button-unlink-entity"
                  >
                    <Link2Off className="w-3 h-3 mr-1" />
                    Unlink
                  </Button>
                )}
              </div>
              {linkStatus === "success" && <p className="text-xs text-green-600">Linked successfully.</p>}
              {linkStatus === "error" && <p className="text-xs text-red-600">Failed to link. Check the ID and try again.</p>}

              {selectedEmail.linkedEntityType && (
                <a
                  href={`/admin#${selectedEmail.linkedEntityType}s`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-green-700 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View linked {selectedEmail.linkedEntityType}
                </a>
              )}
            </div>

            {/* Email body */}
            <div className="flex-1 overflow-y-auto border-t pt-3">
              {selectedEmail.htmlBody ? (
                <SafeHtml
                  html={selectedEmail.htmlBody}
                  className="prose prose-sm max-w-none"
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm font-sans text-gray-700 leading-relaxed">
                  {selectedEmail.body}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
