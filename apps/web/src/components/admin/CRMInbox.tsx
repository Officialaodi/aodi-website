"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SafeHtml } from "@/components/ui/safe-html"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Search, RefreshCw, Mail, Paperclip, User, X, ExternalLink, Clock, Reply } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [replyOpen, setReplyOpen] = useState(false)

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
      }
    } catch (err) {
      console.error("Error fetching email details:", err)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="flex h-[600px] gap-4">
      {/* Email List */}
      <div className="flex-1 flex flex-col">
        <div className="flex gap-2 mb-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
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
            <Button type="submit" variant="outline" data-testid="button-search">
              <Search className="w-4 h-4" />
            </Button>
          </form>
          
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[180px]" data-testid="select-account-filter">
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
          >
            <User className="w-4 h-4 mr-1" />
            CRM Contacts
          </Button>
          
          <Button variant="outline" size="sm" onClick={fetchEmails} data-testid="button-refresh-inbox">
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
          ) : (
            <div>
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => openEmailDetail(email)}
                  className={`flex items-start gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    !email.isRead ? "bg-blue-50" : ""
                  } ${selectedEmail?.id === email.id ? "bg-gray-100" : ""}`}
                  data-testid={`email-row-${email.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium truncate ${!email.isRead ? "text-gray-900" : "text-gray-700"}`}>
                        {email.fromName || email.fromEmail}
                      </span>
                      {email.linkedEntityType && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          {email.linkedEntityType === "application" ? "Applicant" : "Contact"}
                        </span>
                      )}
                      {email.hasAttachments && <Paperclip className="w-3 h-3 text-gray-400" />}
                    </div>
                    <p className={`text-sm truncate ${!email.isRead ? "font-medium" : ""}`}>
                      {email.subject}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>{email.accountName || email.accountEmail}</span>
                      <span>|</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(email.receivedAt)}</span>
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
        <Card className="w-[500px] flex flex-col">
          <CardContent className="flex-1 overflow-hidden p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{selectedEmail.subject}</h3>
                <p className="text-sm text-gray-500">
                  From: {selectedEmail.fromName ? `${selectedEmail.fromName} <${selectedEmail.fromEmail}>` : selectedEmail.fromEmail}
                </p>
                <p className="text-sm text-gray-500">
                  To: {selectedEmail.toEmail}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(selectedEmail.receivedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyOpen(true)}
                  data-testid="button-reply-email"
                  className="text-green-800 border-green-200 hover:bg-green-50"
                >
                  <Reply className="w-4 h-4 mr-1" />
                  Reply
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {selectedEmail.linkedEntityType && (
              <div className="mb-4 p-2 bg-green-50 rounded flex items-center justify-between">
                <span className="text-sm text-green-700">
                  Linked to {selectedEmail.linkedEntityType === "application" ? "Applicant" : "Contact"} #{selectedEmail.linkedEntityId}
                </span>
                <Button variant="ghost" size="sm" className="text-green-700">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto border-t pt-4">
              {selectedEmail.htmlBody ? (
                <SafeHtml 
                  html={selectedEmail.htmlBody}
                  className="prose prose-sm max-w-none"
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm font-sans">
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
