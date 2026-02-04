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
import { Plus, RefreshCw, Trash2, Settings, CheckCircle, XCircle, Loader2, Mail } from "lucide-react"

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
  const [testResults, setTestResults] = useState<Record<number, { imap: boolean; smtp: boolean }>>({})
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
    try {
      const response = await fetch(`/api/admin/email-accounts/${id}/test`, {
        method: "POST",
      })
      if (response.ok) {
        const result = await response.json()
        setTestResults({
          ...testResults,
          [id]: { imap: result.imap.success, smtp: result.smtp.success }
        })
      }
    } catch (err) {
      console.error("Error testing account:", err)
    } finally {
      setTesting(null)
    }
  }

  const handleSync = async (id: number) => {
    setSyncing(id)
    try {
      const response = await fetch(`/api/admin/email-accounts/${id}/sync`, {
        method: "POST",
      })
      if (response.ok) {
        fetchAccounts()
      }
    } catch (err) {
      console.error("Error syncing account:", err)
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
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="py-4">
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
                    {testResults[account.id] && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1">
                          {testResults[account.id].imap ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          IMAP
                        </span>
                        <span className="flex items-center gap-1">
                          {testResults[account.id].smtp ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          SMTP
                        </span>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(account.id)}
                      disabled={testing === account.id}
                      data-testid={`button-test-${account.id}`}
                    >
                      {testing === account.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Settings className="w-4 h-4" />
                      )}
                      Test
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(account.id)}
                      disabled={syncing === account.id}
                      data-testid={`button-sync-${account.id}`}
                    >
                      {syncing === account.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
