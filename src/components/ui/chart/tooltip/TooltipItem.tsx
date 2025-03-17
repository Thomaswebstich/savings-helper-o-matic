
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChartConfig } from '../ChartContext'
import { getPayloadConfigFromPayload } from '../utils'
import { TooltipIndicator } from './TooltipIndicator'

interface TooltipItemProps {
  item: any
  config: ChartConfig
  nameKey?: string
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nestLabel?: boolean
  formatter?: (value: any, name: string, item: any, index: number, payload: any) => React.ReactNode
  index: number
}

export function TooltipItem({
  item,
  config,
  nameKey,
  hideIndicator = false,
  indicator = "dot",
  nestLabel,
  formatter,
  index,
}: TooltipItemProps) {
  if (!item) return null;
  
  const key = `${nameKey || item.name || item.dataKey || "value"}`
  const itemConfig = getPayloadConfigFromPayload(config, item, key)
  const indicatorColor = item.payload?.fill || item.color

  if (formatter && item?.value !== undefined && item.name) {
    return formatter(item.value, item.name, item, index, item.payload)
  }

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
        indicator === "dot" && "items-center"
      )}
    >
      {itemConfig?.icon ? (
        <itemConfig.icon />
      ) : (
        <TooltipIndicator 
          indicator={indicator} 
          hideIndicator={hideIndicator} 
          color={indicatorColor} 
        />
      )}
      <div
        className={cn(
          "flex flex-1 justify-between leading-none",
          nestLabel ? "items-end" : "items-center"
        )}
      >
        <span className="text-muted-foreground">
          {itemConfig?.label || item.name}
        </span>
        {item.value !== undefined && (
          <span className="font-mono font-medium tabular-nums text-foreground">
            {item.value.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}
