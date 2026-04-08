"use client"

import { useState, useEffect, useCallback } from "react"
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
  Send, Users, Mail, Loader2, CheckCircle2, AlertCircle, Trash2, RefreshCw, FlaskConical
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

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0 })
  const [loadingSubscribers, setLoadingSubscribers] = useState(true)

  // Compose state
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [testMode, setTestMode] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle")
  const [sendResult, setSendResult] = useState<{ sent?: number; failed?: number; total?: number } | null>(null)
  const [sendError, setSendError] = useState("")

  // Subscribers search
  const [search, setSearch] = useState("")

  const fetchSubscribers = useCallback(async () => {
    setLoadingSubscribers(true)
    try {
      const res = await fetch("/api/admin/newsletter/subscribers")
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data.subscribers || [])
        setStats(data.stats || { total: 0, active: 0, unsubscribed: 0 })
      }
    } catch {
      // ignore
    } finally {
      setLoadingSubscribers(false)
    }
  }, [])

  useEffect(() => { fetchSubscribers() }, [fetchSubscribers])

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

    setSending(true)
    setSendStatus("idle")
    setSendResult(null)

    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, testMode, testEmail: testMode ? testEmail : undefined }),
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

  const filteredSubscribers = subscribers.filter(s =>
    !search ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.fullName || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Newsletter</h2>
        <p className="text-gray-500 mt-1">Compose and send newsletters to your subscriber list.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-800" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total subscribers</p>
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
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.unsubscribed}</p>
              <p className="text-xs text-gray-500">Unsubscribed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose" data-testid="tab-newsletter-compose">Compose & Send</TabsTrigger>
          <TabsTrigger value="subscribers" data-testid="tab-newsletter-subscribers">Subscribers</TabsTrigger>
        </TabsList>

        {/* Compose tab */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose Newsletter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test mode toggle */}
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div>
                  <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Test Mode
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    {testMode ? "Will send only to the test email address below" : "Will send to all active subscribers"}
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
                      Send to {stats.active} Active Subscribers
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers tab */}
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
                            <Badge
                              className={sub.unsubscribedAt || sub.status !== 'active'
                                ? "bg-gray-100 text-gray-600"
                                : "bg-green-100 text-green-700"
                              }
                            >
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
      </Tabs>
    </div>
  )
}
