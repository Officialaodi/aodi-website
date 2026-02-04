"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, Eye, MousePointerClick, Clock, TrendingUp, 
  Activity, Monitor, Smartphone, Tablet, Globe, 
  ArrowUpRight, ArrowDownRight, RefreshCw, BarChart3
} from "lucide-react"
import { SwitchableChart, DonutChart, HorizontalBarChart } from "@/components/ui/charts"

interface OverviewData {
  totalSessions: number
  totalPageViews: number
  totalEvents: number
  uniqueVisitors: number
  avgSessionDuration: number
  bounceRate: number
  activeNow: number
}

interface PageViewData {
  date: string
  count: number
}

interface TopPage {
  path: string
  views: number
  avgTimeOnPage: number
  avgScrollDepth: number
}

interface DeviceData {
  deviceType: string
  count: number
}

interface BrowserData {
  browser: string
  count: number
}

interface OSData {
  os: string
  count: number
}

interface ReferrerData {
  referrer: string
  count: number
}

interface EventData {
  eventType: string
  eventCategory: string
  count: number
}

interface RealtimeData {
  activeSessions: Array<{
    id: number
    visitorId: string
    deviceType: string
    browser: string
    os: string
    entryPage: string
    exitPage: string
    pageViews: number
    duration: number
    startedAt: string
  }>
  recentPageViews: Array<{
    path: string
    title: string
    createdAt: string
  }>
  activeCount: number
}

interface EngagementData {
  avgScrollDepth: number
  avgTimeOnPage: number
  totalEngagementTime: number
}

interface CountryData {
  country: string
  count: number
}

interface ContinentData {
  continent: string
  count: number
}

interface AcquisitionData {
  channel: string
  count: number
}

interface ConversionData {
  totalConversions: number
  totalValue: number
  byType: Array<{ conversionType: string; count: number; totalValue: number }>
  byName: Array<{ conversionName: string; conversionType: string; count: number; totalValue: number }>
  recent: Array<{ id: number; conversionType: string; conversionName: string; value: number; createdAt: string }>
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

export function AnalyticsDashboard() {
  const [range, setRange] = useState("7d")
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [pageViewsByDay, setPageViewsByDay] = useState<PageViewData[]>([])
  const [topPages, setTopPages] = useState<TopPage[]>([])
  const [devices, setDevices] = useState<DeviceData[]>([])
  const [browsers, setBrowsers] = useState<BrowserData[]>([])
  const [operatingSystems, setOperatingSystems] = useState<OSData[]>([])
  const [referrers, setReferrers] = useState<ReferrerData[]>([])
  const [events, setEvents] = useState<EventData[]>([])
  const [realtime, setRealtime] = useState<RealtimeData | null>(null)
  const [engagement, setEngagement] = useState<EngagementData | null>(null)
  const [countries, setCountries] = useState<CountryData[]>([])
  const [continents, setContinents] = useState<ContinentData[]>([])
  const [acquisition, setAcquisition] = useState<AcquisitionData[]>([])
  const [conversions, setConversions] = useState<ConversionData | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "pages" | "sources" | "geography" | "conversions" | "events" | "realtime">("overview")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        overviewRes,
        pageViewsRes,
        topPagesRes,
        devicesRes,
        browsersRes,
        osRes,
        referrersRes,
        eventsRes,
        realtimeRes,
        engagementRes,
        countriesRes,
        continentsRes,
        acquisitionRes,
        conversionsRes,
      ] = await Promise.all([
        fetch(`/api/admin/analytics?type=overview&range=${range}`),
        fetch(`/api/admin/analytics?type=pageviews_by_day&range=${range}`),
        fetch(`/api/admin/analytics?type=top_pages&range=${range}`),
        fetch(`/api/admin/analytics?type=devices&range=${range}`),
        fetch(`/api/admin/analytics?type=browsers&range=${range}`),
        fetch(`/api/admin/analytics?type=os&range=${range}`),
        fetch(`/api/admin/analytics?type=referrers&range=${range}`),
        fetch(`/api/admin/analytics?type=events&range=${range}`),
        fetch(`/api/admin/analytics?type=realtime&range=${range}`),
        fetch(`/api/admin/analytics?type=engagement&range=${range}`),
        fetch(`/api/admin/analytics?type=countries&range=${range}`),
        fetch(`/api/admin/analytics?type=continents&range=${range}`),
        fetch(`/api/admin/analytics?type=acquisition&range=${range}`),
        fetch(`/api/admin/analytics?type=conversions&range=${range}`),
      ])

