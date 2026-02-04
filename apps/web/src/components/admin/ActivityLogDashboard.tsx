"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Activity, Users, FileText, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { SwitchableChart, DonutChart, HorizontalBarChart } from "@/components/ui/charts"

interface ActivityLog {
  id: number
  entityType: string
  entityId: number | null
  action: string
  details: string | null
  performedBy: string | null
  userId: number | null
  userEmail: string | null
  metadata: string | null
  createdAt: string
}

interface Stats {
  total: number
  last24h: number
  last7d: number
  last30d: number
}

interface EntityCount {
  entityType: string
  count: number
}

interface ActionCount {
  action: string
  count: number
}

interface UserCount {
  userId: number
  userEmail: string
  performedBy: string
  count: number
}

interface AdminUser {
  id: number
  email: string
  fullName: string
}

const ENTITY_TYPES = [
  "all",
  "user",
  "role",
  "program",
  "event",
  "partner",
  "testimonial",
  "story",
  "resource",
  "trustee",
  "governance",
  "impact_metric",
  "site_setting",
  "application",
  "contact",
  "email_account",
  "email_template",
  "donation",
  "session",
]

const ACTIONS = [
  "all",
  "login",
  "logout",
  "create",
  "update",
  "delete",
  "view",
  "export",
  "send_email",
  "status_change",
  "bulk_action",
]

const ACTION_COLORS: Record<string, string> = {
  login: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  logout: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  create: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  update: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  view: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  export: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  send_email: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  status_change: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  bulk_action: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatEntityType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export function ActivityLogDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [entityCounts, setEntityCounts] = useState<EntityCount[]>([])
  const [actionCounts, setActionCounts] = useState<ActionCount[]>([])
  const [userCounts, setUserCounts] = useState<UserCount[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    entityType: "all",
    action: "all",
    userId: "all",
    startDate: "",
    endDate: "",
  })
  const pageSize = 25

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, entityRes, actionRes, userRes, usersRes] = await Promise.all([
        fetch("/api/admin/activity-logs?view=stats"),
        fetch("/api/admin/activity-logs?view=by-entity"),
        fetch("/api/admin/activity-logs?view=by-action"),
        fetch("/api/admin/activity-logs?view=by-user"),
        fetch("/api/admin/activity-logs?view=users"),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (entityRes.ok) setEntityCounts(await entityRes.json())
      if (actionRes.ok) setActionCounts(await actionRes.json())
      if (userRes.ok) setUserCounts(await userRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())

      await fetchLogs()
    } catch (error) {
      console.error("Error fetching activity data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      params.set("limit", pageSize.toString())
      params.set("offset", (page * pageSize).toString())
      
      if (filters.entityType !== "all") params.set("entityType", filters.entityType)
      if (filters.action !== "all") params.set("action", filters.action)
      if (filters.userId !== "all") params.set("userId", filters.userId)
      if (filters.startDate) params.set("startDate", filters.startDate)
      if (filters.endDate) params.set("endDate", filters.endDate)

      const response = await fetch(`/api/admin/activity-logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setTotal(data.total)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [page, filters])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold">Activity Log</h2>
        <Button
          onClick={fetchData}
          variant="outline"
          size="sm"
          disabled={loading}
          data-testid="button-refresh-activity"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-user-activity">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.last24h?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Actions today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.last7d?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.last30d?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Actions by Entity Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entityCounts.length > 0 ? (
                  <SwitchableChart
                    data={entityCounts.slice(0, 10).map(item => ({
                      name: formatEntityType(item.entityType),
                      value: item.count,
                    }))}
                    config={{
                      dataKey: "value",
                      nameKey: "name",
                      color: "#0F3D2E",
                      allowedTypes: ["bar", "pie"],
                      height: 280,
                    }}
                    defaultType="bar"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actions by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actionCounts.length > 0 ? (
                  <SwitchableChart
                    data={actionCounts.map(item => ({
                      name: item.action.replace(/_/g, " "),
                      value: item.count,
                    }))}
                    config={{
                      dataKey: "value",
                      nameKey: "name",
                      color: "#C9A961",
                      allowedTypes: ["bar", "pie"],
                      height: 280,
                    }}
                    defaultType="pie"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Users by Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userCounts.length > 0 ? (
                <SwitchableChart
                  data={userCounts.slice(0, 10).map(item => ({
                    name: item.performedBy || "Unknown",
                    value: item.count,
                  }))}
                  config={{
                    dataKey: "value",
                    nameKey: "name",
                    color: "#3B82F6",
                    allowedTypes: ["bar", "pie"],
                    height: 250,
                  }}
                  defaultType="bar"
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No user activity data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <Label>Entity Type</Label>
                  <Select
                    value={filters.entityType}
                    onValueChange={(v) => {
                      setFilters({ ...filters, entityType: v })
                      setPage(0)
                    }}
                  >
                    <SelectTrigger data-testid="select-entity-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "all" ? "All Types" : formatEntityType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select
                    value={filters.action}
                    onValueChange={(v) => {
                      setFilters({ ...filters, action: v })
                      setPage(0)
                    }}
                  >
                    <SelectTrigger data-testid="select-action">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action === "all" ? "All Actions" : action.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select
                    value={filters.userId}
                    onValueChange={(v) => {
                      setFilters({ ...filters, userId: v })
                      setPage(0)
                    }}
                  >
                    <SelectTrigger data-testid="select-user">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => {
                      setFilters({ ...filters, startDate: e.target.value })
                      setPage(0)
                    }}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => {
                      setFilters({ ...filters, endDate: e.target.value })
                      setPage(0)
                    }}
                    data-testid="input-end-date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{log.performedBy || "System"}</span>
                          {log.userEmail && (
                            <span className="text-xs text-muted-foreground">{log.userEmail}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={ACTION_COLORS[log.action] || ""}>{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatEntityType(log.entityType)}</span>
                          {log.entityId && (
                            <span className="text-xs text-muted-foreground">ID: {log.entityId}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate" title={log.details || ""}>
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {total > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} entries
                  </p>
                  <div className="flex items-center gap-2">
                    {totalPages > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={page === 0}
                          data-testid="button-prev-page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {page + 1} of {totalPages}
                        </span>
                      </>
                    )}
                    {totalPages > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={page >= totalPages - 1}
                          data-testid="button-next-page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Activity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userCounts.length > 0 ? (
                <SwitchableChart
                  data={userCounts.map(item => ({
                    name: item.performedBy || "Unknown",
                    value: item.count,
                  }))}
                  config={{
                    dataKey: "value",
                    nameKey: "name",
                    color: "#0F3D2E",
                    allowedTypes: ["bar", "pie"],
                    height: 300,
                  }}
                  defaultType="bar"
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No user activity data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Activity Details by User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Total Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userCounts.map((item) => (
                    <TableRow key={item.userId} data-testid={`row-user-${item.userId}`}>
                      <TableCell className="font-medium">{item.performedBy}</TableCell>
                      <TableCell>{item.userEmail}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{item.count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {userCounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No user activity data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
