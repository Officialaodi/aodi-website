"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  RefreshCw, Search, Mail, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Eye, MousePointerClick, Truck, AlertTriangle, Info,
} from "lucide-react"

interface EmailLog {
  id: number
  recipientEmail: string
  recipientName: string | null
  subject: string
  status: "sent" | "failed" | "pending"
  errorMessage: string | null
  brevoMessageId: string | null
  applicationId: number | null
  contactId: number | null
  templateId: number | null
  sentAt: string
  // Engagement tracking
  deliveredAt: string | null
  openedAt: string | null
  clickedAt: string | null
  bouncedAt: string | null
  bounceType: string | null
  openCount: number | null
  clickCount: number | null
  lastEventAt: string | null
  lastEventType: string | null
}

export function EmailLogsViewer() {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [limit, setLimit] = useState(50)

  useEffect(() => {
    fetchLogs()
  }, [statusFilter, limit])

  async function fetchLogs() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(limit) })
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search.trim()) params.set("search", search.trim())
      const res = await fetch(`/api/admin/email-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(Array.isArray(data) ? data : data.logs || [])
      }
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchLogs()
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
  }

  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.status === "sent").length,
    failed: logs.filter(l => l.status === "failed").length,
    opened: logs.filter(l => l.openedAt).length,
    clicked: logs.filter(l => l.clickedAt).length,
    delivered: logs.filter(l => l.deliveredAt).length,
  }

  function EngagementPills({ log }: { log: EmailLog }) {
    const pills = []

    if (log.deliveredAt) {
      pills.push(
        <span key="delivered" title={`Delivered: ${formatDate(log.deliveredAt)}`}
          className="inline-flex items-center gap-0.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
          <Truck className="w-3 h-3" /> Delivered
        </span>
      )
    }

    if (log.openedAt) {
      pills.push(
        <span key="opened" title={`First opened: ${formatDate(log.openedAt)}`}
          className="inline-flex items-center gap-0.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
          <Eye className="w-3 h-3" /> {log.openCount && log.openCount > 1 ? `Opened ×${log.openCount}` : "Opened"}
        </span>
      )
    }

    if (log.clickedAt) {
      pills.push(
        <span key="clicked" title={`First click: ${formatDate(log.clickedAt)}`}
          className="inline-flex items-center gap-0.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
          <MousePointerClick className="w-3 h-3" /> {log.clickCount && log.clickCount > 1 ? `Clicked ×${log.clickCount}` : "Clicked"}
        </span>
      )
    }

    if (log.bouncedAt) {
      pills.push(
        <span key="bounced" title={`Bounced (${log.bounceType}): ${formatDate(log.bouncedAt)}`}
          className="inline-flex items-center gap-0.5 text-xs text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3" /> {log.bounceType === "hard" ? "Hard bounce" : "Soft bounce"}
        </span>
      )
    }

    if (log.lastEventType && !["delivered", "opened", "clicked", "hard_bounce", "soft_bounce"].includes(log.lastEventType)) {
      pills.push(
        <span key="other" title={`Last event: ${log.lastEventType} — ${formatDate(log.lastEventAt)}`}
          className="inline-flex items-center gap-0.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded capitalize">
          <Info className="w-3 h-3" /> {log.lastEventType}
        </span>
      )
    }

    if (pills.length === 0 && log.status === "sent" && !log.deliveredAt) {
      pills.push(
        <span key="pending-delivery" className="text-xs text-gray-400 italic">No events yet</span>
      )
    }

    return <div className="flex flex-wrap gap-1 mt-1">{pills}</div>
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-gray-200">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-0.5">Shown</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-green-700">{stats.sent}</p>
            <p className="text-xs text-green-600 mt-0.5">Sent</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
            <p className="text-xs text-red-600 mt-0.5">Failed</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-emerald-700">{stats.delivered}</p>
            <p className="text-xs text-emerald-600 mt-0.5">Delivered</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-blue-700">{stats.opened}</p>
            <p className="text-xs text-blue-600 mt-0.5">Opened</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-purple-700">{stats.clicked}</p>
            <p className="text-xs text-purple-600 mt-0.5">Clicked</p>
          </CardContent>
        </Card>
      </div>

      {/* Webhook setup notice */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
        <div>
          <span className="font-medium">Enable real-time tracking: </span>
          In your Brevo account go to <strong>Transactional → Settings → Webhooks</strong> and add your webhook URL:
          {" "}<code className="bg-amber-100 px-1 rounded text-xs font-mono">
            {typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com"}/api/webhooks/brevo?token=YOUR_BREVO_WEBHOOK_SECRET
          </code>
          {" "}— then set <code className="bg-amber-100 px-1 rounded text-xs font-mono">BREVO_WEBHOOK_SECRET</code> in your environment secrets.
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-800" />
              Email Send History
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search recipient or subject..."
                    className="pl-9 w-64"
                    data-testid="input-email-logs-search"
                  />
                </div>
                <Button type="submit" variant="outline" size="icon" data-testid="button-email-logs-search">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-email-logs-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchLogs} data-testid="button-email-logs-refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-12 text-gray-500">Loading email logs...</p>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">No email logs found</p>
              <p className="text-sm text-gray-400 mt-1">Emails sent via the platform will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map(log => (
                <div key={log.id} className="px-4 py-3 hover:bg-gray-50" data-testid={`email-log-${log.id}`}>
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    {/* Send status icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {log.status === "sent" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : log.status === "failed" ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-amber-400" />
                      )}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate max-w-xs">
                          {log.recipientName || log.recipientEmail}
                        </span>
                        {log.recipientName && (
                          <span className="text-gray-400 text-xs">{log.recipientEmail}</span>
                        )}
                        <Badge
                          className={`text-xs flex-shrink-0 ${log.status === "sent" ? "bg-green-100 text-green-700 border-green-200" : log.status === "failed" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}
                          variant="outline"
                        >
                          {log.status}
                        </Badge>
                        {log.applicationId && (
                          <Badge variant="outline" className="text-xs">App #{log.applicationId}</Badge>
                        )}
                        {log.contactId && (
                          <Badge variant="outline" className="text-xs">Contact #{log.contactId}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{log.subject}</p>
                      <EngagementPills log={log} />
                    </div>

                    {/* Date + chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{formatDate(log.sentAt)}</span>
                      {expandedId === log.id ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedId === log.id && (
                    <div className="mt-3 pl-7 space-y-1.5 text-sm text-gray-600 border-l-2 border-gray-200 ml-2">
                      <p><span className="font-medium text-gray-700">To:</span> {log.recipientName || ""} {`<${log.recipientEmail}>`}</p>
                      <p><span className="font-medium text-gray-700">Subject:</span> {log.subject}</p>
                      <p><span className="font-medium text-gray-700">Sent at:</span> {formatDate(log.sentAt)}</p>
                      {log.brevoMessageId && (
                        <p><span className="font-medium text-gray-700">Brevo ID:</span> <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{log.brevoMessageId}</code></p>
                      )}
                      {log.deliveredAt && (
                        <p><span className="font-medium text-gray-700">Delivered:</span> {formatDate(log.deliveredAt)}</p>
                      )}
                      {log.openedAt && (
                        <p><span className="font-medium text-gray-700">First opened:</span> {formatDate(log.openedAt)} {log.openCount && log.openCount > 1 ? <span className="text-blue-600 text-xs">(×{log.openCount} total)</span> : null}</p>
                      )}
                      {log.clickedAt && (
                        <p><span className="font-medium text-gray-700">First clicked:</span> {formatDate(log.clickedAt)} {log.clickCount && log.clickCount > 1 ? <span className="text-purple-600 text-xs">(×{log.clickCount} total)</span> : null}</p>
                      )}
                      {log.bouncedAt && (
                        <p className="text-red-600"><span className="font-medium">Bounced ({log.bounceType}):</span> {formatDate(log.bouncedAt)}</p>
                      )}
                      {log.lastEventType && log.lastEventAt && !["hard_bounce", "soft_bounce"].includes(log.lastEventType) && (
                        <p><span className="font-medium text-gray-700">Last event:</span> <span className="capitalize">{log.lastEventType}</span> at {formatDate(log.lastEventAt)}</p>
                      )}
                      {log.errorMessage && (
                        <p className="text-red-600"><span className="font-medium">Error:</span> {log.errorMessage}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {logs.length > 0 && logs.length >= limit && (
            <div className="p-4 border-t flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLimit(l => l + 50)}
                data-testid="button-email-logs-load-more"
              >
                Load more
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
