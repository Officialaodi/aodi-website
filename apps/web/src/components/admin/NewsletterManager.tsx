"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  Send, Users, Mail, Loader2, CheckCircle2, AlertCircle, Trash2,
  RefreshCw, FlaskConical, Upload, UserCheck, Globe, ClipboardList
} from "lucide-react"

interface Subscriber {
  id: number
  email: string
  fullName: string | null
  status: string | null
  source: string | null
  unsubscribedAt: string | null
  createdAt: string | null
}

interface Stats {
  total: number
  active: number
  unsubscribed: number
}

interface CrmContact {
  email: string
  fullName: string
}

type RecipientMode = "subscribers" | "all_contacts" | "custom"

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0 })
  const [loadingSubscribers, setLoadingSubscribers] = useState(true)
  const [crmContacts, setCrmContacts] = useState<CrmContact[]>([])
  const [loadingCrm, setLoadingCrm] = useState(false)

  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [testMode, setTestMode] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle")
  const [sendResult, setSendResult] = useState<{ sent?: number; failed?: number; total?: number } | null>(null)
  const [sendError, setSendError] = useState("")

  const [recipientMode, setRecipientMode] = useState<RecipientMode>("subscribers")
  const [customList, setCustomList] = useState("")
  const [parsedCustom, setParsedCustom] = useState<CrmContact[]>([])

  const [search, setSearch] = useState("")

  const [importText, setImportText] = useState("")
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchSubscribers = useCallback(async () => {
    setLoadingSubscribers(true)
    try {
      const res = await fetch("/api/admin/newsletter/subscribers")
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data.subscribers || [])
        setStats(data.stats || { total: 0, active: 0, unsubscribed: 0 })
      }
    } catch { } finally {
      setLoadingSubscribers(false)
    }
  }, [])

  const fetchCrmContacts = useCallback(async () => {
    setLoadingCrm(true)
    try {
      const res = await fetch("/api/admin/applications?type=all")
      if (res.ok) {
        const data: { email: string; fullName: string }[] = await res.json()
        const seen = new Set<string>()
        const unique: CrmContact[] = []
        for (const a of data) {
          if (a.email && !seen.has(a.email.toLowerCase())) {
            seen.add(a.email.toLowerCase())
            unique.push({ email: a.email, fullName: a.fullName || "" })
          }
        }
        setCrmContacts(unique)
      }
    } catch { } finally {
      setLoadingCrm(false)
    }
  }, [])

  useEffect(() => { fetchSubscribers() }, [fetchSubscribers])

  useEffect(() => {
    if (recipientMode === "all_contacts" && crmContacts.length === 0) {
      fetchCrmContacts()
    }
  }, [recipientMode, crmContacts.length, fetchCrmContacts])

  useEffect(() => {
    const lines = customList.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean)
    const seen = new Set<string>()
    const parsed: CrmContact[] = []
    for (const line of lines) {
      const emailMatch = line.match(/([^\s<>,;]+@[^\s<>,;>]+)/)
      const nameMatch = line.match(/^([^<@,;]+)\s*</)
      if (emailMatch) {
        const email = emailMatch[1].toLowerCase()
        if (!seen.has(email)) {
          seen.add(email)
          parsed.push({ email, fullName: nameMatch ? nameMatch[1].trim() : "" })
        }
      }
    }
    setParsedCustom(parsed)
  }, [customList])

  function getRecipients(): CrmContact[] {
    if (recipientMode === "subscribers") {
      return subscribers
        .filter(s => !s.unsubscribedAt && s.status === "active")
        .map(s => ({ email: s.email, fullName: s.fullName || "" }))
    }
    if (recipientMode === "all_contacts") return crmContacts
    return parsedCustom
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setSendStatus("error")
      setSendError("Subject and message body are required.")
      return
    }
    if (testMode && !testEmail.trim()) {
      setSendStatus("error")
      setSendError("Please enter a test email address.")
      return
    }

    const recipients = getRecipients()
    if (!testMode && recipients.length === 0) {
      setSendStatus("error")
      setSendError("No recipients found for the selected audience.")
      return
    }

    setSending(true)
    setSendStatus("idle")
    setSendResult(null)

    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          testMode,
          testEmail: testMode ? testEmail : undefined,
          recipientMode,
          recipients: testMode ? undefined : recipients,
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSendStatus("success")
        setSendResult(data)
      } else {
        setSendStatus("error")
        setSendError(data.error || "Failed to send newsletter.")
      }
    } catch {
      setSendStatus("error")
      setSendError("Network error. Please try again.")
    } finally {
      setSending(false)
    }
  }

  async function handleDeleteSubscriber(id: number) {
    if (!confirm("Remove this subscriber from the list?")) return
    try {
      await fetch("/api/admin/newsletter/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setSubscribers(prev => prev.filter(s => s.id !== id))
      setStats(prev => ({ ...prev, total: prev.total - 1 }))
    } catch {
      alert("Failed to remove subscriber.")
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      setImportText(text)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  async function handleImport() {
    const lines = importText.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean)
    const toImport: { email: string; fullName: string }[] = []
    const seen = new Set<string>()
    for (const line of lines) {
      const emailMatch = line.match(/([^\s<>,;]+@[^\s<>,;>]+)/)
      const nameMatch = line.match(/^([^<@,;]+)\s*</)
      if (emailMatch) {
        const email = emailMatch[1].toLowerCase()
        if (!seen.has(email)) {
          seen.add(email)
          toImport.push({ email, fullName: nameMatch ? nameMatch[1].trim() : "" })
        }
      }
    }
    if (toImport.length === 0) {
      alert("No valid email addresses found. Make sure each line contains a valid email.")
      return
    }
    setImporting(true)
    setImportResult(null)
    try {
      const res = await fetch("/api/admin/newsletter/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: toImport, source: "import" }),
      })
      const data = await res.json()
      if (res.ok) {
        setImportResult(data)
        setImportText("")
        fetchSubscribers()
      } else {
        alert(data.error || "Import failed.")
      }
    } catch {
      alert("Network error during import.")
    } finally {
      setImporting(false)
    }
  }

  const filteredSubscribers = subscribers.filter(s =>
    !search ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.fullName || "").toLowerCase().includes(search.toLowerCase())
  )

  const recipients = getRecipients()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Newsletter</h2>
        <p className="text-gray-500 mt-1">Compose and send newsletters to any audience — subscribers, all form contacts, or a custom list.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-800" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Newsletter subscribers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">Active subscribers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{crmContacts.length || "—"}</p>
              <p className="text-xs text-gray-500">CRM contacts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose" data-testid="tab-newsletter-compose">Compose & Send</TabsTrigger>
          <TabsTrigger value="subscribers" data-testid="tab-newsletter-subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="import" data-testid="tab-newsletter-import">Import Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose Newsletter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Audience selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Send To *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRecipientMode("subscribers")}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${recipientMode === "subscribers" ? "border-green-700 bg-green-50 ring-1 ring-green-700" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    data-testid="button-audience-subscribers"
                  >
                    <UserCheck className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Newsletter subscribers</p>
                      <p className="text-xs text-gray-500 mt-0.5">{stats.active} active subscribers</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecipientMode("all_contacts")}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${recipientMode === "all_contacts" ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    data-testid="button-audience-all-contacts"
                  >
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">All form contacts</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {loadingCrm ? "Loading..." : crmContacts.length > 0 ? `${crmContacts.length} unique contacts` : "Everyone who submitted a form"}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecipientMode("custom")}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${recipientMode === "custom" ? "border-purple-600 bg-purple-50 ring-1 ring-purple-600" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    data-testid="button-audience-custom"
                  >
                    <ClipboardList className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Custom list</p>
                      <p className="text-xs text-gray-500 mt-0.5">Paste emails manually</p>
                    </div>
                  </button>
                </div>

                {recipientMode === "custom" && (
                  <div className="space-y-1 mt-2">
                    <Label className="text-xs text-gray-500">
                      Paste email addresses below — one per line, or comma/semicolon separated. Formats accepted: <code>email@example.com</code> or <code>John Smith &lt;email@example.com&gt;</code>
                    </Label>
                    <Textarea
                      rows={6}
                      value={customList}
                      onChange={e => setCustomList(e.target.value)}
                      placeholder={"john@example.com\nJane Doe <jane@example.com>\nanother@example.com"}
                      className="font-mono text-sm resize-y"
                      data-testid="textarea-custom-recipients"
                    />
                    {parsedCustom.length > 0 && (
                      <p className="text-xs text-green-700 font-medium">✓ {parsedCustom.length} valid email{parsedCustom.length !== 1 ? "s" : ""} parsed</p>
                    )}
                  </div>
                )}

                {!testMode && (
                  <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                    This newsletter will be sent to <strong>{recipients.length} recipient{recipients.length !== 1 ? "s" : ""}</strong>
                    {recipientMode === "all_contacts" && " (all contacts who submitted any form on the website)"}
                    {recipientMode === "subscribers" && " (active newsletter subscribers only)"}
                    {recipientMode === "custom" && " from your custom list"}
                  </div>
                )}
              </div>

              {/* Test mode */}
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div>
                  <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Test Mode
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    {testMode ? "Will send only to the test email address below" : "Turn on to send a test to yourself before sending to everyone"}
                  </p>
                </div>
                <Switch
                  checked={testMode}
                  onCheckedChange={setTestMode}
                  data-testid="switch-newsletter-test-mode"
                />
              </div>

              {testMode && (
                <div className="space-y-1">
                  <Label>Test Email Address *</Label>
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    data-testid="input-newsletter-test-email"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label>Subject *</Label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Newsletter subject line"
                  data-testid="input-newsletter-subject"
                />
              </div>

              <div className="space-y-1">
                <Label>Message Body *</Label>
                <p className="text-xs text-gray-400 mb-1">
                  HTML is supported. This content is wrapped in AODI branded email template automatically.
                </p>
                <Textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={12}
                  placeholder="Write your newsletter content here. HTML is supported..."
                  data-testid="textarea-newsletter-body"
                  className="font-mono text-sm resize-y"
                />
              </div>

              {sendStatus === "success" && sendResult && (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {testMode ? "Test email sent successfully!" : `Newsletter sent — ${sendResult.sent} delivered, ${sendResult.failed || 0} failed`}
                    </p>
                    {!testMode && sendResult.total && (
                      <p className="text-xs mt-0.5">Total recipients: {sendResult.total}</p>
                    )}
                  </div>
                </div>
              )}

              {sendStatus === "error" && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{sendError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setSubject(""); setBody(""); setSendStatus("idle") }}
                  data-testid="button-newsletter-clear"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sending}
                  className="bg-green-800 hover:bg-green-900 text-white"
                  data-testid="button-newsletter-send"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : testMode ? (
                    <>
                      <FlaskConical className="w-4 h-4 mr-2" />
                      Send Test
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send to {recipients.length} Recipient{recipients.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Subscriber List</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchSubscribers} data-testid="button-subscribers-refresh">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search by email or name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  data-testid="input-subscribers-search"
                />
              </div>

              {loadingSubscribers ? (
                <div className="text-center py-12 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading subscribers...
                </div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No subscribers found</p>
                  <p className="text-xs mt-1">Use the <strong>Import Contacts</strong> tab to add people from your old system.</p>
                </div>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Subscribed</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscribers.map(sub => (
                        <TableRow key={sub.id} data-testid={`subscriber-row-${sub.id}`}>
                          <TableCell className="font-medium text-sm">{sub.email}</TableCell>
                          <TableCell className="text-sm text-gray-600">{sub.fullName || "—"}</TableCell>
                          <TableCell>
                            <Badge className={sub.unsubscribedAt || sub.status !== 'active' ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}>
                              {sub.unsubscribedAt ? "Unsubscribed" : sub.status || "active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{sub.source || "—"}</TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteSubscriber(sub.id)}
                              data-testid={`button-delete-subscriber-${sub.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 space-y-1">
                <p className="font-medium">Import from your old system</p>
                <p>Paste a list of email addresses below, or upload a CSV file. Accepted formats:</p>
                <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
                  <li><code>email@example.com</code></li>
                  <li><code>John Smith &lt;email@example.com&gt;</code></li>
                  <li>CSV with columns: <code>email</code> and optionally <code>name</code> or <code>fullName</code></li>
                  <li>One email per line, or comma/semicolon separated</li>
                </ul>
                <p className="text-xs mt-2">Duplicate emails are automatically skipped. Imported contacts are added as active subscribers.</p>
              </div>

              <div className="flex gap-3 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-csv"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV / TXT file
                </Button>
                <span className="text-xs text-gray-400">or paste below</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="space-y-1">
                <Label>Email list</Label>
                <Textarea
                  rows={10}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder={"Paste emails here, one per line:\n\njohn@example.com\nJane Doe <jane@example.com>\nanother@example.com"}
                  className="font-mono text-sm resize-y"
                  data-testid="textarea-import-emails"
                />
              </div>

              {importResult && (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">
                    Import complete — {importResult.added} added, {importResult.skipped} skipped (duplicates)
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleImport}
                  disabled={importing || !importText.trim()}
                  className="bg-green-800 hover:bg-green-900 text-white"
                  data-testid="button-import-contacts"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import to Subscriber List
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
