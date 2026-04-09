"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Plus, RefreshCw, Trash2, Settings, CheckCircle, XCircle, Loader2, Mail, AlertCircle } from "lucide-react"

interface EmailAccount {
  id: number
  name: string
  email: string
  provider: string
  imapHost: string
  imapPort: number
  smtpHost: string
  smtpPort: number
  useTls: boolean
  isActive: boolean
  lastSyncAt: string | null
}

interface TestResult {
  imap: { success: boolean; error?: string }
  smtp: { success: boolean; error?: string }
  overall: boolean
}

const providerDefaults: Record<string, { imapHost: string; imapPort: number; smtpHost: string; smtpPort: number }> = {
  gmail: { imapHost: "imap.gmail.com", imapPort: 993, smtpHost: "smtp.gmail.com", smtpPort: 587 },
  outlook: { imapHost: "outlook.office365.com", imapPort: 993, smtpHost: "smtp.office365.com", smtpPort: 587 },
  cpanel: { imapHost: "", imapPort: 993, smtpHost: "", smtpPort: 465 },
  imap: { imapHost: "", imapPort: 993, smtpHost: "", smtpPort: 587 },
}

export function EmailAccountsManager() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [testing, setTesting] = useState<number | null>(null)
  const [syncing, setSyncing] = useState<number | null>(null)
  const [testResults, setTestResults] = useState<Record<number, TestResult>>({})
  const [syncMessage, setSyncMessage] = useState<Record<number, string>>({})
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    provider: "cpanel",
    imapHost: "",
    imapPort: 993,
    smtpHost: "",
    smtpPort: 465,
    username: "",
    password: "",
    useTls: true,
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/admin/email-accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (err) {
      console.error("Error fetching accounts:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleProviderChange = (provider: string) => {
    const defaults = providerDefaults[provider]
    setFormData({
      ...formData,
      provider,
      imapHost: defaults.imapHost,
      imapPort: defaults.imapPort,
      smtpHost: defaults.smtpHost,
      smtpPort: defaults.smtpPort,
    })
  }

  const handleSubmit = async () => {
    setError("")
    
    if (!formData.name || !formData.email || !formData.username || !formData.password) {
      setError("Please fill in all required fields")
      return
    }
    
    if (!formData.imapHost || !formData.smtpHost) {
      setError("IMAP and SMTP hosts are required")
      return
    }

    try {
      const response = await fetch("/api/admin/email-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchAccounts()
        setShowForm(false)
        setFormData({
          name: "",
          email: "",
          provider: "cpanel",
          imapHost: "",
          imapPort: 993,
          smtpHost: "",
          smtpPort: 465,
          username: "",
          password: "",
          useTls: true,
        })
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add account")
      }
    } catch (err) {
      setError("Failed to add account")
    }
  }

  const handleTest = async (id: number) => {
    setTesting(id)
    // Clear previous result while testing
    setTestResults(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    try {
      const response = await fetch(`/api/admin/email-accounts/${id}/test`, {
        method: "POST",
      })
      const result = await response.json()
      if (response.ok) {
        setTestResults(prev => ({ ...prev, [id]: result }))
      } else {
        setTestResults(prev => ({
          ...prev,
          [id]: {
            overall: false,
            imap: { success: false, error: result.error || "Request failed" },
            smtp: { success: false, error: result.error || "Request failed" },
          }
        }))
      }
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [id]: {
          overall: false,
          imap: { success: false, error: "Network error — could not reach server" },
          smtp: { success: false, error: "Network error — could not reach server" },
        }
      }))
    } finally {
      setTesting(null)
    }
  }

  const handleSync = async (id: number) => {
    setSyncing(id)
    setSyncMessage(prev => ({ ...prev, [id]: "" }))
    try {
      const response = await fetch(`/api/admin/email-accounts/${id}/sync`, {
        method: "POST",
      })
      const result = await response.json()
      if (response.ok) {
        fetchAccounts()
        setSyncMessage(prev => ({ ...prev, [id]: `Synced successfully — ${result.synced ?? 0} new email(s)` }))
      } else {
        setSyncMessage(prev => ({ ...prev, [id]: result.error || "Sync failed" }))
      }
    } catch (err) {
      setSyncMessage(prev => ({ ...prev, [id]: "Sync failed — network error" }))
    } finally {
      setSyncing(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this email account?")) return
    try {
      await fetch(`/api/admin/email-accounts/${id}`, { method: "DELETE" })
      fetchAccounts()
    } catch (err) {
      console.error("Error deleting account:", err)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never"
    return new Date(dateStr).toLocaleString()
  }

  if (loading) {
    return <p className="text-center py-8 text-gray-500">Loading email accounts...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Connected Email Accounts</h3>
          <p className="text-sm text-gray-500">Connect your email accounts to sync inbox with CRM contacts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} data-testid="button-add-email-account">
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Email Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Account Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Support Email"
                  data-testid="input-account-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="support@yourdomain.com"
                  data-testid="input-account-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Provider</label>
              <Select value={formData.provider} onValueChange={handleProviderChange}>
                <SelectTrigger data-testid="select-provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook / Microsoft 365</SelectItem>
                  <SelectItem value="cpanel">cPanel / Webmail</SelectItem>
                  <SelectItem value="imap">Other (IMAP/SMTP)</SelectItem>
                </SelectContent>
              </Select>
              {formData.provider === "gmail" && (
                <p className="text-xs text-amber-600 mt-1">
                  For Gmail, you need to use an App Password. Enable 2FA and create one at myaccount.google.com
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">IMAP Host *</label>
                <Input
                  value={formData.imapHost}
                  onChange={(e) => setFormData({ ...formData, imapHost: e.target.value })}
                  placeholder="mail.yourdomain.com"
                  data-testid="input-imap-host"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IMAP Port</label>
                <Input
                  type="number"
                  value={formData.imapPort}
                  onChange={(e) => setFormData({ ...formData, imapPort: parseInt(e.target.value) })}
                  data-testid="input-imap-port"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">SMTP Host *</label>
                <Input
                  value={formData.smtpHost}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                  placeholder="mail.yourdomain.com"
                  data-testid="input-smtp-host"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SMTP Port</label>
                <Input
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
                  data-testid="input-smtp-port"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Usually your full email address"
                  data-testid="input-username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Email password or app password"
                  data-testid="input-password"
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={handleSubmit} data-testid="button-save-account">
                Add Account
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No email accounts connected yet.</p>
            <p className="text-sm text-gray-400 mt-1">Add an account to sync emails with your CRM contacts.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => {
            const result = testResults[account.id]
            const isTesting = testing === account.id
            return (
              <Card key={account.id}>
                <CardContent className="py-4 space-y-3">
                  {/* Account row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        account.provider === "gmail" ? "bg-red-100" :
                        account.provider === "outlook" ? "bg-blue-100" :
                        "bg-gray-100"
                      }`}>
                        <Mail className={`w-5 h-5 ${
                          account.provider === "gmail" ? "text-red-600" :
                          account.provider === "outlook" ? "text-blue-600" :
                          "text-gray-600"
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{account.name}</h4>
                        <p className="text-sm text-gray-500">{account.email}</p>
                        <p className="text-xs text-gray-400">
                          Last synced: {formatDate(account.lastSyncAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(account.id)}
                        disabled={isTesting}
                        data-testid={`button-test-${account.id}`}
                      >
                        {isTesting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <Settings className="w-4 h-4 mr-1" />
                        )}
                        {isTesting ? "Testing…" : "Test"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(account.id)}
                        disabled={syncing === account.id}
                        data-testid={`button-sync-${account.id}`}
                      >
                        {syncing === account.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-1" />
                        )}
                        Sync
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600"
                        data-testid={`button-delete-${account.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Test result panel */}
                  {result && (
                    <div className={`rounded-lg border p-3 text-sm ${
                      result.overall
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}>
                      <div className="flex items-center gap-2 font-medium mb-2">
                        {result.overall ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={result.overall ? "text-green-800" : "text-red-800"}>
                          {result.overall
                            ? "Connection test passed — both IMAP and SMTP are working."
                            : "Connection test failed — see details below."}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        <div className={`flex items-start gap-2 rounded p-2 ${
                          result.imap.success ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {result.imap.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <p className={`font-medium ${result.imap.success ? "text-green-800" : "text-red-800"}`}>
                              IMAP (incoming mail)
                            </p>
                            {result.imap.success ? (
                              <p className="text-green-700 text-xs">Connected successfully</p>
                            ) : (
                              <p className="text-red-700 text-xs">{result.imap.error || "Connection failed"}</p>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-start gap-2 rounded p-2 ${
                          result.smtp.success ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {result.smtp.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <p className={`font-medium ${result.smtp.success ? "text-green-800" : "text-red-800"}`}>
                              SMTP (outgoing mail)
                            </p>
                            {result.smtp.success ? (
                              <p className="text-green-700 text-xs">Connected successfully</p>
                            ) : (
                              <p className="text-red-700 text-xs">{result.smtp.error || "Connection failed"}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {!result.overall && (
                        <div className="mt-2 flex items-start gap-1 text-xs text-gray-600">
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>Check that your IMAP/SMTP hosts, ports, username and password are correct. For cPanel, the host is usually your domain name (e.g. <em>mail.yourdomain.com</em>).</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sync feedback */}
                  {syncMessage[account.id] && (
                    <p className="text-xs text-gray-600 bg-gray-50 border rounded px-3 py-2">
                      {syncMessage[account.id]}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