      if (overviewRes.ok) setOverview(await overviewRes.json())
      if (pageViewsRes.ok) setPageViewsByDay(await pageViewsRes.json())
      if (topPagesRes.ok) setTopPages(await topPagesRes.json())
      if (devicesRes.ok) setDevices(await devicesRes.json())
      if (browsersRes.ok) setBrowsers(await browsersRes.json())
      if (osRes.ok) setOperatingSystems(await osRes.json())
      if (referrersRes.ok) setReferrers(await referrersRes.json())
      if (eventsRes.ok) setEvents(await eventsRes.json())
      if (realtimeRes.ok) setRealtime(await realtimeRes.json())
      if (engagementRes.ok) setEngagement(await engagementRes.json())
      if (countriesRes.ok) setCountries(await countriesRes.json())
      if (continentsRes.ok) setContinents(await continentsRes.json())
      if (acquisitionRes.ok) setAcquisition(await acquisitionRes.json())
      if (conversionsRes.ok) setConversions(await conversionsRes.json())
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
    setLoading(false)
  }, [range])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (activeTab === "realtime") {
      const interval = setInterval(async () => {
        const res = await fetch(`/api/admin/analytics?type=realtime&range=${range}`)
        if (res.ok) setRealtime(await res.json())
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [activeTab, range])

  const pageViewChartData = pageViewsByDay.map(d => ({
    name: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.count,
  }))

  const deviceChartData = devices.map(d => ({
    name: d.deviceType || "Unknown",
    value: d.count,
  }))

  const browserChartData = browsers.slice(0, 6).map(b => ({
    name: b.browser || "Unknown",
    value: b.count,
  }))

  const osChartData = operatingSystems.slice(0, 6).map(o => ({
    name: o.os || "Unknown",
    value: o.count,
  }))

  const referrerChartData = referrers.slice(0, 8).map(r => ({
    name: r.referrer ? new URL(r.referrer).hostname : "Direct",
    value: r.count,
  }))

  const countryChartData = countries.slice(0, 10).map(c => ({
    name: c.country,
    value: c.count,
  }))

  const continentChartData = continents.map(c => ({
    name: c.continent,
    value: c.count,
  }))

  const acquisitionChartData = acquisition.map(a => ({
    name: a.channel,
    value: a.count,
  }))

  const conversionTypeChartData = conversions?.byType?.map(c => ({
    name: c.conversionType,
    value: c.count,
    totalValue: Number(c.totalValue) || 0,
  })) || []

  const eventChartData = events.slice(0, 10).map(e => ({
    name: `${e.eventType}${e.eventCategory ? ` (${e.eventCategory})` : ""}`,
    value: e.count,
  }))

  const topPagesChartData = topPages.slice(0, 8).map(p => ({
    name: p.path.length > 30 ? p.path.substring(0, 30) + "..." : p.path,
    value: p.views,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#0F3D2E]" />
          <h2 className="text-xl font-semibold text-[#1F2933]">Analytics Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {realtime?.activeCount || 0} active now
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px]" data-testid="select-analytics-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} data-testid="button-refresh-analytics">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b pb-2 overflow-x-auto">
        {["overview", "pages", "sources", "geography", "conversions", "events", "realtime"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "bg-[#0F3D2E] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            data-testid={`tab-analytics-${tab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Users className="w-4 h-4" />
                  Visitors
                </div>
                <div className="text-2xl font-bold">{formatNumber(overview?.uniqueVisitors || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Eye className="w-4 h-4" />
                  Page Views
                </div>
                <div className="text-2xl font-bold">{formatNumber(overview?.totalPageViews || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Sessions
                </div>
                <div className="text-2xl font-bold">{formatNumber(overview?.totalSessions || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Avg Duration
                </div>
                <div className="text-2xl font-bold">{formatDuration(overview?.avgSessionDuration || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <ArrowDownRight className="w-4 h-4" />
                  Bounce Rate
                </div>
                <div className="text-2xl font-bold">{overview?.bounceRate || 0}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <MousePointerClick className="w-4 h-4" />
                  Events
                </div>
                <div className="text-2xl font-bold">{formatNumber(overview?.totalEvents || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Activity className="w-4 h-4" />
                  Active Now
                </div>
                <div className="text-2xl font-bold text-green-600">{overview?.activeNow || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Page Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <SwitchableChart
                  data={pageViewChartData}
                  config={{
                    dataKey: "value",
                    nameKey: "name",
                    color: "#0F3D2E",
                    allowedTypes: ["bar", "line", "area"],
                    height: 250,
                  }}
                  defaultType="bar"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={deviceChartData}
                  dataKey="value"
                  nameKey="name"
                  height={200}
                  innerRadius={50}
                  centerValue={devices.reduce((sum, d) => sum + d.count, 0)}
                  centerLabel="Total"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Average Scroll Depth</span>
                  <span className="font-semibold">{engagement?.avgScrollDepth || 0}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Average Time on Page</span>
                  <span className="font-semibold">{formatDuration(engagement?.avgTimeOnPage || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Engagement Time</span>
                  <span className="font-semibold">{formatDuration(engagement?.totalEngagementTime || 0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Browsers</CardTitle>
              </CardHeader>
              <CardContent>
                <SwitchableChart
                  data={browserChartData}
                  config={{
                    dataKey: "value",
                    nameKey: "name",
                    color: "#C9A961",
                    allowedTypes: ["bar", "pie"],
                    height: 200,
                  }}
                  defaultType="bar"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "pages" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Pages by Views</CardTitle>
            </CardHeader>
            <CardContent>
              <SwitchableChart
                data={topPagesChartData}
                config={{
                  dataKey: "value",
                  nameKey: "name",
                  color: "#0F3D2E",
                  allowedTypes: ["bar", "pie"],
                  height: 300,
                }}
                defaultType="bar"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Page Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Page</th>
                      <th className="text-right py-2 font-medium">Views</th>
                      <th className="text-right py-2 font-medium">Avg Time</th>
                      <th className="text-right py-2 font-medium">Scroll Depth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map((page, i) => (
                      <tr key={page.path} className="border-b last:border-0">
                        <td className="py-2 max-w-xs truncate" title={page.path}>
                          {page.path}
                        </td>
                        <td className="py-2 text-right">{page.views}</td>
                        <td className="py-2 text-right">{formatDuration(Math.round(Number(page.avgTimeOnPage) || 0))}</td>
                        <td className="py-2 text-right">{Math.round(Number(page.avgScrollDepth) || 0)}%</td>
                      </tr>
                    ))}
                    {topPages.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No page view data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "sources" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              <SwitchableChart
                data={referrerChartData}
                config={{
                  dataKey: "value",
                  nameKey: "name",
                  color: "#0F3D2E",
                  allowedTypes: ["bar", "pie"],
                  height: 280,
                }}
                defaultType="bar"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operating Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <SwitchableChart
                data={osChartData}
                config={{
                  dataKey: "value",
                  nameKey: "name",
                  color: "#3B82F6",
                  allowedTypes: ["bar", "pie"],
                  height: 280,
                }}
                defaultType="pie"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "geography" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SwitchableChart
                data={countryChartData}
                config={{
                  dataKey: "value",
                  nameKey: "name",
                  color: "#0F3D2E",
                  allowedTypes: ["bar", "pie"],
                  height: 300,
                }}
                defaultType="bar"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visitors by Continent</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={continentChartData}
                dataKey="value"
                nameKey="name"
                height={300}
                innerRadius={60}
                centerValue={continents.reduce((sum, c) => sum + c.count, 0)}
                centerLabel="Total Sessions"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Acquisition Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <SwitchableChart
                data={acquisitionChartData}
                config={{
                  dataKey: "value",
                  nameKey: "name",
                  color: "#10B981",
                  allowedTypes: ["bar", "pie"],
                  height: 250,
                }}
                defaultType="bar"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "conversions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Total Conversions
                </div>
                <div className="text-2xl font-bold">{formatNumber(conversions?.totalConversions || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <ArrowUpRight className="w-4 h-4" />
                  Total Value
                </div>
                <div className="text-2xl font-bold">${formatNumber(conversions?.totalValue || 0)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversions by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <SwitchableChart
                  data={conversionTypeChartData}
                  config={{
                    dataKey: "value",
                    nameKey: "name",
                    color: "#0F3D2E",
                    allowedTypes: ["bar", "pie"],
                    height: 250,
                  }}
                  defaultType="pie"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Conversion Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Name</th>
                        <th className="text-left py-2 font-medium">Type</th>
                        <th className="text-right py-2 font-medium">Count</th>
                        <th className="text-right py-2 font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversions?.byName && conversions.byName.length > 0 ? (
                        conversions.byName.map((item, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-2">{item.conversionName}</td>
                            <td className="py-2 text-gray-500 capitalize">{item.conversionType}</td>
                            <td className="py-2 text-right">{item.count}</td>
                            <td className="py-2 text-right">${formatNumber(Number(item.totalValue) || 0)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            No conversion data yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-right py-2 font-medium">Value</th>
                      <th className="text-right py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversions?.recent && conversions.recent.length > 0 ? (
                      conversions.recent.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 capitalize">{item.conversionType}</td>
                          <td className="py-2">{item.conversionName}</td>
                          <td className="py-2 text-right">${item.value || 0}</td>
                          <td className="py-2 text-right text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No recent conversions
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SwitchableChart
                data={eventChartData}
                config={{
                  dataKey: "value",
                  nameKey: "name",
                  color: "#8B5CF6",
                  allowedTypes: ["bar", "pie"],
                  height: 300,
                }}
                defaultType="bar"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Event Type</th>
                      <th className="text-left py-2 font-medium">Category</th>
                      <th className="text-right py-2 font-medium">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{event.eventType}</td>
                        <td className="py-2 text-gray-500">{event.eventCategory || "-"}</td>
                        <td className="py-2 text-right">{event.count}</td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-500">
                          No events recorded yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "realtime" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Active Visitors ({realtime?.activeCount || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Device</th>
                      <th className="text-left py-2 font-medium">Browser</th>
                      <th className="text-left py-2 font-medium">Current Page</th>
                      <th className="text-right py-2 font-medium">Pages</th>
                      <th className="text-right py-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realtime?.activeSessions.map((session) => (
                      <tr key={session.id} className="border-b last:border-0">
                        <td className="py-2 capitalize">{session.deviceType || "Unknown"}</td>
                        <td className="py-2">{session.browser || "Unknown"}</td>
                        <td className="py-2 max-w-xs truncate">{session.exitPage || session.entryPage}</td>
                        <td className="py-2 text-right">{session.pageViews}</td>
                        <td className="py-2 text-right">{formatDuration(session.duration)}</td>
                      </tr>
                    ))}
                    {(!realtime?.activeSessions || realtime.activeSessions.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          No active visitors right now
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Page Views (Last 5 minutes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {realtime?.recentPageViews.map((pv, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                    <div className="truncate max-w-md" title={pv.path}>
                      {pv.title || pv.path}
                    </div>
                    <div className="text-gray-500 text-xs whitespace-nowrap ml-4">
                      {new Date(pv.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {(!realtime?.recentPageViews || realtime.recentPageViews.length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">No recent page views</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
