
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChartConfig } from '../ChartContext'
import { getPayloadConfigFromPayload } from '../utils'

interface TooltipLabelProps {
  hideLabel: boolean
  payload: any[] | undefined
  labelKey?: string
  label?: string | React.ReactNode
  labelFormatter?: (value: any, payload: any[]) => React.ReactNode
  labelClassName?: string
  config: ChartConfig
}

export function TooltipLabel({
  hideLabel,
  payload,
  labelKey,
  label,
  labelFormatter,
  labelClassName,
  config,
}: TooltipLabelProps) {
  if (hideLabel || !payload?.length) {
    return null
  }

  const [item] = payload
  const key = `${labelKey || item.dataKey || item.name || "value"}`
  const itemConfig = getPayloadConfigFromPayload(config, item, key)
  const value =
    !labelKey && typeof label === "string"
      ? config[label as keyof typeof config]?.label || label
      : itemConfig?.label

  if (labelFormatter) {
    return (
      <div className={cn("font-medium", labelClassName)}>
        {labelFormatter(value, payload)}
      </div>
    )
  }

  if (!value) {
    return null
  }

  return <div className={cn("font-medium", labelClassName)}>{value}</div>
}
