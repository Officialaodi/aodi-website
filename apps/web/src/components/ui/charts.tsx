"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"
import { Button } from "@/components/ui/button"
import { BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon, PieChart as PieChartIcon, Target, TrendingDown } from "lucide-react"

export type ChartType = "bar" | "line" | "area" | "pie" | "radar" | "funnel"

interface ChartData {
  [key: string]: string | number
}

interface ChartConfig {
  dataKey: string
  nameKey?: string
  color?: string
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  height?: number
  allowedTypes?: ChartType[]
  formatValue?: (value: number) => string
  formatLabel?: (label: string) => string
}

const DEFAULT_COLORS = [
  "#0F3D2E",
  "#C9A961",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
]

const CHART_TYPE_ICONS: Record<ChartType, typeof BarChart3> = {
  bar: BarChart3,
  line: LineChartIcon,
  area: AreaChartIcon,
  pie: PieChartIcon,
  radar: Target,
  funnel: TrendingDown,
}

interface ChartTypeSelectorProps {
  currentType: ChartType
  allowedTypes: ChartType[]
  onChange: (type: ChartType) => void
}

export function ChartTypeSelector({ currentType, allowedTypes, onChange }: ChartTypeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {allowedTypes.map((type) => {
        const Icon = CHART_TYPE_ICONS[type]
        return (
          <Button
            key={type}
            variant={currentType === type ? "default" : "ghost"}
            size="icon"
            onClick={() => onChange(type)}
            title={`${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}
            data-testid={`chart-type-${type}`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        )
      })}
    </div>
  )
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  formatValue?: (value: number) => string
  formatLabel?: (label: string) => string
}

function CustomTooltip({ active, payload, label, formatValue, formatLabel }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
        {formatLabel ? formatLabel(label) : label}
      </p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatValue ? formatValue(entry.value as number) : entry.value}
        </p>
      ))}
    </div>
  )
}

interface SwitchableChartProps {
  data: ChartData[]
  config: ChartConfig
  title?: string
  defaultType?: ChartType
  className?: string
}

export function SwitchableChart({
  data,
  config,
  title,
  defaultType = "bar",
  className = "",
}: SwitchableChartProps) {
  const allowedTypes = config.allowedTypes || ["bar", "line", "area", "pie"]
  const [chartType, setChartType] = useState<ChartType>(
    allowedTypes.includes(defaultType) ? defaultType : allowedTypes[0]
  )

  const {
    dataKey,
    nameKey = "name",
    color = "#0F3D2E",
    colors = DEFAULT_COLORS,
    showGrid = true,
    showLegend = false,
    showTooltip = true,
    height = 300,
    formatValue,
    formatLabel,
  } = config

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center text-gray-500 ${className}`} style={{ height: `${height}px` }}>
        No data available
      </div>
    )
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis
              dataKey={nameKey}
              tick={{ fontSize: 12 }}
              tickFormatter={formatLabel}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} className="text-gray-600 dark:text-gray-400" />
            {showTooltip && (
              <Tooltip content={<CustomTooltip formatValue={formatValue} formatLabel={formatLabel} />} />
            )}
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )

      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis
              dataKey={nameKey}
              tick={{ fontSize: 12 }}
              tickFormatter={formatLabel}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} className="text-gray-600 dark:text-gray-400" />
            {showTooltip && (
              <Tooltip content={<CustomTooltip formatValue={formatValue} formatLabel={formatLabel} />} />
            )}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis
              dataKey={nameKey}
              tick={{ fontSize: 12 }}
              tickFormatter={formatLabel}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} className="text-gray-600 dark:text-gray-400" />
            {showTooltip && (
              <Tooltip content={<CustomTooltip formatValue={formatValue} formatLabel={formatLabel} />} />
            )}
            {showLegend && <Legend />}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        )

      case "pie":
        return (
          <PieChart>
            {showTooltip && (
              <Tooltip content={<CustomTooltip formatValue={formatValue} formatLabel={formatLabel} />} />
            )}
            {showLegend && <Legend />}
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={height / 3}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: "#666", strokeWidth: 1 }}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        )

      case "radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius={height / 3} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={nameKey} tick={{ fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fontSize: 10 }} />
            {showTooltip && (
              <Tooltip content={<CustomTooltip formatValue={formatValue} formatLabel={formatLabel} />} />
            )}
            {showLegend && <Legend />}
            <Radar
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.5}
            />
          </RadarChart>
        )

      case "funnel":
        return (
          <FunnelChart>
            {showTooltip && (
              <Tooltip content={<CustomTooltip formatValue={formatValue} formatLabel={formatLabel} />} />
            )}
            {showLegend && <Legend />}
            <Funnel
              dataKey={dataKey}
              nameKey={nameKey}
              data={data}
              isAnimationActive
            >
              <LabelList position="center" fill="#fff" stroke="none" dataKey={nameKey} fontSize={12} />
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Funnel>
          </FunnelChart>
        )

      default:
        return null
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>}
        {allowedTypes.length > 1 && (
          <ChartTypeSelector currentType={chartType} allowedTypes={allowedTypes} onChange={setChartType} />
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart() as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

interface MultiSeriesChartProps {
  data: ChartData[]
  series: Array<{
    dataKey: string
    name: string
    color: string
  }>
  nameKey?: string
  title?: string
  defaultType?: "bar" | "line" | "area"
  allowedTypes?: ("bar" | "line" | "area")[]
  showGrid?: boolean
  showLegend?: boolean
  height?: number
  formatValue?: (value: number) => string
  formatLabel?: (label: string) => string
  className?: string
}

export function MultiSeriesChart({
  data,
  series,
  nameKey = "name",
  title,
  defaultType = "line",
  allowedTypes = ["bar", "line", "area"],
  showGrid = true,
  showLegend = true,
  height = 300,
  formatValue,
  formatLabel,
  className = "",
}: MultiSeriesChartProps) {
  const [chartType, setChartType] = useState<"bar" | "line" | "area">(defaultType)

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center text-gray-500 ${className}`} style={{ height: `${height}px` }}>
        No data available
      </div>
    )
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} tickFormatter={formatLabel} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip formatValue={formatValue} formatLabel={formatLabel} />} />
            {showLegend && <Legend />}
            {series.map((s) => (
              <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        )

      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} tickFormatter={formatLabel} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip formatValue={formatValue} formatLabel={formatLabel} />} />
            {showLegend && <Legend />}
            {series.map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={{ fill: s.color }}
              />
            ))}
          </LineChart>
        )

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} tickFormatter={formatLabel} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip formatValue={formatValue} formatLabel={formatLabel} />} />
            {showLegend && <Legend />}
            {series.map((s, index) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.3 - index * 0.1}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        )

      default:
        return null
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>}
        {allowedTypes.length > 1 && (
          <ChartTypeSelector
            currentType={chartType}
            allowedTypes={allowedTypes}
            onChange={(type) => setChartType(type as "bar" | "line" | "area")}
          />
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart() as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

interface DonutChartProps {
  data: ChartData[]
  dataKey: string
  nameKey?: string
  title?: string
  colors?: string[]
  height?: number
  innerRadius?: number
  showLegend?: boolean
  centerLabel?: string
  centerValue?: string | number
  formatValue?: (value: number) => string
  className?: string
}

export function DonutChart({
  data,
  dataKey,
  nameKey = "name",
  title,
  colors = DEFAULT_COLORS,
  height = 250,
  innerRadius = 60,
  showLegend = true,
  centerLabel,
  centerValue,
  formatValue,
  className = "",
}: DonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center text-gray-500 ${className}`} style={{ height: `${height}px` }}>
        No data available
      </div>
    )
  }

  return (
    <div className={className}>
      {title && <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{title}</h3>}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Tooltip
              formatter={(value: number) => (formatValue ? formatValue(value) : value)}
            />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={height / 3}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue && (
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{centerValue}</span>
            )}
            {centerLabel && <span className="text-sm text-gray-500">{centerLabel}</span>}
          </div>
        )}
      </div>
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item[nameKey] as string}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface HorizontalBarChartProps {
  data: ChartData[]
  dataKey: string
  nameKey?: string
  title?: string
  color?: string
  height?: number
  showValues?: boolean
  formatValue?: (value: number) => string
  className?: string
}

export function HorizontalBarChart({
  data,
  dataKey,
  nameKey = "name",
  title,
  color = "#0F3D2E",
  height = 300,
  showValues = true,
  formatValue,
  className = "",
}: HorizontalBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center text-gray-500 ${className}`} style={{ height: `${height}px` }}>
        No data available
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d[dataKey] as number))

  return (
    <div className={className}>
      {title && <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{title}</h3>}
      <div className="space-y-3">
        {data.map((item, index) => {
          const value = item[dataKey] as number
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                  {item[nameKey] as string}
                </span>
                {showValues && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    {formatValue ? formatValue(value) : value}
                  </span>
                )}
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
